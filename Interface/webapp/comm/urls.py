
from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^/index/', views.post),
    url(r'^/', views.index),
]
