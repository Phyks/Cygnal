#!/usr/bin/env python
import json
import sys

locale = json.loads(sys.stdin.read())

nested_json = {}
for key, value in locale.items():
    if not value:
        continue
    split_key = key.split('.')
    d = nested_json
    for key2 in split_key[:-1]:
        try:
            d[key2]
        except KeyError:
            d[key2] = {}
        d = d[key2]
    d[split_key[-1]] = value
    d = nested_json

print(json.dumps(d, sort_keys=True, indent=4, separators=(',', ': ')))
