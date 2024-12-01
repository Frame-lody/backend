from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


# Create your models here.

class TaskStatus(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True) # 這個音樂是哪個使用者上傳的
    task_id = models.CharField(max_length=255, unique=True, primary_key=True)
    music_name = models.CharField(max_length=255, null=True)
    status = models.CharField(max_length=50)
    result = models.JSONField(null=True, blank=True)
    bpm = models.FloatField(null=True, blank=True)
    # segments = models.JSONField(null=True, blank=True)
    genre = models.CharField(max_length=50, null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.task_id


class Segment(models.Model):
    task_status = models.ForeignKey(
        TaskStatus,
        on_delete=models.CASCADE,
        related_name="segments"
    )  # 外鍵連接到 TaskStatus，若 TaskStatus 被刪，則相關段落也刪除
    order = models.PositiveIntegerField(default=0)  # 段落順序
    start = models.FloatField(default=0)  # 段落開始時間
    end = models.FloatField(default=0)  # 段落結束時間
    duration = models.FloatField(default=0)  # 段落持續時間
    bpm = models.FloatField(default=0)  # 段落速度
    color = models.JSONField()  # 段落顏色
    label = models.CharField(max_length=50, default="")  # 段落標籤
    sketch = models.CharField(max_length=255, default="")  # 段落 Sketch

    class Meta:
        unique_together = ('task_status', 'order')  # 確保每個 task_status 的段落順序唯一
        ordering = ['order']  # 順序按 `order` 排列

    # Ensure that when a TaskStatus is deleted, related Segments are also deleted
    def delete(self, *args, **kwargs):
        self.segments.all().delete()
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"Task {self.task_status.task_id} - Segment {self.order} ({self.label})"


class AudioAnalysis(models.Model):
    music_name = models.CharField(max_length=255)
    bpm = models.IntegerField()
    segments = models.JSONField()

    def __str__(self):
        return self.music_name

class music(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE) # 這個音樂是哪個使用者上傳的
    data = models.JSONField() # 這個音樂的資料
    last_modified = models.DateTimeField(default=timezone.now) # 最後修改時間

    def save(self, *args, **kwargs): # 每次存檔時，都會更新最後修改時間
        self.last_modified = timezone.now() #
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.last_modified}"