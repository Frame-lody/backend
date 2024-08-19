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
from .models import TaskStatus, music
from .tasks import long_running_task

# from celery.task.control import revoke


@login_required
def home(request):
    # 如果是POST請求，就處理表單資料
    if request.method=="POST":
        uploaded_file = request.FILES['file']
        fss = FileSystemStorage()
        file = fss.save(uploaded_file.name, uploaded_file)
        # 將音樂分析資訊存到資料庫
        user_id = request.user.id
        task = long_running_task.delay(musicid=file, user_id=user_id, music_name=file)
        TaskStatus.objects.create(user=request.user, task_id=task.id, status='PENDING', music_name=file)
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
        # revoke(task_id, terminate=True)
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

import json  # 引用json模組
from dataclasses import asdict  # 引用dataclasses模組下的asdict函數
from pathlib import PosixPath  # 引用pathlib模組下的PosixPath類別

from allin1.typings import *  # 去引用allin1資料夾下的typings.py檔案（型別）

from .models import AudioAnalysis


def insert_structure(request):
    if request.method == "POST":
        music_name = request.POST.get('music_name')

        # 假設已經有一個 AnalysisResult 物件 result
        result = AnalysisResult(
            path='content/stay.mp3',
            bpm=102,
            beats=[26.49, 27.06, 27.65, 28.23, 28.82, 29.4, 30.0, 30.59, 31.17, 31.76, 32.35, 32.93, 33.53, 34.11, 34.69, 35.29, 35.87, 36.46, 37.06, 37.64, 38.23, 38.82, 39.4, 40.0, 40.58, 41.17, 41.76, 42.35, 42.94, 43.52, 44.11, 44.7, 45.29, 45.87, 46.46, 47.05, 47.64, 48.23, 48.82, 49.38, 49.99, 50.56, 51.18, 51.74, 52.35, 52.93, 53.52, 54.11, 54.7, 55.26, 55.87, 56.45, 57.05, 57.65, 58.23, 58.82, 59.41, 60.0, 60.58, 61.17, 61.76, 62.35, 62.94, 63.52, 64.12, 64.7, 65.29, 65.88, 66.47, 67.06, 67.64, 68.24, 68.82, 69.4, 70.0, 70.59, 71.17, 71.76, 72.35, 72.94, 73.52, 74.12, 74.7, 75.29, 75.88, 76.47, 77.05, 77.65, 78.23, 78.82, 79.41, 80.0, 80.58, 81.17, 81.76, 82.35, 82.94, 83.53, 84.11, 84.7, 85.28, 85.88, 86.46, 87.05, 87.64, 88.22, 88.82, 89.4, 90.0, 90.58, 91.17, 91.76, 92.35, 92.93, 93.53, 94.11, 94.7, 95.29, 95.87, 96.46, 97.06, 97.64, 98.23, 98.82, 99.4, 99.99, 100.58, 101.17, 101.76, 102.34, 102.93, 103.52, 104.12, 104.7, 105.29, 105.88, 106.46, 107.05, 107.64, 108.23, 108.82, 109.4, 109.99, 110.58, 111.17, 111.75, 112.34, 112.93, 113.52, 114.1, 114.7, 115.29, 115.88, 116.46, 117.05, 117.64, 118.23, 118.81, 119.4, 119.99, 120.59, 121.16, 121.76, 122.34, 122.93, 123.52, 124.11, 124.7, 125.29, 125.89, 126.47, 127.03, 127.64, 128.21, 128.82, 129.41, 130.0, 130.59, 131.17, 131.77, 132.35, 132.94, 133.53, 134.11, 134.7, 135.29, 135.88, 136.46, 137.06, 137.64, 138.23, 138.82, 139.41, 140.0, 140.58, 141.17, 141.76, 142.34, 142.96, 143.53, 144.11, 144.7, 145.29, 145.88, 146.46, 147.05, 147.64, 148.23, 148.82, 149.41, 150.0, 150.59, 151.17, 151.76, 152.35, 152.94, 153.52, 154.11, 154.7, 155.29, 155.88, 156.47, 157.06, 157.65, 158.23, 158.82, 159.41, 160.0, 160.58, 161.17, 161.76, 162.35, 162.92, 163.52, 164.1, 164.7, 165.29, 165.87, 166.47, 167.05, 167.65, 168.22, 168.82, 169.41, 170.0, 170.58, 171.17, 171.76, 172.35, 172.93, 173.52, 174.11, 174.7, 175.29, 175.87, 176.46, 177.05, 177.64, 178.23, 178.82, 179.41, 179.99, 180.58, 181.17, 181.77, 182.35, 182.93, 183.52, 184.11, 184.7, 185.29, 185.88, 186.46, 187.05, 187.64, 188.23, 188.82, 189.41, 189.99, 190.58, 191.17, 191.76, 192.35, 192.94, 193.53, 194.11, 194.7, 195.29, 195.87, 196.46, 197.05, 197.64, 198.23, 198.82, 199.4, 199.99, 200.57],
            downbeats=[26.49, 28.82, 31.17, 33.53, 35.87, 38.23, 40.58, 42.94, 45.29, 47.64, 49.99, 52.35, 54.7, 57.05, 59.41, 61.76, 64.12, 66.47, 68.82, 71.17, 73.52, 75.88, 78.23, 80.58, 82.94, 85.28, 87.64, 90.0, 92.35, 94.7, 97.06, 99.4, 101.76, 104.12, 106.46, 108.82, 111.17, 113.52, 115.88, 118.23, 120.59, 122.93, 125.29, 127.64, 130.0, 132.35, 134.7, 137.06, 139.41, 141.76, 144.11, 146.46, 148.82, 151.17, 153.52, 155.88, 158.23, 160.58, 162.92, 165.29, 167.65, 170.0, 172.35, 174.7, 177.05, 179.41, 181.77, 184.11, 186.46, 188.82, 191.17, 193.53, 195.87, 198.23, 200.57],
            beat_positions=[1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1],
            segments=[
                Segment(start=0.0, end=0.03, label='start'),
                Segment(start=0.03, end=28.82, label='verse'),
                Segment(start=28.82, end=46.44, label='verse'),
                Segment(start=46.44, end=66.46, label='chorus'),
                Segment(start=66.46, end=87.64, label='inst'),
                Segment(start=87.64, end=106.46, label='verse'),
                Segment(start=106.46, end=124.1, label='verse'),
                Segment(start=124.1, end=144.11, label='chorus'),
                Segment(start=144.11, end=162.93, label='chorus'),
                Segment(start=162.93, end=180.58, label='bridge'),
                Segment(start=180.58, end=200.57, label='chorus'),
                Segment(start=200.57, end=213.12, label='outro')],
                activations=None, embeddings=None
        )

        # 將 segments 轉換為字典列表
        segments_dict = [asdict(segment) for segment in result.segments]

        # # 將字典列表轉換為 JSON 字符串
        #segments_json = json.dumps(segments_dict) # 將python對象(Object) 編碼成JSON格式的字符串
        # # 可以將segments_json保存到資料庫中

        # 若要從資料庫中讀取segments_json，則可以使用以下程式碼（python）
        #segments_final = json.loads(segments_json) # 將JSON字符串解碼成python對象(Object)
        # print(cool[0]["label"])
        # print(result.bpm)

        # 創建並保存 AudioAnalysis 實例
        audio_analysis = AudioAnalysis(
            music_name=music_name,
            bpm=result.bpm,
            segments=segments_dict
        )
        audio_analysis.save()
        return redirect('home')
    return render(request, "insert_structure.html", locals())

def show_structure(request):
    audio_analysis = AudioAnalysis.objects.first()
    return render(request, "show_structure.html", locals())

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

