from django.urls import path
from . import views

urlpatterns = [
    path("",views.Home, name="web-home"),
    path("result/",views.HomeResult, name="web-result"),
]
