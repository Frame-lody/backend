from django.db import models
from django.contrib.auth.models import User
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