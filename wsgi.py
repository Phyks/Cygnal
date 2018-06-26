# coding: utf-8
"""
Expose a WSGI-compatible application to serve with a webserver.
"""
from __future__ import absolute_import, print_function, unicode_literals

import bottle

from server.__main__ import init


init()
application = app = bottle.default_app()
