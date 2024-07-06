"""
URL configuration for framelody_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

from upload import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home),
    path('p5/', views.p5),
    path('readFile/<str:musicid>/', views.readFile), # 動態路由
    # path('hi/<username>/', views.hiname),      # 傳遞字串參數 username
    # path('age/<int:year>/', views.age),        # 傳遞數值參數 year
    # path('hello/', views.hello_view),
    # path('accounts/', include('django.contrib.auth.urls')) # 使用 Django 內建的登入登出頁面
    path('users/', include('users.urls')),
    path('upload/', include('upload.urls')),
]+static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)


# 僅在開發環境下使用這個設置
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
