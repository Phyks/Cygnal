#!/usr/bin/env python
"""
Import French opendata about works on roads.
"""
import datetime
import json
import logging
import os
import sys

SCRIPT_DIRECTORY = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.abspath(os.path.join(SCRIPT_DIRECTORY, '..', '..')))

import arrow
import pyproj
import requests

from functools import partial

from shapely.geometry import (LineString, MultiPolygon, MultiLineString,
                              MultiPoint, Point)
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


def preprocess_hauts_de_seine(data):
    out = []
    for item in data:
        try:
            fields = item['fields']
            new_item = {
                'fields': fields,
                'geometry': {
                    'type': 'Point',
                    # Use lng, lat
                    'coordinates': fields['geo_point_2d'][::-1]
                },
                'recordid': item['recordid'],
                'source': 'opendata-hauts-de-seine'
            }
            new_fields = new_item['fields']
            # Guess start date / end date
            # If the item is in the data, it should be valid for the current
            # trimester.
            now = datetime.datetime.now()
            new_fields['date_debut'] = arrow.get(
                datetime.datetime(
                    now.year,
                    max(1, min((now.month // 3) * 3, 12)),
                    1
                )
            ).isoformat()
            new_fields['date_fin'] = arrow.get(
                datetime.datetime(
                    now.year,
                    max(1, min((now.month // 3 + 1) * 3, 12)),
                    1
                )
            ).isoformat()
            out.append(new_item)
        except KeyError as exc:
            logging.warning(
                'Invalid item %s in Hauts-de-Seine data: %s.',
                item.get('recordid', '?'),
                exc
            )
            continue
    return out


def preprocess_lille(data):
    out = []
    for item in data:
        try:
            fields = item['fields']
            new_item = {
                'fields': fields,
                'geometry': {
                    'type': 'Point',
                    # Use lng, lat
                    'coordinates': fields['geo_point_2d'][::-1]
                },
                'recordid': item['recordid'],
                'source': 'opendata-lille'
            }
            new_fields = new_item['fields']
            # Homogeneize geo_shape
            new_fields['geo_shape'] = new_item['geometry']
            # Homogeneize start date spelling
            new_fields['date_debut'] = new_fields['date_demarrage']
            out.append(new_item)
        except KeyError as exc:
            logging.warning(
                'Invalid item %s in Lille data: %s.',
                item.get('recordid', '?'),
                exc
            )
            continue
    return out


def preprocess_loiret(data):
    out = []
    if not 'features' in data:
        logging.warning('Invalid data for Loiret.')
        return out

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
            # In Loiret, multiple paths are for multiple LineStrings
            for path in paths:
                if len(path) == 1:
                    geo_shape = {
                        'type': 'Point',
                        'coordinates': path[0]
                    }
                else:
                    geo_shape = {
                        'type': 'LineString',
                        'coordinates': path
                    }
                new_item = {
                    'fields': item['attributes'],
                    'geometry': shape(geo_shape).centroid,
                    'recordid': item['attributes']['OBJECTID'],
                    'source': 'opendata-loiret'
                }
                new_fields = new_item['fields']
                # Homogeneize geo_shape
                new_fields['geo_shape'] = geo_shape
                # Homogeneize start and end date spelling
                new_fields['date_debut'] = arrow.get(
                    float(new_fields['STARTDATE']) / 1000
                ).isoformat()
                new_fields['date_fin'] = arrow.get(
                    float(new_fields['ENDDATE']) / 1000
                ).isoformat()
                out.append(new_item)
        except KeyError as exc:
            logging.warning(
                'Invalid item %s in Loiret data: %s.',
                item.get('attributes', {}).get('OBJECTID', '?'),
                exc
            )
            if RAISE_ON_EXCEPT:
                raise
            continue
    return out


def preprocess_lyon(data):
    out = []
    if not 'features' in data:
        logging.warning('Invalid data for Lyon.')
        return out

    for item in data['features']:
        try:
            new_item = {
                'fields': item['properties'],
                'geometry': shape(item['geometry']).centroid,
                'recordid': item['properties']['identifiant'],
                'source': 'opendata-lyon'
            }
            new_fields = new_item['fields']
            # Homogeneize geo_shape
            new_fields['geo_shape'] = item['geometry']
            # Homogeneize start date and end date spelling
            new_fields['date_debut'] = new_fields['debutchantier']
            new_fields['date_fin'] = new_fields['finchantier']
            out.append(new_item)
        except KeyError as exc:
            logging.warning(
                'Invalid item %s in Lyon data: %s.',
                item.get('properties', {}).get('identifiant', '?'),
                exc
            )
            if RAISE_ON_EXCEPT:
                raise
            continue
    return out


def preprocess_montpellier(data):
    out = []
    if not 'features' in data:
        logging.warning('Invalid data for Montpellier.')
        return out

    for item in data['features']:
        try:
            new_item = {
                'fields': item['properties'],
                'geometry': shape(item['geometry']).centroid,
                'recordid': item['properties']['numero'],
                'source': 'opendata-montpellier'
            }
            new_fields = new_item['fields']
            # Homogeneize geo_shape
            new_fields['geo_shape'] = item['geometry']
            # Homogeneize start date and end date spelling
            new_fields['date_debut'] = new_fields['datedebut']
            new_fields['date_fin'] = new_fields['datefin']
            out.append(new_item)
        except KeyError as exc:
            logging.warning(
                'Invalid item %s in Montpellier data: %s.',
                item.get('properties', {}).get('numero', '?'),
                exc
            )
            if RAISE_ON_EXCEPT:
                raise
            continue
    return out


def preprocess_nancy(data):
    out = []
    if not 'features' in data:
        logging.warning('Invalid data for Nancy.')
        return out

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
                'recordid': item['attributes']['OBJECTID'],
                'source': 'opendata-nancy'
            }
            new_fields = new_item['fields']
            # Homogeneize geo_shape
            new_fields['geo_shape'] = geometry
            # Homogeneize start and end date spelling
            if not new_fields['DATE_DEBUT'] or not new_fields['DATE_FIN']:
                # Invalid start / end date
                continue
            new_fields['date_debut'] = arrow.get(
                float(new_fields['DATE_DEBUT']) / 1000
            ).isoformat()
            new_fields['date_fin'] = arrow.get(
                float(new_fields['DATE_FIN']) / 1000
            ).isoformat()
            out.append(new_item)
        except KeyError as exc:
            logging.warning(
                'Invalid item %s in Nancy data: %s.',
                item.get('attributes', {}).get('OBJECTID', '?'),
                exc
            )
            if RAISE_ON_EXCEPT:
                raise
            continue
    return out


def preprocess_paris(data):
    out = []
    for item in data:
        try:
            new_item = {
                'fields': item['fields'],
                'geometry': item['geometry'],
                'recordid': item['recordid'],
                'source': 'opendata-paris',
            }
            out.append(new_item)
        except KeyError as exc:
            logging.warning(
                'Invalid item %s in Paris data: %s.',
                item.get('recordid', '?'),
                exc
            )
            if RAISE_ON_EXCEPT:
                raise
            continue
    return out


def preprocess_rennes(data):
    out = []
    if not 'features' in data:
        logging.warning('Invalid data for Rennes.')
        return out

    for item in data['features']:
        try:
            new_item = {
                'fields': item['properties'],
                'geometry': shape(item['geometry']),
                'recordid': item['properties']['id'],
                'source': 'opendata-rennes'
            }
            new_fields = new_item['fields']
            # Homogeneize geo_shape
            new_fields['geo_shape'] = item['geometry']
            # Homogeneize start date spelling
            new_fields['date_debut'] = new_fields['date_deb']
            out.append(new_item)
        except KeyError as exc:
            logging.warning(
                'Invalid item %s in Rennes data: %s.',
                item.get('properties', {}).get('id', '?'),
                exc
            )
            if RAISE_ON_EXCEPT:
                raise
            continue
    return out


def preprocess_seine_saint_denis(data):
    out = []
    if not 'features' in data:
        logging.warning('Invalid data for Seine-Saint-Denis.')
        return out

    for item in data['features']:
        try:
            new_item = {
                'fields': item['properties'],
                'geometry': shape(item['geometry']).centroid,
                'recordid': item['properties']['id'],
                'source': 'opendata-seine_saint_denis'
            }
            # Homogeneize geo_shape
            new_item['fields']['geo_shape'] = item['geometry']
            out.append(new_item)
        except KeyError as exc:
            logging.warning(
                'Invalid item %s in Seine-Saint-Denis data: %s.',
                item.get('properties', {}).get('id', '?'),
                exc
            )
            if RAISE_ON_EXCEPT:
                raise
            continue
    return out


def preprocess_sicoval(data):
    out = []

    if 'error' in data:
        logging.warning('Invalid data for Sicoval.')
        return out

    for item in data:
        try:
            new_item = {
                'fields': item['fields'],
                'geometry': item['geometry'],
                'recordid': item['recordid'],
                'source': 'opendata-sicoval'
            }
            new_fields = new_item['fields']
            # Homogeneize geo_shape
            new_fields['geo_shape'] = new_fields['geoshape2']
            # Homogeneize start date and end date spelling
            new_fields['date_debut'] = new_fields['startdate']
            new_fields['date_fin'] = new_fields['enddate']
            out.append(new_item)
        except KeyError as exc:
            logging.warning(
                'Invalid item %s in Sicoval data: %s.',
                item.get('recordid', '?'),
                exc
            )
            if RAISE_ON_EXCEPT:
                raise
            continue
    return out


def preprocess_toulouse(data):
    out = []
    for item in data:
        try:
            new_item = {
                'fields': item['fields'],
                'geometry': item['geometry'],
                'recordid': item['recordid'],
                'source': 'opendata-toulouse'
            }
            new_fields = new_item['fields']
            # Homogeneize geo_shape
            new_fields['geo_shape'] = item['geometry']
            # Homogeneize start date and end date spelling
            new_fields['date_debut'] = new_fields['datedebut']
            new_fields['date_fin'] = new_fields['datefin']
            out.append(new_item)
        except KeyError as exc:
            logging.warning(
                'Invalid item %s in Toulouse data: %s.',
                item.get('recordid', '?'),
                exc
            )
            if RAISE_ON_EXCEPT:
                raise
            continue
    return out


def preprocess_versailles(data):
    out = []
    if not 'features' in data:
        logging.warning('Invalid data for Versailles.')
        return out

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
            # In Versailles, multiple paths are for multiple LineStrings
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
                    'geometry': shape(geometry).centroid,
                    'recordid': item['attributes']['OBJECTID'],
                    'source': 'opendata-versailles'
                }
                new_fields = new_item['fields']
                # Homogeneize geo_shape
                new_fields['geo_shape'] = geometry
                # Homogeneize start and end date spelling
                new_fields['date_debut'] = arrow.get(
                    float(new_fields['STARTDATE']) / 1000
                ).isoformat()
                new_fields['date_fin'] = arrow.get(
                    float(new_fields['ENDDATE']) / 1000
                ).isoformat()
                out.append(new_item)
        except KeyError as exc:
            logging.warning(
                'Invalid item %s in Versailles data: %s.',
                item.get('attributes', {}).get('OBJECTID', '?'),
                exc
            )
            if RAISE_ON_EXCEPT:
                raise
            continue
    return out


MIN_DISTANCE_REPORT_DETAILS = 40  # Distance in meters, same as in constants.js
OPENDATA_URLS = {
    # Work in Hauts de Seine
    # https://opendata.hauts-de-seine.fr/explore/dataset/travaux-sur-la-voirie-departementale-lignes/information/
    # Licence Ouverte (Etalab) : https://www.etalab.gouv.fr/wp-content/uploads/2014/05/Licence_Ouverte.pdf
    "hauts-de-seine": {
        "preprocess": preprocess_hauts_de_seine,
        "url": "https://opendata.hauts-de-seine.fr/explore/dataset/travaux-sur-la-voirie-departementale-lignes/download/?format=json&timezone=Europe/Berlin",
    },
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
        "preprocess": preprocess_paris,
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
        "url": "https://geoportail93.fr/SERV/DATA/?TYPENAME=1570&FORMAT=GEOJSON&COL=id;titre&FORMAT=GEOJSON&COL=ALL&MODE=2"
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

    for item in data:
        try:
            fields = item['fields']

            # Check that the work is currently being done
            now = arrow.now('Europe/Paris')
            if fields['date_debut']:
                start_date = arrow.get(fields['date_debut'].replace('/', '-'))
            else:
                # Defaults to now if start date is unknown
                start_date = arrow.get(now)
            if fields['date_fin']:
                end_date = arrow.get(fields['date_fin'].replace('/', '-'))
            else:
                # Defaults to in a week if start date is unknown
                end_date = arrow.get(now).shift(days=+7)
            if not (start_date < now < end_date):
                logging.info(
                    'Ignoring record %s, work not currently in progress.',
                    item['recordid']
                )
                continue

            # Report geographical shape
            if 'geo_shape' in fields:
                maybe_multi_geo_shape = shape(fields['geo_shape'])
            else:
                maybe_multi_geo_shape = shape(item['geometry'])

            geo_shapes = []
            if (
                isinstance(maybe_multi_geo_shape, MultiPolygon)
                or isinstance(maybe_multi_geo_shape, MultiPoint)
            ):
                # Split MultiPolygon into multiple Polygon
                # Same for MultiPoint
                positions = [
                    p.centroid
                    for p in maybe_multi_geo_shape
                ]
                geo_shapes = [
                    p
                    for p in maybe_multi_geo_shape
                ]
            elif isinstance(maybe_multi_geo_shape, MultiLineString):
                # Split MultiLineString into multiple LineString
                positions = [
                    p.interpolate(0.5, normalized=True)
                    for p in maybe_multi_geo_shape
                ]
                geo_shapes = [
                    p
                    for p in maybe_multi_geo_shape
                ]
            elif isinstance(maybe_multi_geo_shape, LineString):
                # LineString, interpolate midpoint
                positions = [
                    maybe_multi_geo_shape.interpolate(0.5, normalized=True)
                ]
                geo_shapes = [maybe_multi_geo_shape]
            else:
                # Polygon or Point
                positions = [
                    maybe_multi_geo_shape.centroid
                ]
                geo_shapes = [maybe_multi_geo_shape]

            for (geo_shape, position) in zip(geo_shapes, positions):
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
                overlap_area = transform(project, geo_shape).buffer(
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

                # Get the position of the center of the item
                lng, lat = position.x, position.y
                # Compute expiration datetime
                expiration_datetime = end_date.replace(microsecond=0).naive

                # Add the report to the db
                logging.info('Adding record %s to the database.',
                             item['recordid'])
                Report.create(
                    type=report_type,
                    expiration_datetime=expiration_datetime,
                    lat=lat,
                    lng=lng,
                    source=item['source'],
                    shape_geojson=json.dumps(mapping(geo_shape))
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
