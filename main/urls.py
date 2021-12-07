from django.urls import path
from . import views

urlpatterns = [
    path("", views.Home, name="web-home"),
    path("register/", views.Register, name="web-register"),
]
