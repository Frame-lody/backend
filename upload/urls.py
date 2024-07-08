from django.urls import path
from . import views

urlpatterns = [
    # Add more paths here
    path('sortable/', views.sortable, name='sortable'),
    path('insert/', views.insert, name='insert'),
    path('search/', views.search, name='search'),
]