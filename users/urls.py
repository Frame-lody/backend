from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    # path('sign_up/', views.sign_up)
    path('sign_up/', views.SignUpView.as_view(), name = "sign_up"),
    path('login/', views.login, name = "login"),
    path('main_page/', views.main_page, name = "main_page"),
    path('log_out/', views.log_out, name = "log_out"),
]