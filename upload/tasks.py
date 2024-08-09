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

@shared_task(bind=True)
def long_running_task(self):
    task_status, created = TaskStatus.objects.get_or_create(task_id=self.request.id)
    task_status.status = 'IN_PROGRESS'
    task_status.save()

    try:
        time.sleep(10)
        task_status.status = 'COMPLETED'
        task_status.result = "Task completed"
        task_status.save()
        return "Task completed"
    except Exception as e:
        task_status.status = 'FAILED'
        task_status.result = str(e)
        task_status.save()
        raise Ignore()
