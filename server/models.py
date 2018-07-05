#!/usr/bin/env python
# coding: utf-8
"""
Models and database definition
"""
import os

import arrow
import bottle
import peewee
from playhouse.db_url import connect
from playhouse.shortcuts import model_to_dict

db = connect(os.environ.get('DATABASE', 'sqlite:///reports.db'))


@bottle.hook('before_request')
def _connect_db():
    db.connect()


@bottle.hook('after_request')
def _close_db():
    if not db.is_closed():
        db.close()


class BaseModel(peewee.Model):
    """
    Common base class for all models
    """
    class Meta:
        database = db


class Report(BaseModel):
    """
    A report object
    """
    type = peewee.CharField(max_length=255)
    lat = peewee.DoubleField()
    lng = peewee.DoubleField()
    datetime = peewee.DateTimeField(
        default=lambda: arrow.utcnow().replace(microsecond=0).datetime
    )
    is_open = peewee.BooleanField(default=True)
    upvotes = peewee.IntegerField(default=0)
    downvotes = peewee.IntegerField(default=0)

    def to_json(self):
        return {
            "type": "reports",
            "id": self.id,
            "attributes": {
                k: v for k, v in model_to_dict(self).items()
                if k != "id"
            }
        }
