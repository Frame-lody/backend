from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from .forms import UploadFileForm

from essentia.standard import MonoLoader, TensorflowPredictMusiCNN, TensorflowPredict2D
import matplotlib.pyplot as plt

# 中文編碼=============
import sys
import io

import os

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

# Create your views here.
