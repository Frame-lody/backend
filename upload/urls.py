from django.urls import path

from . import views

# 這裡是http://localhost:8000/upload/後面的路徑
urlpatterns = [
    # Add more paths here
    path('sortable/', views.sortable, name='sortable'),
    path('music/', views.showmusic , name='showmusic'),
    path('music/<int:music_id>/', views.music_detail , name='music_detail'),
    path('insert/', views.insert, name='insert'),
    path('search/', views.search, name='search'),
    # path('celery/', views.celery, name='celery'),
    # path('start-task/', views.start_task, name='start_task'),
    # path('task-status/<str:task_id>/', views.get_task_status, name='get_task_status'),
    path('status/', views.task_status, name='task_status'),
    path('insert_structure/', views.insert_structure, name='insert_structure'),
    path('show_structure/', views.show_structure, name='show_structure'),
    path('select_music/', views.select_music, name='select_music'),
]