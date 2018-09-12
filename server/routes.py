#!/usr/bin/env python
# coding: utf-8
"""
Routes definitions
"""
import arrow
import json
import os

import bottle

from server.models import Report
from server.tools import UTC_now
from server import jsonapi


class AuthenticationError(Exception):
    pass


def check_auth():
    """
    Check authentication.

    :return: Abort and return a HTTP 403 page if authentication is not ok.
    """
    if not os.getenv('API_TOKEN'):
        return

    auth = bottle.request.headers.get('Authorization', None)
    if not auth:
        raise AuthenticationError()
    parts = auth.split()
    if parts[0].lower() != 'bearer' or parts[1] != os.getenv('API_TOKEN'):
        raise AuthenticationError()

    return


def get_reports(only_active=False):
    """
    Get reports for the reports getting routes.

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
    if only_active:
        query = query.where(
            (Report.expiration_datetime == None) |
            (Report.expiration_datetime > UTC_now())
        )
    query = query.order_by(*sorting)
    if page_number and page_size:
        query = query.paginate(page_number, page_size)

    return {
        "data": [
            r.to_json()
            for r in query
        ]
    }


@bottle.route('/api/v1/reports', ["GET", "OPTIONS"])
def get_all_reports():
    """
    API v1 GET reports route. Get all reports.

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
    return get_reports(only_active=False)


@bottle.route('/api/v1/reports/active', ["GET", "OPTIONS"])
def get_active_reports():
    """
    API v1 GET reports route. Only get active reports (those with
    ``expiration_datetime`` in the future).

    Example::

        GET /api/v1/reports/active

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
    return get_reports(only_active=True)


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

    # Check authentication
    try:
        check_auth()
    except AuthenticationError:
        return jsonapi.JsonApiError(403, "Invalid authentication.")

    try:
        payload = json.load(bottle.request.body)
    except ValueError as exc:
        return jsonapi.JsonApiError(400, "Invalid JSON payload: " + str(exc))

    try:
        r = Report(
            type=payload['type'],
            lat=payload['lat'],
            lng=payload['lng']
        )
        # Handle expiration
        if r.type in ['accident', 'gcum']:
            r.expiration_datetime = (
                arrow.get(UTC_now()).shift(hours=+1).naive
            )
        r.save()
    except KeyError as exc:
        return jsonapi.JsonApiError(400, "Invalid report payload: " + str(exc))

    return {
        "data": r.to_json()
    }


@bottle.route('/api/v1/reports/:id/upvote', ["POST", "OPTIONS"])
def upvote_report(id):
    """
    API v1 POST upvote route.

    Example::

        POST /api/v1/reports/1/upvote
    """
    # Handle CORS
    if bottle.request.method == 'OPTIONS':
        return {}

    # Check authentication
    try:
        check_auth()
    except AuthenticationError:
        return jsonapi.JsonApiError(403, "Invalid authentication.")

    r = Report.get(Report.id == id)
    if not r:
        return jsonapi.JsonApiError(404, "Invalid report id.")
    # Increase upvotes
    r.upvotes += 1
    # Update report datetime
    r.datetime = UTC_now()
    # Update expiration datetime
    if r.type in ['accident', 'gcum']:
        r.expiration_datetime = (
            arrow.get(UTC_now()).shift(hours=+1).naive
        )
    r.save()

    return {
        "data": r.to_json()
    }


@bottle.route('/api/v1/reports/:id/downvote', ["POST", "OPTIONS"])
def downvote_report(id):
    """
    API v1 POST downvote route.

    Example::

        POST /api/v1/reports/1/downvote
    """
    # Handle CORS
    if bottle.request.method == 'OPTIONS':
        return {}

    # Check authentication
    try:
        check_auth()
    except AuthenticationError:
        return jsonapi.JsonApiError(403, "Invalid authentication.")

    r = Report.get(Report.id == id)
    if not r:
        return jsonapi.JsonApiError(404, "Invalid report id.")
    r.downvotes += 1
    r.save()

    return {
        "data": r.to_json()
    }


@bottle.route('/api/v1/stats', ["GET", "OPTIONS"])
def get_stats():
    """
    API v1 GET stats about this instance.

    Example::

        GET /api/v1/states
    """
    # Handle CORS
    if bottle.request.method == 'OPTIONS':
        return {}

    nb_reports = Report.select().count()
    nb_active_reports = Report.select().where(
        (Report.expiration_datetime == None) |
        (Report.expiration_datetime > UTC_now())
    ).count()
    last_added_report_datetime = Report.select().order_by(
        Report.datetime.desc()
    ).get().datetime

    return {
        "data": {
            "nb_reports": nb_reports,
            "nb_active_reports": nb_active_reports,
            "last_added_report_datetime": last_added_report_datetime
        }
    }
