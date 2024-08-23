from django.urls import path

from . import views

# 這裡是http://localhost:8000/upload/後面的路徑
urlpatterns = [
    # Add more paths here
    # path('sortable/', views.sortable, name='sortable'),
    path('test/', views.test, name='test'),
    path('adjust/', views.adjust, name='adjust'),
]