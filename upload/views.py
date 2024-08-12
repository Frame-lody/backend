import io
import os
import sys

import matplotlib.pyplot as plt
from celery.result import AsyncResult
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.core.files.storage import FileSystemStorage
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect, render
from essentia.standard import (MonoLoader, TensorflowPredict2D,
                               TensorflowPredictMusiCNN)

from .forms import UploadFileForm
from .models import music
from .tasks import long_running_task

from .models import TaskStatus

@login_required
def home(request):
    # 如果是POST請求，就處理表單資料
    if request.method=="POST":
        uploaded_file = request.FILES['file']
        fss = FileSystemStorage()
        file = fss.save(uploaded_file.name, uploaded_file)
        # 將音樂分析資訊存到資料庫
        user_id = request.user.id
        task = long_running_task.delay(musicid=uploaded_file.name, user_id=user_id, music_name=uploaded_file.name)
        TaskStatus.objects.create(user=request.user, task_id=task.id, status='PENDING', music_name=uploaded_file.name)
        return redirect('task_status')
    # 將所有media資料夾裡的檔案列出來
    mediafiles = os.listdir(settings.MEDIA_ROOT)
    return render(request, "upload.html", locals())

def task_status(request):
    # 若使用者按下"delete"按鈕，則刪除該筆task
    if "delete" in request.POST:
        task_id = request.POST.get("task_id")
        task = TaskStatus.objects.filter(task_id=task_id)
        task.delete()
        return redirect('task_status')
    user_id = request.user.id
    tasks = TaskStatus.objects.filter(user_id=user_id)
    return render(request, 'status.html', {'tasks': tasks})

# def readFile(request, musicid):
#     return render(request, "readFile.html", locals())

@login_required
def music_detail(request, music_id):
    music_list = music.objects.get(id=music_id)
    return render(request, "music_detail.html", locals())

@login_required
def showmusic(request):
    user_id = request.user.id
    music_list = music.objects.filter(user_id=user_id)
    return render(request, "showmusic.html", locals())

def p5(request):
    return render(request, "p5.html", locals())

def sortable(request):
    music_list = music.objects.all()
    return render(request, "sortable.html", locals())

def insert(request):
    data = {
    "intro": "tree",
    "verse": "flower",
    "chorus": "rain",
    "bridge": "wind",
    "outro": "sunlight"
    }
    my_model_instance = music.objects.create(user=request.user, data=data)
    my_model_instance.save()

    my_model_show = music.objects.all().order_by('-id')  #讀取資料表, 依 id 遞減排序
    return render(request, "insert.html", locals())


def search(request):
    # 假設你要根據某個條件來搜尋，例如搜尋名稱為 'example' 的音樂
    # 如果沒有特定條件，直接使用 .all() 然後取第一筆資料
    search_result = music.objects.filter(user=request.user).first()

    # 如果有特定條件，可以在 filter() 中加入條件，例如 music.objects.filter(artist='John').first()

    return render(request, "search.html", {'search_result': search_result})


# def start_task(request):
#     task = long_running_task.delay()
#     return JsonResponse({'task_id': task.id})

# def get_task_status(request, task_id):
#     task_result = AsyncResult(task_id)
#     if task_result.state == 'SUCCESS':
#         result = task_result.result
#     else:
#         result = task_result.state
#     return JsonResponse({'status': result})

# def celery(request):
#     return render(request, 'celery.html')


# 執行上傳音檔工作
# GET -> 可以上傳音檔(目前是按按鈕模擬long running task)
# POST -> 將工作實際丟到celery執行，並且redirect到"task_status"
# def celery(request):
#     if request.method == "POST":
#         task = long_running_task.delay()
#         TaskStatus.objects.create(task_id=task.id, status='PENDING')
#         return redirect('task_status')
#     return render(request, 'celery.html')

