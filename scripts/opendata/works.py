#!/usr/bin/env python
"""
Import French opendata about works on roads.
"""
import logging
import os
import sys

SCRIPT_DIRECTORY = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.abspath(os.path.join(SCRIPT_DIRECTORY, '..', '..')))

import arrow
import pyproj
import requests

from functools import partial

from shapely.geometry import Point, shape
from shapely.ops import transform

from server.models import db, Report

level = logging.WARN
if 'DEBUG' in os.environ:
    level = logging.info
logging.basicConfig(level=level)


def preprocess_lille(data):
    for item in data:
        try:
            fields = item['fields']
            # Homogeneize start date spelling
            fields['date_debut'] = fields['date_demarrage']
            # Homogeneize geo shape
            fields['geo_shape'] = fields['geometry']
        except KeyError as exc:
            logging.warning('Invalid item in Lille data: %s.', exc)
            continue
    return data


def preprocess_lyon(data):
    out = []
    for item in data['features']:
        try:
            new_item = {
                'fields': item['properties'],
                'geometry': item['geometry'],
                'recordid': item['properties']['identifiant']
            }
            fields = new_item['fields']
            # Homogeneize start date and end date spelling
            fields['date_debut'] = fields['debutchantier']
            fields['date_fin'] = fields['finchantier']
            # Homogeneize geo shape
            fields['geo_shape'] = item['geometry']
            out.append(new_item)
        except KeyError as exc:
            logging.warning('Invalid item in Lyon data: %s.', exc)
            continue
    return out


def preprocess_montpellier(data):
    out = []
    for item in data['features']:
        try:
            new_item = {
                'fields': item['properties'],
                'geometry': item['geometry'],
                'recordid': item['properties']['numero']
            }
            fields = new_item['fields']
            # Homogeneize start date and end date spelling
            fields['date_debut'] = fields['datedebut']
            fields['date_fin'] = fields['datefin']
            # Homogeneize geo shape
            fields['geo_shape'] = item['geometry']
            out.append(new_item)
        except KeyError as exc:
            logging.warning('Invalid item in Montpellier data: %s.', exc)
            continue
    return out


def preprocess_nancy(data):
    out = []
    for item in data['features']:
        try:
            geometry = {
                'type': 'Point',
                'coordinates': [
                    item['geometry']['x'],
                    item['geometry']['y']
                ]
            }
            new_item = {
                'fields': item['attributes'],
                'geometry': geometry,
                'recordid': item['attributes']['OBJECTID']
            }
            fields = new_item['fields']
            # Homogeneize start and end date spelling
            fields['date_debut'] = arrow.get(
                float(fields['DATE_DEBUT']) / 1000
            ).isoformat()
            fields['date_fin'] = arrow.get(
                float(fields['DATE_FIN']) / 1000
            ).isoformat()
            # Homogeneize geo shape
            fields['geo_shape'] = geometry
            out.append(new_item)
        except KeyError as exc:
            logging.warning('Invalid item in Nancy data: %s.', exc)
            continue
    return out


def preprocess_rennes(data):
    out = []
    for item in data['features']:
        try:
            new_item = {
                'fields': item['properties'],
                'geometry': item['geometry'],
                'recordid': item['properties']['id']
            }
            fields = new_item['fields']
            # Homogeneize start date spelling
            fields['date_debut'] = fields['date_deb']
            # Homogeneize geo shape
            fields['geo_shape'] = item['geometry']
            out.append(new_item)
        except KeyError as exc:
            logging.warning('Invalid item in Rennes data: %s.', exc)
            continue
    return out


def preprocess_seine_saint_denis(data):
    out = []
    for item in data['features']:
        try:
            new_item = {
                'fields': item['properties'],
                'geometry': item['geometry'],
                'recordid': item['properties']['id']
            }
            fields = new_item['fields']
            # Homogeneize geo shape
            fields['geo_shape'] = item['geometry']
            out.append(new_item)
        except KeyError as exc:
            logging.warning('Invalid item in Seine-Saint-Denis data: %s.', exc)
            continue
    return out


def preprocess_sicoval(data):
    for item in data:
        fields = item['fields']
        try:
            # Homogeneize start date and end date spelling
            fields['date_debut'] = fields['startdate']
            fields['date_fin'] = fields['enddate']
            # Homogeneize geo shape
            fields['geo_shape'] = fields['geoshape2']
        except KeyError as exc:
            logging.warning('Invalid item in Sicoval data: %s.', exc)
            continue
    return data


def preprocess_toulouse(data):
    for item in data:
        try:
            fields = item['fields']
            # Homogeneize start date and end date spelling
            fields['date_debut'] = fields['datedebut']
            fields['date_fin'] = fields['datefin']
        except KeyError as exc:
            logging.warning('Invalid item in Toulouse data: %s.', exc)
            continue
    return data


def preprocess_versailles(data):
    out = []
    for item in data['features']:
        try:
            new_item = {
                'fields': item['properties'],
                'geometry': item['geometry'],
                'recordid': item['properties']['OBJECTID']
            }
            fields = new_item['fields']
            # Homogeneize start date and end date spelling
            fields['date_debut'] = fields['STARTDATE']
            fields['date_fin'] = fields['ENDDATE']
            # Homogeneize geo shape
            fields['geo_shape'] = item['geometry']
            out.append(new_item)
        except KeyError as exc:
            logging.warning('Invalid item in Versailles data: %s.', exc)
            continue
    return out


MIN_DISTANCE_REPORT_DETAILS = 40  # Distance in meters, same as in constants.js
OPENDATA_URLS = {
    # Work in Lille
    "lille": {
        "preprocess": preprocess_lille,
        "url": "https://opendata.lillemetropole.fr/explore/dataset/troncons-de-voirie-impactes-par-des-travaux-en-temps-reel/download/?format=json&timezone=Europe/Berlin"
    },
    # Work in Lyon
    "lyon": {
        "preprocess": preprocess_lyon,
        "url": "https://download.data.grandlyon.com/wfs/grandlyon?SERVICE=WFS&VERSION=2.0.0&outputformat=GEOJSON&maxfeatures=30&request=GetFeature&typename=pvo_patrimoine_voirie.pvochantierperturbant&SRSNAME=urn:ogc:def:crs:EPSG::4171",
    },
    # Work in Montpellier
    "montpellier": {
        "preprocess": preprocess_montpellier,
        "url": "http://data.montpellier3m.fr/sites/default/files/ressources/MMM_MMM_Chantiers.json"
    },
    # Work in Nancy
    "nancy": {
        "preprocess": preprocess_nancy,
        "url": "https://geoservices.grand-nancy.org/arcgis/rest/services/public/VOIRIE_Info_Travaux_Niveau/MapServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson"
    },
    # Work in Paris
    "paris": {
        "preprocess": None,
        "url": "https://opendata.paris.fr/explore/dataset/chantiers-perturbants/download/?format=json&timezone=Europe/Berlin",
    },
    # Work in Rennes
    "rennes": {
        "preprocess": preprocess_rennes,
        "url": "http://travaux.data.rennesmetropole.fr/api/roadworks?epsg=4326"
    },
    # Work in Seine-Saint-Denis
    "seine-saint-denis": {
        "preprocess": preprocess_seine_saint_denis,
        "url": "https://geo.data.gouv.fr/api/geogw/services/5779810963f06a3a8e81541b/feature-types/C1296/download?format=GeoJSON&projection=WGS84"
    },
    # Work in Sicoval (South of Toulouse)
    "sicoval": {
        "preprocess": preprocess_sicoval,
        "url": "https://data.opendatasoft.com/explore/dataset/travauxincidents@sicoval-haute-garonne/download/?format=json&timezone=Europe/Berlin"
    },
    # Work in Toulouse
    "toulouse": {
        "preprocess": preprocess_toulouse,
        "url": "https://data.toulouse-metropole.fr/explore/dataset/chantiers-en-cours/download/?format=json&timezone=Europe/Berlin",
    },
    # Work in Versailles
    "versailles": {
        "preprocess": preprocess_versailles,
        "url": "https://www.data.gouv.fr/en/datasets/r/16f90f14-7896-4463-bc35-9809b55c2c1b"
    },
}
REPORT_TYPE = 'interrupt'

# Projection from WGS84 (GPS) to Lambert93 (for easy buffering of polygons)
project = partial(
    pyproj.transform,
    pyproj.Proj(init='epsg:4326'),  # source coordinates system
    pyproj.Proj(init='epsg:2154')  # destination coordinates system
)


def process_opendata(name, data, report_type=REPORT_TYPE):
    # Coordinates of current reports in db, as shapely Points in Lambert93
    current_reports_points = []
    for report in Report.select().where(Report.type == REPORT_TYPE):
        current_reports_points.append(
            transform(project, Point(report.lng, report.lat))
        )

    for item in data:
        try:
            fields = item['fields']
            geometry = shape(item['geometry'])
            position = geometry.centroid  # Report position

            # Check that the work is currently being done
            now = arrow.now('Europe/Paris')
            start_date = arrow.get(fields['date_debut'])
            end_date = arrow.get(fields['date_fin'])
            if not (start_date < now < end_date):
                logging.info(
                    'Ignoring record %s, work not currently in progress.',
                    item['recordid']
                )
                continue

            # Check if this precise position is already in the database
            if transform(project, position) in current_reports_points:
                logging.info(
                    ('Ignoring record %s, a similar report is already in '
                        'the database.'),
                    item['recordid']
                )
                continue
            # Check no similar reports is nearby
            if 'geo_shape' in fields:
                geo_shape = shape(fields['geo_shape'])
            else:
                geo_shape = geometry
            geo_shape = transform(project, geo_shape)
            overlap_area = geo_shape.buffer(MIN_DISTANCE_REPORT_DETAILS)
            is_already_inserted = False
            for report_point in current_reports_points:
                if report_point.within(geo_shape):
                    # A similar report is already there
                    is_already_inserted = True
                    logging.info(
                        ('Ignoring record %s, a similar report is already in '
                         'the database.'),
                        item['recordid']
                    )
                    break
            if is_already_inserted:
                # Skip this report if a similar one is nearby
                continue

            # Get the position of the center of the item
            lng, lat = position.x, position.y
            # Compute expiration datetime
            expiration_datetime = end_date.replace(microsecond=0).naive

            # Add the report to the db
            logging.info('Adding record %s to the database.', item['recordid'])
            Report.create(
                type=report_type,
                expiration_datetime=expiration_datetime,
                lat=lat,
                lng=lng
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
            r = requests.get(item['url'])
            data = r.json()
        except (requests.RequestException, ValueError) as exc:
            logging.warning('Error while fetching data for %s: %s.',
                            name, exc)
            continue

        if item['preprocess']:
            data = item['preprocess'](data)

        process_opendata(name, data)
