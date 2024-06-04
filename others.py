#!/usr/bin/python
# -*- coding: utf-8 -*-
import os

from flask import Flask, flash, request, redirect, url_for, send_from_directory, render_template
from werkzeug.utils import secure_filename

from essentia.standard import MonoLoader, TensorflowPredictMusiCNN, TensorflowPredict2D
import matplotlib.pyplot as plt

# 中文編碼=============
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
# ====================

app = Flask(__name__)


# 設置上傳文件夾

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# 允許的文件擴展名
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/")
def hello():
  return "Hello World!"

# 上傳頁面
@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            # filename = secure_filename(file.filename) # 因為secure_filename()不支援中文檔名
            filename = file.filename
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return redirect(url_for('uploaded_file', filename=filename))
            # return 'file uploaded successfully'
    return render_template("")

@app.route('/uploads/qq')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'],filename)

@app.route('/check')
def et():
    print(os.getcwd())
    audio = MonoLoader(filename="uploads/11.mp3", sampleRate=48000, resampleQuality=4)()
    embedding_model = TensorflowPredictMusiCNN(graphFilename="model/msd-musicnn-1.pb", output="model/dense/BiasAdd")
    embeddings = embedding_model(audio)

    model = TensorflowPredict2D(graphFilename="model/deam-msd-musicnn-2.pb", output="model/Identity")
    predictions = model(embeddings)
    print(predictions)
    return os.getcwd()
    # return

if __name__ == "__main__":
  app.run(host='0.0.0.0', port=8000)