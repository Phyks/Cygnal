#!/usr/bin/env python
# coding: utf-8
import bottle

from server import routes
from server.models import db, Report


if __name__ == "__main__":
    db.connect()
    db.create_tables([Report])
    bottle.run(host='0.0.0.0', port='8081')
