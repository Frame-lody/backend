# from celery import shared_task
# import time

# @shared_task
# def long_running_task():
#     time.sleep(10)  # 模擬長時間
#     return '任務完成'


from celery import shared_task
import time
from .models import TaskStatus
from celery.exceptions import Ignore
from essentia.standard import (MonoLoader, TensorflowPredict2D,
                               TensorflowPredictMusiCNN)
from django.conf import settings
import os

@shared_task(bind=True)
def long_running_task(self, musicid, user_id, music_name):
    task_status, created = TaskStatus.objects.get_or_create(task_id=self.request.id, user=user_id, music_name=music_name)
    task_status.status = 'IN_PROGRESS'
    task_status.save()

    try:
        # =======For Ham: 把code放在這======

        # 去定義essentia model路徑，從settings.py裡面拿
        essentia_path = settings.ESSENTIA_PATH

        # 這裡可以跑essentia的code
        # os.path.join(settings.MEDIA_ROOT, musicid) 是音樂檔案的路徑
        # os.path.join(essentia_path, 'msd-musicnn-1.pb') 是模型的路徑
        audio = MonoLoader(filename=os.path.join(settings.MEDIA_ROOT, musicid), sampleRate=48000, resampleQuality=4)()
        embedding_model = TensorflowPredictMusiCNN(graphFilename=os.path.join(essentia_path, 'msd-musicnn-1.pb'), output='model/dense/BiasAdd')
        embeddings = embedding_model(audio)

        model = TensorflowPredict2D(graphFilename=os.path.join(essentia_path, 'deam-msd-musicnn-2.pb'), output='model/Identity')
        predictions = model(embeddings)

        # =======到這裡結束，請注意把你的結果存成str，到task_status.result======

        task_status.status = 'COMPLETED'
        task_status.result = str(predictions)
        task_status.save()
        return "Task completed"
    except Exception as e:
        task_status.status = 'FAILED'
        task_status.result = str(e)
        task_status.save()
        raise Ignore()
