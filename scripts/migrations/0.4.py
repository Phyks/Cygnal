#!/usr/bin/env python
"""
Database migration from < 0.3 to 0.3 version.
"""
import os
import sys

import peewee

SCRIPT_DIRECTORY = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.abspath(os.path.join(SCRIPT_DIRECTORY, '..', '..')))

from playhouse.migrate import *

from server.models import db, Report
from server.tools import UTC_now


def run_migration():
    if type(db) == peewee.SqliteDatabase:
        migrator = SqliteMigrator(db)
    elif type(db) == peewee.MySQLDatabase:
        migrator = MySQLMigrator(db)
    elif type(db) == peewee.PostgresqlDatabase:
        migrator = PostgresqlMigrator(db)
    else:
        return

    migrate(
        migrator.add_column(
            'report', 'source',
            peewee.CharField(max_length=255)
        ),
    )
    query = Report.select()
    for report in query:
        report.source = 'unknown'
        report.save()


if __name__ == '__main__':
    db.connect()
    run_migration()
