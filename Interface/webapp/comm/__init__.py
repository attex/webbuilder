from __future__ import absolute_import, unicode_literals

# This will make sure the app is always imported when
# Django starts so that shared_task will use this app.
from .celery import app as celery_app

__all__ = ['celery_app']

[
  {
    "model": "comm.Device",
    "pk": 1,
    "fields": {
      "deviceid": 'device-esp-001',
      "path": '/dev/ttyUSB0:/dev/ttyUSB0',
      "platform": 'ESP8266',

    }
  },
  {
    "model": "comm.Device",
    "pk": 2,
    "fields": {
      "deviceid": 'device-ras-001',
      "path": '/bin/usb/usbtyy3',
      "platform": 'RaspberryPi3',

    }
  },
  {
    "model": "comm.Device",
    "pk": 3,
    "fields": {
      "deviceid": 'device-xia-001',
      "path": 'otherdata',
      "platform": 'Xiaomi SDJQ00RR1',

    }
  },
  # more test model instances to follow.
]
