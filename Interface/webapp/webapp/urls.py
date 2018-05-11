
from django.conf.urls import url, include
from django.contrib import admin
from comm import views


urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', views.index),
    url(r'^index/', views.post),
    url(r'^monitor/(\w+)', views.monitor),
    url(r'^delete/(\w+)', views.delete_Module),
    url(r'^run/(\w+)', views.exec_Module),
    url(r'^skwissh/', include('skwissh.urls')),
    url(r'^monitor/', include('monitor.urls', namespace='monitor'))

]
