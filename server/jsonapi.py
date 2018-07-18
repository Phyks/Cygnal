#!/usr/bin/env python
# coding: utf-8
"""
Helpers to implement a JSON API with Bottle.
"""
import datetime
import json
import re

import bottle

FILTER_RE = re.compile(r"filter\[([A-z0-9_]+)\]")


class DateAwareJSONEncoder(json.JSONEncoder):
    """
    Extend the default JSON encoder to serialize datetimes to iso strings.
    """
    def default(self, o):  # pylint: disable=locally-disabled,E0202
        if isinstance(o, (datetime.date, datetime.datetime)):
            return o.isoformat()
        return json.JSONEncoder.default(self, o)


@bottle.hook('after_request')
def enable_cors():
    """
    Add CORS headers at each request.
    """
    # The str() call is required as we import unicode_literal and WSGI
    # headers list should have plain str type.
    bottle.response.headers[str('Access-Control-Allow-Origin')] = str('*')
    bottle.response.headers[str('Access-Control-Allow-Methods')] = str(
        'PUT, GET, POST, DELETE, OPTIONS, PATCH'
    )
    bottle.response.headers[str('Access-Control-Allow-Headers')] = str(
        'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token, '
        'Authorization'
    )


def JsonApiError(error_code, error_str):
    """
    Return an HTTP error with a JSON payload.

    :param error_code: HTTP error code to return.
    :param error_str: Error as a string.
    :returns: Set correct response parameters and returns JSON-serialized error
        content.
    """
    bottle.response.status = error_code
    bottle.response.content_type = "application/json"
    return json.dumps(dict(detail=error_str, status=error_code))



def JsonApiParseQuery(query, model, default_sorting=None):
    """
    Implementing JSON API spec for filtering, sorting and paginating results.

    :param query: A Bottle query dict.
    :param model: Database model used in this query.
    :param default_sorting: Optional field to sort on if no sort options are
        passed through parameters.
    :return: A tuple of filters, page number, page size (items per page) and
        sorting to apply.
    """
    # Handle filtering according to JSON API spec
    filters = []
    for param in query:
        filter_match = FILTER_RE.match(param)
        if not filter_match:
            continue
        field = getattr(model, filter_match.group(1))
        value = query[filter_match.group(0)]
        filters.append(field == value)

    # Handle pagination according to JSON API spec
    page_number, page_size = 0, None
    try:
        if 'page[size]' in query:
            page_size = int(query['page[size]'])
            assert page_size > 0
        if 'page[number]' in query:
            page_number = int(query['page[number]'])
            assert page_number >= 0
    except (AssertionError, ValueError):
        raise ValueError("Invalid pagination provided.")

    # Handle sorting according to JSON API spec
    sorting = []
    if 'sort' in query:
        for index in query['sort'].split(','):
            try:
                sort_field = getattr(model, index.lstrip('-'))
            except AttributeError:
                raise ValueError(
                    "Invalid sorting key provided: {}.".format(index)
                )
            if index.startswith('-'):
                sort_field = sort_field.desc()
            sorting.append(sort_field)
    # Default sorting options
    if not sorting and default_sorting:
        try:
            sorting.append(getattr(model, default_sorting))
        except AttributeError:
            raise ValueError(
                "Invalid default sorting key provided: {}.".format(
                    default_sorting
                )
            )

    return filters, page_number, page_size, sorting
