import os
from celery import Celery
from django.conf import settings
# 設置環境變量 DJANGO_SETTINGS_MODULE
os.environ.setdefault('DJANGO_SETTINGS_MODULE','framelody_backend.settings')
# 創建實例
app = Celery("framelody_backend")
app.config_from_object('django.conf:settings')
# 查找在 INSTALLED_APPS 設置的異步任務
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)