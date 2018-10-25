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


def preprocess_loiret(data):
    out = []
    for item in data['features']:
        try:
            if 'paths' in item['geometry']:
                paths = item['geometry']['paths']
            else:
                paths = [
                    [
                        [item['geometry']['x'], item['geometry']['y']]
                    ]
                ]
            for path in paths:
                if len(path) == 1:
                    geometry = {
                        'type': 'Point',
                        'coordinates': path[0]
                    }
                else:
                    geometry = {
                        'type': 'LineString',
                        'coordinates': path
                    }
                new_item = {
                    'fields': item['attributes'],
                    'geometry': geometry,
                    'recordid': item['attributes']['OBJECTID']
                }
                fields = new_item['fields']
                # Homogeneize start and end date spelling
                fields['date_debut'] = arrow.get(
                    float(fields['STARTDATE']) / 1000
                ).isoformat()
                fields['date_fin'] = arrow.get(
                    float(fields['ENDDATE']) / 1000
                ).isoformat()
                # Homogeneize geo shape
                fields['geo_shape'] = geometry
                out.append(new_item)
        except KeyError as exc:
            logging.warning('Invalid item in Loiret data: %s.', exc)
            if RAISE_ON_EXCEPT:
                raise
            continue
    return out


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
            if RAISE_ON_EXCEPT:
                raise
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
            if RAISE_ON_EXCEPT:
                raise
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
            if RAISE_ON_EXCEPT:
                raise
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
            if RAISE_ON_EXCEPT:
                raise
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
            if RAISE_ON_EXCEPT:
                raise
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
            if RAISE_ON_EXCEPT:
                raise
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
            if RAISE_ON_EXCEPT:
                raise
            continue
    return data


def preprocess_versailles(data):
    out = []
    for item in data['features']:
        try:
            if 'paths' in item['geometry']:
                paths = item['geometry']['paths']
            else:
                paths = [
                    [
                        [item['geometry']['x'], item['geometry']['y']]
                    ]
                ]
            for path in paths:
                if len(path) == 1:
                    geometry = {
                        'type': 'Point',
                        'coordinates': path[0]
                    }
                else:
                    geometry = {
                        'type': 'LineString',
                        'coordinates': path
                    }
                new_item = {
                    'fields': item['attributes'],
                    'geometry': geometry,
                    'recordid': item['attributes']['OBJECTID']
                }
                fields = new_item['fields']
                # Homogeneize start and end date spelling
                fields['date_debut'] = arrow.get(
                    float(fields['STARTDATE']) / 1000
                ).isoformat()
                fields['date_fin'] = arrow.get(
                    float(fields['ENDDATE']) / 1000
                ).isoformat()
                # Homogeneize geo shape
                fields['geo_shape'] = geometry
                out.append(new_item)
        except KeyError as exc:
            logging.warning('Invalid item in Versailles data: %s.', exc)
            if RAISE_ON_EXCEPT:
                raise
            continue
    return out


MIN_DISTANCE_REPORT_DETAILS = 40  # Distance in meters, same as in constants.js
OPENDATA_URLS = {
    # Work in Lille
    # https://opendata.lillemetropole.fr/explore/dataset/troncons-de-voirie-impactes-par-des-travaux-en-temps-reel/
    # Licence Ouverte (Etalab) : https://www.etalab.gouv.fr/wp-content/uploads/2014/05/Licence_Ouverte.pdf
    "lille": {
        "preprocess": preprocess_lille,
        "url": "https://opendata.lillemetropole.fr/explore/dataset/troncons-de-voirie-impactes-par-des-travaux-en-temps-reel/download/?format=json&timezone=Europe/Berlin"
    },
    # Work in Loiret
    # https://open-loiret.opendata.arcgis.com/datasets/74c95548589d4ddeb3fcf094f7d61a67_1?geometry=0.609%2C47.694%2C3.245%2C48.016&orderBy=BLOCKNM
    # Custom license
    "loiret": {
        "preprocess": preprocess_loiret,
        "url": "https://services2.arcgis.com/IEzPuQhCEVCtkVvT/arcgis/rest/services/Travaux_routiers/FeatureServer/1/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson",
    },
    # Work in Lyon
    # https://data.grandlyon.com/equipements/chantiers-perturbants-de-la-mftropole-de-lyon/
    # Licence Ouverte : https://download.data.grandlyon.com/files/grandlyon/LicenceOuverte.pdf
    "lyon": {
        "preprocess": preprocess_lyon,
        "url": "https://download.data.grandlyon.com/wfs/grandlyon?SERVICE=WFS&VERSION=2.0.0&outputformat=GEOJSON&maxfeatures=30&request=GetFeature&typename=pvo_patrimoine_voirie.pvochantierperturbant&SRSNAME=urn:ogc:def:crs:EPSG::4171",
    },
    # Work in Montpellier
    # http://data.montpellier3m.fr/dataset/chantiers-genants-de-montpellier
    # Licence ODbL : http://opendefinition.org/licenses/odc-odbl/
    "montpellier": {
        "preprocess": preprocess_montpellier,
        "url": "http://data.montpellier3m.fr/sites/default/files/ressources/MMM_MMM_Chantiers.json"
    },
    # Work in Nancy
    # http://opendata.grandnancy.eu/jeux-de-donnees/detail-dune-fiche-de-donnees/?tx_icsoddatastore_pi1%5Bkeywords%5D=travaux&tx_icsoddatastore_pi1%5Buid%5D=63&tx_icsoddatastore_pi1%5BreturnID%5D=447
    # Licence libre / Licence Ouverte (Etalab)
    "nancy": {
        "preprocess": preprocess_nancy,
        "url": "https://geoservices.grand-nancy.org/arcgis/rest/services/public/VOIRIE_Info_Travaux_Niveau/MapServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson"
    },
    # Work in Paris
    # https://opendata.paris.fr/explore/dataset/chantiers-perturbants/
    # Licence ODbL : http://opendatacommons.org/licenses/odbl/
    "paris": {
        "preprocess": None,
        "url": "https://opendata.paris.fr/explore/dataset/chantiers-perturbants/download/?format=json&timezone=Europe/Berlin",
    },
    # Work in Rennes
    # http://travaux.data.rennesmetropole.fr/
    # Usage libre / Licence ODbL : http://opendatacommons.org/licenses/odbl/
    "rennes": {
        "preprocess": preprocess_rennes,
        "url": "http://travaux.data.rennesmetropole.fr/api/roadworks?epsg=4326"
    },
    # Work in Seine-Saint-Denis
    # https://geo.data.gouv.fr/fr/datasets/12504debb9bb73e717ad710a746541ebf817d98c
    # Licence Ouverte : https://www.etalab.gouv.fr/licence-ouverte-open-licence
    "seine-saint-denis": {
        "preprocess": preprocess_seine_saint_denis,
        "url": "https://geo.data.gouv.fr/api/geogw/services/5779810963f06a3a8e81541b/feature-types/C1296/download?format=GeoJSON&projection=WGS84"
    },
    # Work in Sicoval (South of Toulouse)
    # https://data.sicoval.fr/explore/dataset/travauxincidents/
    # Licence Ouverte v2.0 (Etalab) : https://www.etalab.gouv.fr/wp-content/uploads/2017/04/ETALAB-Licence-Ouverte-v2.0.pdf
    "sicoval": {
        "preprocess": preprocess_sicoval,
        "url": "https://data.sicoval.fr/explore/dataset/travauxincidents/download/?format=json&timezone=Europe/Berlin"
    },
    # Work in Toulouse
    # https://data.toulouse-metropole.fr/explore/dataset/chantiers-en-cours/
    # Licence ODbL : http://opendatacommons.org/licenses/odbl/
    "toulouse": {
        "preprocess": preprocess_toulouse,
        "url": "https://data.toulouse-metropole.fr/explore/dataset/chantiers-en-cours/download/?format=json&timezone=Europe/Berlin",
    },
    # Work in Versailles
    # Licence Ouverte (Etalab)
    "versailles-blocks": {  # http://www-cavgp.opendata.arcgis.com/datasets/f58091424f38424ba04a2d3933dc979e_0
        "preprocess": preprocess_versailles,
        "url": "https://services2.arcgis.com/YECJCCLQCtaylXWh/arcgis/rest/services/Waze/FeatureServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson"
    },
    "versailles-closures": {  # http://www-cavgp.opendata.arcgis.com/datasets/f58091424f38424ba04a2d3933dc979e_1
        "preprocess": preprocess_versailles,
        "url": "https://services2.arcgis.com/YECJCCLQCtaylXWh/arcgis/rest/services/Waze/FeatureServer/1/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson"
    },
    "versailles-detours": {  # http://www-cavgp.opendata.arcgis.com/datasets/f58091424f38424ba04a2d3933dc979e_2
        "preprocess": preprocess_versailles,
        "url": "https://services2.arcgis.com/YECJCCLQCtaylXWh/arcgis/rest/services/Waze/FeatureServer/1/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson"
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
    active_reports_from_db = Report.select().where(
        # Load reports from db of the current type
        (Report.type == REPORT_TYPE) &
        (
            # Either with an expiration_datetime in the future
            (
                (Report.expiration_datetime != None) &
                (Report.expiration_datetime > UTC_now())
            ) |
            # Or without expiration_datetime but which are still active (shown
            # on the map)
            (
                (Report.expiration_datetime == None) &
                (Report.downvotes < REPORT_DOWNVOTES_THRESHOLD)
            )
        )
    )
    for report in active_reports_from_db:
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
