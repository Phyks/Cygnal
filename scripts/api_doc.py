#!/usr/bin/env python
import os
import sys

import bottle

SCRIPT_DIRECTORY = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.abspath(os.path.join(SCRIPT_DIRECTORY, '..')))

import server.routes

app_routes = [x for x in bottle.default_app().routes]
for route in app_routes:
    if route.method == "OPTIONS":
        # Ignore CORS handling
        continue
    print(route.rule)
    print(''.join('=' for _ in route.rule))
    print(route.callback.__doc__)
    print('')
