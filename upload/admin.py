from django.contrib import admin

# Register your models here.
from .models import music, TaskStatus, AudioAnalysis
admin.site.register(music)
admin.site.register(TaskStatus)
admin.site.register(AudioAnalysis)