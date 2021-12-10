from django.urls import path
from . import views

urlpatterns = [
    path("login/", views.Login.as_view(), name="web-login"),
    path("register/", views.Register, name="web-register"),

    path("", views.HomeList.as_view(), name="web-home"),
    path("inputs/<int:pk>/", views.HomeDetail.as_view(), name="web-detail"),
    path("update/<int:pk>/", views.HomeUpdate.as_view(), name="web-update"),
    path("create-inputs/", views.HomeCreate.as_view(), name="web-create"),
    path("delete/<int:pk>/", views.HomeDelete.as_view(), name="web-delete"),
    path("result/<int:pk>/", views.displayResult.as_view(), name="web-result"),
]

