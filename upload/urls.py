from django.urls import path
from . import views

urlpatterns = [
    # Add more paths here
    path('music/', views.showmusic , name='showmusic'),
    path('music/<int:music_id>/', views.music_detail , name='music_detail'),
    path('insert/', views.insert, name='insert'),
    path('search/', views.search, name='search'),
]