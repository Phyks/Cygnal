#!/usr/bin/env python
# coding: utf-8

import json

import arrow
import bottle
import peewee

db = peewee.SqliteDatabase('reports.db')


class Report(peewee.Model):
    type = peewee.CharField(max_length=255)
    lat = peewee.DoubleField()
    lng = peewee.DoubleField()
    datetime = peewee.DateTimeField(
        default=arrow.utcnow().replace(microsecond=0)
    )

    class Meta:
        database = db


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
        'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'
    )


@bottle.route('/api/v1/reports', ["POST", "OPTIONS"])
def postReport():
    """
    Add a new report in database.
    """
    if bottle.request.method == 'OPTIONS':
        return {}

    try:
        payload = json.load(bottle.request.body)
    except ValueError:
        bottle.abort(400, "Invalid JSON payload.")

    try:
        Report.create(
            type=payload['type'],
            lat=payload['lat'],
            lng=payload['lng']
        )
    except KeyError:
        bottle.abort(400, "Invalid JSON payload.")

    return {
        "status": "ok"
    }


if __name__ == "__main__":
    db.connect()
    db.create_tables([Report])
    bottle.run(host='0.0.0.0', port='8081')
