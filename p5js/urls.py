from django.urls import path

from . import views

# 這裡是http://localhost:8000/p5js/後面的路徑
urlpatterns = [
    # Add more paths here
    # path('sortable/', views.sortable, name='sortable'),
    path('test/', views.test, name='test'),
    path('<str:task_id>/adjust/<str:order>', views.adjust, name='adjust'),
    path('<str:task_id>/adjust/<str:order>/select_mode/', views.select_mode, name='select_mode'),
    path('<str:task_id>/music_part/', views.music_part, name='music_part'),
    path('<str:task_id>/pay/', views.pay, name='pay'),
    path('<str:task_id>/show/', views.show, name='show'),
    # path('<str:task_id>/', views.view_task, name='view_task'),
    path('update-segment-color/', views.update_segment_color, name='update_segment_color'),
    path('update-sketch/', views.update_sketch, name='update_sketch'),
    path('update-bpm/', views.update_bpm, name='update_bpm'),
    path('check_task_status/<str:task_id>/', views.check_task_status, name='check_task_status'),
    path('processing/', views.processing, name='processing'),
]