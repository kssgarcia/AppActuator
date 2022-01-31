from django.urls import path
from django.contrib.auth.views import LogoutView
from . import views

urlpatterns = [
    path("login/", views.Login.as_view(), name="web-login"),
    path("logout/", LogoutView.as_view(next_page="web-login"), name="web-logout"),
    path("register/", views.Register.as_view(), name="web-register"),

    path("", views.Principal, name="web-principal"),
    path("home", views.HomeList.as_view(), name="web-home"),
    path("update/<int:pk>/", views.HomeUpdate.as_view(), name="web-update"),
    path("create-inputs/", views.HomeCreate.as_view(), name="web-create"),
    path("delete/<int:pk>/", views.HomeDelete.as_view(), name="web-delete"),
    path("result/<int:pk>/", views.displayResult.as_view(), name="web-result"),
]

