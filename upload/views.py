import io
import os
import sys

import matplotlib.pyplot as plt
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.http import HttpResponse
from django.shortcuts import redirect, render
from essentia.standard import (MonoLoader, TensorflowPredict2D,
                               TensorflowPredictMusiCNN)

from .forms import UploadFileForm
from .models import music

def home(request):
    # 如果是POST請求，就處理表單資料
    if request.method=="POST":
        uploaded_file = request.FILES['file']
        fss = FileSystemStorage()
        file = fss.save(uploaded_file.name, uploaded_file)
        return redirect("/")
    # 將所有media資料夾裡的檔案列出來
    mediafiles = os.listdir(settings.MEDIA_ROOT)
    return render(request, "upload.html", locals())

def readFile(request, musicid):
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

    # local 變數
    thedata = "123"
    music = str(predictions)

    return render(request, "readFile.html", locals())

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