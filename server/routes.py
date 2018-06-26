#!/usr/bin/env python
# coding: utf-8
"""
Routes definitions
"""
import json

import bottle

from server.models import Report
from server import jsonapi


@bottle.route('/api/v1/reports', ["GET", "OPTIONS"])
def get_reports():
    """
    API v1 GET reports route.

    Example::

        GET /api/v1/reports

    .. note::

        Filtering can be done through the ``filter`` GET param, according
        to JSON API spec (http://jsonapi.org/recommendations/#filtering).

    .. note::

        By default no pagination is done. Pagination can be forced using
        ``page[size]`` to specify a number of items per page and
        ``page[number]`` to specify which page to return. Pages are numbered
        starting from 0.

    .. note::

        Sorting can be handled through the ``sort`` GET param, according to
        JSON API spec (http://jsonapi.org/format/#fetching-sorting).

    :return: The available reports objects in a JSON ``data`` dict.
    """
    # Handle CORS
    if bottle.request.method == 'OPTIONS':
        return {}

    # Handle filtering, pagination and sorting
    try:
        filters, page_number, page_size, sorting = jsonapi.JsonApiParseQuery(
            bottle.request.query,
            Report,
            default_sorting='id'
        )
    except ValueError as exc:
        return jsonapi.JsonApiError(400, "Invalid parameters: " + str(exc))

    # Query
    query = Report.select()
    if filters:
        query = query.where(*filters)
    query = query.order_by(*sorting)
    if page_number and page_size:
        query = query.paginate(page_number, page_size)

    return {
        "data": [
            r.to_json()
            for r in query
        ]
    }


@bottle.route('/api/v1/reports', ["POST", "OPTIONS"])
def post_report():
    """
    API v1 POST reports route.

    Example::

        POST /api/v1/reports
        {
            "type": "toto",
            "lat": 32,
            "lng": 27
        }
    """
    # Handle CORS
    if bottle.request.method == 'OPTIONS':
        return {}

    try:
        payload = json.load(bottle.request.body)
    except ValueError as exc:
        return jsonapi.JsonApiError(400, "Invalid JSON payload: " + str(exc))

    try:
        r = Report.create(
            type=payload['type'],
            lat=payload['lat'],
            lng=payload['lng']
        )
    except KeyError as exc:
        return jsonapi.JsonApiError(400, "Invalid report payload: " + str(exc))

    return {
        "data": r.to_json()
    }
