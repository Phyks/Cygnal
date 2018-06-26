#!/usr/bin/env python
# coding: utf-8
"""
Models and database definition
"""
import arrow
import peewee
from playhouse.shortcuts import model_to_dict

db = peewee.SqliteDatabase('reports.db')


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

    def to_json(self):
        return {
            "type": "reports",
            "id": self.id,
            "attributes": {
                k: v for k, v in model_to_dict(self).items()
                if k != "id"
            }
        }
