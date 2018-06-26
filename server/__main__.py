#!/usr/bin/env python
# coding: utf-8
import functools
import json
import os

import bottle

from server import routes
from server.jsonapi import DateAwareJSONEncoder
from server.models import db, Report


if __name__ == "__main__":
    db.connect()
    db.create_tables([Report])

    # Use DateAwareJSONEncoder to dump JSON strings
    # From http://stackoverflow.com/questions/21282040/bottle-framework-how-to-return-datetime-in-json-response#comment55718456_21282666.  pylint: disable=locally-disabled,line-too-long
    bottle.install(
        bottle.JSONPlugin(
            json_dumps=functools.partial(json.dumps, cls=DateAwareJSONEncoder)
        )
    )
    bottle.run(
      host=os.environ.get('HOST', '127.0.0.1'),
      port=int(os.environ.get('PORT', '8081'))
    )
