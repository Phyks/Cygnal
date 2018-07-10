#!/usr/bin/env python
# coding: utf-8
import os
import sys
SCRIPT_DIRECTORY = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.abspath(os.path.join(SCRIPT_DIRECTORY, '..')))

import arrow

from server.models import db, Report

if __name__ == "__main__":
    db.connect()
    one_hour_ago = arrow.utcnow().shift(hours=-1).datetime
    nb = Report.delete().where(
        ((Report.type == 'accident') | (Report.type == 'gcum')) &
        (Report.datetime < one_hour_ago)
    ).execute()
    print("%d accident/GCUM reports purged." % nb)
    if not db.is_closed():
        db.close()
