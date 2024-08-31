from django.urls import path

from . import views

# 這裡是http://localhost:8000/p5js/後面的路徑
urlpatterns = [
    # Add more paths here
    # path('sortable/', views.sortable, name='sortable'),
    path('test/', views.test, name='test'),
    path('adjust/', views.adjust, name='adjust'),
    path('select_mode/', views.select_mode, name='select_mode'),
    path('music_part/', views.music_part, name='music_part'),
    path('pay/', views.pay, name='pay'),
    path('<str:task_id>/', views.view_task, name='view_task'),
]