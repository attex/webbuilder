# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

class Device(models.Model):
    deviceid = models.CharField(max_length=200)
    path = models.CharField(max_length=250)
    platform = models.CharField(max_length=200)

class Module(models.Model):
    moduleid = models.CharField(max_length=200)
    modulename = models.CharField(max_length=200)
    containerid = models.CharField(max_length=200)
    containertag = models.CharField(max_length=200)
    filepath = models.CharField(max_length=200)
    deviceid = models.ForeignKey(Device, on_delete=models.CASCADE)
    status = models.CharField(max_length=200)

class Log(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    message = models.CharField(max_length=300)
    state = models.CharField(max_length=200)
    
