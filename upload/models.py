from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


# Create your models here.
class music(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE) # 這個音樂是哪個使用者上傳的
    data = models.JSONField() # 這個音樂的資料
    last_modified = models.DateTimeField(default=timezone.now) # 最後修改時間

    def save(self, *args, **kwargs): # 每次存檔時，都會更新最後修改時間
        self.last_modified = timezone.now() #
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.last_modified}"


class TaskStatus(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True) # 這個音樂是哪個使用者上傳的
    task_id = models.CharField(max_length=255, unique=True)
    music_name = models.CharField(max_length=255, null=True)
    status = models.CharField(max_length=50)
    result = models.TextField(null=True, blank=True)
    bpm = models.FloatField(null=True, blank=True)
    segments = models.JSONField(null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.task_id


class AudioAnalysis(models.Model):
    music_name = models.CharField(max_length=255)
    bpm = models.IntegerField()
    segments = models.JSONField()

    def __str__(self):
        return self.music_name