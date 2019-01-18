#!/usr/bin/env python
# coding: utf-8
"""
Import French opendata about traffic on roads.
"""
import io
import json
import logging
import os
import sys
import zipfile

SCRIPT_DIRECTORY = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.abspath(os.path.join(SCRIPT_DIRECTORY, '..', '..')))

import arrow
import pyproj
import requests

from functools import partial
from lxml import etree

from shapely.geometry import Point
from shapely.geometry import mapping, shape
from shapely.ops import transform

from server.models import db, Report
from server.tools import UTC_now

level = logging.WARN
RAISE_ON_EXCEPT = False
if 'DEBUG' in os.environ:
    level = logging.INFO
if 'RAISE_ON_EXCEPT' in os.environ:
    RAISE_ON_EXCEPT = True
logging.basicConfig(level=level)

# Same as in src/constants.js
REPORT_DOWNVOTES_THRESHOLD = 1
GML_NAMESPACES = {
    'gml': 'http://www.opengis.net/wfs',
}

# Get an API key from https://data.bordeaux-metropole.fr/key.php
BORDEAUX_API_KEY = os.environ.get('BORDEAUX_API_KEY', None)


def process_bordeaux(url):
    # Requires an API key
    if not BORDEAUX_API_KEY:
        return []

    try:
        r = requests.get(url, params={
            'key': BORDEAUX_API_KEY,
            'service': 'WFS',
            'version': '1.0.0',
            'request': 'GetFeature',
            'typeNames': 'CI_TRAFI_L',
        })
    except (requests.RequestException, ValueError) as exc:
        logging.warning('Error while fetching data for %s: %s.',
                        name, exc)
        return []

    xml = etree.fromstring(r.content)
    items = []

    for feature in xml.findall('.//{http://www.opengis.net/gml}featureMember'):
        CI_TRAFI_L = feature.find(
            './/{http://data.bordeaux-metropole.fr/wfs}CI_TRAFI_L'
        )
        fields = {}

        # Fill-in fields
        fields['id'] = CI_TRAFI_L.find(
            './/{http://data.bordeaux-metropole.fr/wfs}GID'
        ).text
        fields['datetime'] = arrow.get(CI_TRAFI_L.find(
            './/{http://data.bordeaux-metropole.fr/wfs}HEURE'
        ).text).isoformat()
        fields['state'] = CI_TRAFI_L.find(
            './/{http://data.bordeaux-metropole.fr/wfs}ETAT'
        ).text
        fields['way'] = CI_TRAFI_L.find(
            './/{http://data.bordeaux-metropole.fr/wfs}TYPEVOIE'
        ).text

        # Get geometry-related items
        linestring = CI_TRAFI_L.find(
            './/{http://data.bordeaux-metropole.fr/wfs}geometry'
            '//{http://www.opengis.net/gml}LineString'
        )
        coordinates = [
            [float(x) for x in item.split(',')]
            for item in linestring.find(
                './/{http://www.opengis.net/gml}coordinates'
            ).text.split()
        ]
        srs = linestring.attrib.get('srsName')

        project = partial(
            pyproj.transform,
            pyproj.Proj(init=srs),  # source coordinates system
            pyproj.Proj(init='epsg:4326')  # destination coordinates system
        )
        wgs84_points = [
            transform(project, Point(*item))
            for item in coordinates
        ]

        items.append({
            'fields': fields,
            'geometry': {
                'type': 'LineString',
                'coordinates': [
                    [point.x, point.y]
                    for point in wgs84_points
                ],
            },
            'recordid': fields.get('id'),
            'source': 'opendata-bordeaux',
        })

    return items


MIN_DISTANCE_REPORT_DETAILS = 40  # Distance in meters, same as in constants.js
OPENDATA_URLS = {
    # Traffic in Bordeaux
    # http://data.bordeaux-metropole.fr/data.php?layer=CI_TRAFI_L
    # Licence ODbL : https://data.bordeaux-metropole.fr/pdf/ODbL_fr.pdf
    "bordeaux": {
        "process": process_bordeaux,
        "url": "https://data.bordeaux-metropole.fr/wfs",
    },
}
REPORT_TYPE = 'traffic'

# Projection from WGS84 (GPS) to Lambert93 (for easy buffering of polygons)
project = partial(
    pyproj.transform,
    pyproj.Proj(init='epsg:4326'),  # source coordinates system
    pyproj.Proj(init='epsg:2154')  # destination coordinates system
)


def process_opendata(name, data, report_type=REPORT_TYPE):
    # Coordinates of current reports in db, as shapely Points in Lambert93
    current_reports_points = []
    active_reports_from_db = Report.select().where(
        # Load reports from db of the current type
        (Report.type == report_type) &
        (
            # Either with an expiration_datetime in the future
            (
                (Report.expiration_datetime is not None) &
                (Report.expiration_datetime > UTC_now())
            ) |
            # Or without expiration_datetime but which are still active (shown
            # on the map)
            (
                (Report.expiration_datetime is None) &
                (Report.downvotes < REPORT_DOWNVOTES_THRESHOLD)
            )
        )
    )
    for report in active_reports_from_db:
        current_reports_points.append(
            transform(project, Point(report.lng, report.lat))
        )

    # TODO: Remove reports which are no longer valid

    # Filter out unknown states and roads without traffic
    data = [
        x
        for x in data
        if x['fields'].get('state') not in ['FLUIDE', 'INCONNU']
    ]

    for item in data:
        try:
            fields = item['fields']

            # Get geometry and position
            geometry = shape(item['geometry'])
            position = geometry.centroid
            lng, lat = position.x, position.y

            # Check if this precise position is already in the database
            if transform(project, position) in current_reports_points:
                logging.info(
                    ('Ignoring record %s, a similar report is already in '
                        'the database.'),
                    item['recordid']
                )
                continue
            # Check no similar reports is within the area of the report, up
            # to the report distance.
            overlap_area = transform(project, geometry).buffer(
                MIN_DISTANCE_REPORT_DETAILS
            )
            is_already_inserted = False
            for report_point in current_reports_points:
                if report_point.within(overlap_area):
                    # A similar report is already there
                    is_already_inserted = True
                    logging.info(
                        ('Ignoring record %s, a similar report is already '
                            'in the database.'),
                        item['recordid']
                    )
                    break
            if is_already_inserted:
                # Skip this report if a similar one is nearby
                continue

            # Expires in an hour
            expiration_datetime = (
                # TODO: Check the datetime value in the opendata file
                arrow.get(fields['datetime']).shift(hours=+1).naive
            )

            # Add the report to the db
            logging.info('Adding record %s to the database.',
                         item['recordid'])
            Report.create(
                type=report_type,
                expiration_datetime=expiration_datetime,
                lat=lat,
                lng=lng,
                source=item['source'],
                shape_geojson=json.dumps(mapping(geometry))
            )
        except KeyError as exc:
            logging.warning(
                'Invalid record %s in %s, missing key: %s',
                item.get('recordid', '?'),
                name,
                exc
            )


if __name__ == '__main__':
    db.connect()
    for name, item in OPENDATA_URLS.items():
        logging.info('Processing opendata from %s', name)
        try:
            if item['process']:
                data = item['process'](item['url'])
            else:
                r = requests.get(item['url'])
                data = r.json()
        except (requests.RequestException, ValueError) as exc:
            logging.warning('Error while fetching data for %s: %s.',
                            name, exc)
            continue

        process_opendata(name, data)
