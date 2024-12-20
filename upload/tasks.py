import os
import time
import logging
import random

from celery import shared_task
from celery.exceptions import Ignore
from django.conf import settings
from essentia.standard import (MonoLoader, TensorflowPredict2D,
                               TensorflowPredictMusiCNN)

from .models import TaskStatus
from .models import Segment as SegmentModel
from django.contrib.auth.models import User

# 分析歌曲結構
import json  # 引用json模組
from dataclasses import asdict  # 引用dataclasses模組下的asdict函數
from pathlib import PosixPath  # 引用pathlib模組下的PosixPath類別
from allin1.typings import *  # 去引用allin1資料夾下的typings.py檔案（型別）
import allin1

import numpy as np
import os
import cv2
import scipy.spatial
import colorsys
import math


# 設定 logger
logger = logging.getLogger(__name__)

# =============== 顏色處理 function ===============

def calculate_hue_value(valence, arousal):
    # 計算角度 (Hue) - 使用 arctan 並以角度輸出
    angle = math.degrees(math.atan2(arousal, valence))  # atan2 自帶象限處理
    angle = (angle + 360) % 360  # 將角度範圍轉換到 [0, 360)
    # print(angle)
    # 設置基準色相映射
    if 0 <= angle < 90:  # 第一象限 (橘紅色為基準)
        hue = 45 - (angle / 90) * (45 - 30)  # 線性插值
    elif 90 <= angle < 180:  # 第二象限 (藍色為基準)
        hue = 30 - (angle - 90) * (8 / 3)
    elif 180 <= angle < 270:  # 第三象限 (綠藍色為基準)
        hue = 270 - ((angle - 180) / 90) * (270 - 180)
    elif 270 <= angle < 360:  # 第四象限 (黃色為基準)
        hue = 180 - ((angle - 270) / 90) * (180 - 30)

    # 計算距離 (Value)
    distance = math.sqrt(valence**2 + arousal**2)  # 計算距離
    value = max(0.5, min(distance, 1.0))  # 距離越遠亮度越高，範圍 0.5 到 1.0

    # 固定飽和度
    saturation = 1.0

    # HSV 轉換為 RGB
    r, g, b = colorsys.hsv_to_rgb(hue / 360, saturation, value)

    # 轉換為 HEX 格式
    return hue, '#{:02x}{:02x}{:02x}'.format(int(r * 255), int(g * 255), int(b * 255))

# 生成兩個相配的顏色
def generate_complementary_colors(colors, median_hue, mean_hue):
    color_combinations = []

    for color in colors:
        # 將 HEX 顏色轉換為 RGB
        rgb = tuple(int(color.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
        # 將 RGB 轉換為 HSL
        h, l, s = colorsys.rgb_to_hls(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255)

        # 生成相配顏色
        complementary_colors = []

        # 第一個相配顏色：根據亮度決定調整
        if l == 0.5:
            l1 = 0.8
        else:
            l1 = 1 - l
        rgb1 = colorsys.hls_to_rgb(h, l1, s)
        hex1 = '#{:02x}{:02x}{:02x}'.format(int(rgb1[0] * 255), int(rgb1[1] * 255), int(rgb1[2] * 255))
        complementary_colors.append(hex1)

        # 第二個相配顏色：調整色相
        if median_hue < mean_hue:
            h2 = (h - 0.15) % 1.0
        else:
            h2 = (h + 0.15) % 1.0
        l2 = (l + l1) / 2
        rgb2 = colorsys.hls_to_rgb(h2, l2, s-0.2)
        hex2 = '#{:02x}{:02x}{:02x}'.format(int(rgb2[0] * 255), int(rgb2[1] * 255), int(rgb2[2] * 255))
        complementary_colors.append(hex2)

        # 添加結果
        color_combinations.extend(complementary_colors)

    return color_combinations


# =============== 曲風對應Sketch Function ===============

# 定義標籤和對應的數字範圍
genre_to_sketch = {
    "Rock": [1, 4, 7],
    "Alternative": [3, 4, 6, 18],
    "Alternative Rock": [3, 4, 6, 18],
    "Indie": [1, 4, 7, 18],
    "Indie Rock": [1, 4, 7, 18],
    "Electronic": [1, 7],
    "Electronica": [1, 7],
    "Female Vocalists": [10, 12],
    "Female Vocalist": [10, 12],
    "Jazz": [6, 8, 10, 12],
    "Soul": [6, 9, 10, 12, 14],
    "Instrumental": [8, 14],
    "Punk": [1, 7, 18],
    "Hard Rock": [4, 7],
    "Acoustic": [8, 10, 11, 14, 15],
    "Experimental": [8, 14, 15],
    "Guitar": [3, 8, 14, 17],
    "Hip-Hop": [1, 18],
    "Country": [8, 13, 17, 18],
    "Catchy": [3, 5, 6, 8, 16],
    "Heavy Metal": [4, 7],
    "Progressive Rock": [4, 7, 18],
    "Rnb": [10, 12, 13, 17],
    "Indie Pop": [1, 3, 7, 17, 18],
    "House": [8, 13, 17],
    "Pop": [1, 3, 7, 17, 18],
    "Beautiful": [2, 7, 9, 10, 12, 14],
    "Chillout": [6, 8, 11, 17],
    "Metal": [4, 7],
    "Classic Rock": [1, 4, 7],
    "Blues": [6, 9, 10, 11, 15],
    "Ambient": [7, 9, 10, 12, 14],
    "Funk": [5, 8, 17],
    "Electro": [1, 7],
    "Sad": [9, 10, 15],
    "Happy": [3, 5, 13, 16, 17],
    "Dance": [1, 4, 7, 16, 17, 18],
    "Mellow": [9, 10, 12],
    "Party": [1, 4, 16],
    "Easy Listening": [6, 13, 16, 17],
    "Folk": [8, 13, 17],
    "Chill": [6, 8, 11, 17]
}

# 定義一個函數隨機選擇數字並生成 mySketch?.js
def get_random_sketch(genre):
    """隨機根據曲風選擇一個數字並生成 mySketch?.js 文件"""
    if genre in genre_to_sketch:
        random_number = random.choice(genre_to_sketch[genre])
        return f"mySketch{random_number}.js"
    else:
        # 如果曲風沒有對應數字，給個默認的文件
        return "mySketchDefault.js"

def get_combined_sketch(final_4_tags):
    """根據前三個標籤的數字範圍進行整合並返回隨機生成的 sketch 文件"""
    # 選前四個標籤
    selected_genres = final_4_tags[:4]

    # 收集所有數字範圍並去重
    combined_numbers = set()
    for genre in selected_genres:
        if genre in genre_to_sketch:
            combined_numbers.update(genre_to_sketch[genre])

    # 如果有數字範圍，隨機選擇一個數字
    if combined_numbers:
        random_number = random.choice(list(combined_numbers))
        return f"mySketch{random_number}.js"
    else:
        # 如果沒有匹配，返回默認值
        return "mySketchDefault.js"


# =============== task function ===============
@shared_task(bind=True)
def long_running_task(self, musicid, user_id, music_name):
    user = User.objects.get(id=user_id)
    task_status, created = TaskStatus.objects.get_or_create(task_id=self.request.id, user=user, music_name=music_name)
    task_status.status = 'IN_PROGRESS'
    task_status.save()

    try:

        # ============== 歌曲段落分析 ==============

        # fake data:
        # 假設已經有一個 AnalysisResult 物件 result
        # song_structure = AnalysisResult(
        #     path='content/stay.mp3',
        #     bpm=102,
        #     beats=[26.49, 27.06, 27.65, 28.23, 28.82, 29.4, 30.0, 30.59, 31.17, 31.76, 32.35, 32.93, 33.53, 34.11, 34.69, 35.29, 35.87, 36.46, 37.06, 37.64, 38.23, 38.82, 39.4, 40.0, 40.58, 41.17, 41.76, 42.35, 42.94, 43.52, 44.11, 44.7, 45.29, 45.87, 46.46, 47.05, 47.64, 48.23, 48.82, 49.38, 49.99, 50.56, 51.18, 51.74, 52.35, 52.93, 53.52, 54.11, 54.7, 55.26, 55.87, 56.45, 57.05, 57.65, 58.23, 58.82, 59.41, 60.0, 60.58, 61.17, 61.76, 62.35, 62.94, 63.52, 64.12, 64.7, 65.29, 65.88, 66.47, 67.06, 67.64, 68.24, 68.82, 69.4, 70.0, 70.59, 71.17, 71.76, 72.35, 72.94, 73.52, 74.12, 74.7, 75.29, 75.88, 76.47, 77.05, 77.65, 78.23, 78.82, 79.41, 80.0, 80.58, 81.17, 81.76, 82.35, 82.94, 83.53, 84.11, 84.7, 85.28, 85.88, 86.46, 87.05, 87.64, 88.22, 88.82, 89.4, 90.0, 90.58, 91.17, 91.76, 92.35, 92.93, 93.53, 94.11, 94.7, 95.29, 95.87, 96.46, 97.06, 97.64, 98.23, 98.82, 99.4, 99.99, 100.58, 101.17, 101.76, 102.34, 102.93, 103.52, 104.12, 104.7, 105.29, 105.88, 106.46, 107.05, 107.64, 108.23, 108.82, 109.4, 109.99, 110.58, 111.17, 111.75, 112.34, 112.93, 113.52, 114.1, 114.7, 115.29, 115.88, 116.46, 117.05, 117.64, 118.23, 118.81, 119.4, 119.99, 120.59, 121.16, 121.76, 122.34, 122.93, 123.52, 124.11, 124.7, 125.29, 125.89, 126.47, 127.03, 127.64, 128.21, 128.82, 129.41, 130.0, 130.59, 131.17, 131.77, 132.35, 132.94, 133.53, 134.11, 134.7, 135.29, 135.88, 136.46, 137.06, 137.64, 138.23, 138.82, 139.41, 140.0, 140.58, 141.17, 141.76, 142.34, 142.96, 143.53, 144.11, 144.7, 145.29, 145.88, 146.46, 147.05, 147.64, 148.23, 148.82, 149.41, 150.0, 150.59, 151.17, 151.76, 152.35, 152.94, 153.52, 154.11, 154.7, 155.29, 155.88, 156.47, 157.06, 157.65, 158.23, 158.82, 159.41, 160.0, 160.58, 161.17, 161.76, 162.35, 162.92, 163.52, 164.1, 164.7, 165.29, 165.87, 166.47, 167.05, 167.65, 168.22, 168.82, 169.41, 170.0, 170.58, 171.17, 171.76, 172.35, 172.93, 173.52, 174.11, 174.7, 175.29, 175.87, 176.46, 177.05, 177.64, 178.23, 178.82, 179.41, 179.99, 180.58, 181.17, 181.77, 182.35, 182.93, 183.52, 184.11, 184.7, 185.29, 185.88, 186.46, 187.05, 187.64, 188.23, 188.82, 189.41, 189.99, 190.58, 191.17, 191.76, 192.35, 192.94, 193.53, 194.11, 194.7, 195.29, 195.87, 196.46, 197.05, 197.64, 198.23, 198.82, 199.4, 199.99, 200.57],
        #     downbeats=[26.49, 28.82, 31.17, 33.53, 35.87, 38.23, 40.58, 42.94, 45.29, 47.64, 49.99, 52.35, 54.7, 57.05, 59.41, 61.76, 64.12, 66.47, 68.82, 71.17, 73.52, 75.88, 78.23, 80.58, 82.94, 85.28, 87.64, 90.0, 92.35, 94.7, 97.06, 99.4, 101.76, 104.12, 106.46, 108.82, 111.17, 113.52, 115.88, 118.23, 120.59, 122.93, 125.29, 127.64, 130.0, 132.35, 134.7, 137.06, 139.41, 141.76, 144.11, 146.46, 148.82, 151.17, 153.52, 155.88, 158.23, 160.58, 162.92, 165.29, 167.65, 170.0, 172.35, 174.7, 177.05, 179.41, 181.77, 184.11, 186.46, 188.82, 191.17, 193.53, 195.87, 198.23, 200.57],
        #     beat_positions=[1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1],
        #     segments=[
        #         Segment(start=0.0, end=0.03, label='intro'),
        #         Segment(start=0.03, end=28.82, label='verse'),
        #         Segment(start=28.82, end=46.44, label='verse'),
        #         Segment(start=46.44, end=66.46, label='chorus'),
        #         Segment(start=66.46, end=87.64, label='inst'),
        #         Segment(start=87.64, end=106.46, label='verse'),
        #         Segment(start=106.46, end=124.1, label='verse'),
        #         Segment(start=124.1, end=144.11, label='chorus'),
        #         Segment(start=144.11, end=162.93, label='chorus'),
        #         Segment(start=162.93, end=180.58, label='bridge'),
        #         Segment(start=180.58, end=200.57, label='chorus'),
        #         Segment(start=200.57, end=213.12, label='outro')],
        #         activations=None, embeddings=None
        # )

        # 實際分析請取消註解下面這行：
        song_structure = allin1.analyze(os.path.join(settings.MEDIA_ROOT, music_name))

        # 將 segments 轉換為字典列表
        segments_dict = [asdict(segment) for segment in song_structure.segments]
        # 合併相同 label 的 segments
        merged_segments = []
        for segment in segments_dict:
            if merged_segments and merged_segments[-1]['label'] == segment['label']:
                merged_segments[-1]['end'] = segment['end']
            else:
                merged_segments.append(segment)
        # 合併短於0.5秒的segments
        final_segments = []
        for i, segment in enumerate(merged_segments):
            if i < len(merged_segments) - 1 and (segment['end'] - segment['start']) < 0.5:
                merged_segments[i + 1]['start'] = segment['start']
            else:
                final_segments.append(segment)

        segments_dict = final_segments


        # segments_dict = merged_segments

        # 存入資料庫
        # task_status.segments = segments_dict
        task_status.bpm = song_structure.bpm

        # ============== 顏色 ==============

        # 去定義essentia model路徑，從settings.py裡面拿
        # 這裡可以跑essentia的code
        # os.path.join(settings.MEDIA_ROOT, musicid) 是音樂檔案的路徑
        # os.path.join(essentia_path, 'msd-musicnn-1.pb') 是模型的路徑
        input_file_path = os.path.join(settings.MEDIA_ROOT, musicid)

        '''### 使用者輸入音檔的路徑 ###'''
        loader = MonoLoader(filename=input_file_path, sampleRate=16000, resampleQuality=4)
        waveform = loader()
        musicnn_graph = os.path.join(settings.ESSENTIA_PATH, 'msd-musicnn-1.pb')
        embedding_model = TensorflowPredictMusiCNN(graphFilename=musicnn_graph, output="model/dense/BiasAdd", patchHopSize=187)
        audio_embeddings = embedding_model(waveform)

        # 分類器模型路徑
        classifier_graph = os.path.join(settings.ESSENTIA_PATH, 'emomusic-msd-musicnn-1.pb')

        # 使用正確的輸入節點、正確的輸出節點
        classifier = TensorflowPredict2D(graphFilename=classifier_graph, input="model/Placeholder",  output="model/Identity")
        print("開始進行預測...")
        predictions = classifier(audio_embeddings)
        print("預測完成！")

        # predictions處理
        pmedian = np.median(predictions.squeeze(), axis=0)
        pmean = np.mean(predictions.squeeze(), axis=0)
        # 將範圍從 (1, 9) 改到 (-1, 1)
        pmedian = (pmedian - 5) / 4
        pmean = (pmean - 5) / 4

        # 提取 Valence 和 Arousal
        print(pmedian)
        print(pmean)
        ''' predictions格式 - [0.5 0.5] '''

        hex_values = []
        median_hue, hex_value = calculate_hue_value(pmedian[0], pmedian[1])
        hex_values.append(hex_value)

        mean_hex_values = []
        mean_hue, mean_hex_value = calculate_hue_value(pmean[0], pmean[1])
        mean_hex_values.append(mean_hex_value)

        print(median_hue)
        print(mean_hue)

        # 生成相配顏色
        # color_result = generate_complementary_colors(hex_values)
        color_result = generate_complementary_colors(mean_hex_values, median_hue, mean_hue)
        # 添加原始顏色至結果
        color_result.insert(0, hex_value)
        print(color_result)
        task_status.result = color_result
        ''' color_result - ['#ff0000', '#ffff00', '#00ff00'] '''


        # predictions = ['#D77186', '#6CB7DA', '#D75725']
        # task_status.result = str(predictions)


        # ============== 處理genre ==============
        audio = MonoLoader(filename=input_file_path, sampleRate=16000, resampleQuality=4)()
        embedding_model = TensorflowPredictMusiCNN(graphFilename=os.path.join(settings.ESSENTIA_PATH, 'msd-musicnn-1.pb'), output='model/dense/BiasAdd')
        embeddings = embedding_model(audio)
        genre_model = TensorflowPredict2D(graphFilename=os.path.join(settings.ESSENTIA_PATH, 'msd-msd-musicnn-1.pb'), input="serving_default_model_Placeholder", output="PartitionedCall")
        genre_predictions = genre_model(embeddings)


        # 定義要取出的標籤索引
        selected_indices = [
            0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11,
            12, 14, 15, 16, 17, 18, 20, 22, 23, 24,
            26, 27, 28, 29, 30, 31, 32, 33, 35, 36, 37,
            39, 40, 41, 42, 43, 45, 46, 47, 48, 49
        ]

        # 取出指定的標籤並儲存成新的 numpy 陣列
        selected = genre_predictions[:, selected_indices]
        print(selected)

        # 定義標籤名稱對應的列表
        tags = [
            "Rock", "Pop", "Alternative", "Indie", "Electronic", "Female Vocalists", "Dance", "Alternative Rock", "Jazz", "Beautiful", "Metal",
            "Chillout", "Classic Rock", "Soul", "Indie Rock", "Mellow", "Electronica", "Folk", "Chill", "Instrumental", "Punk",
            "Blues", "Hard Rock", "Ambient", "Acoustic", "Experimental", "Female Vocalist", "Guitar", "Hip-Hop", "Party", "Country", "Easy Listening",
            "Catchy", "Funk", "Electro", "Heavy Metal", "Progressive Rock", "Rnb", "Indie Pop", "Sad", "House", "Happy"
        ]

        # 找出每一列的前四高值的索引
        top4 = np.argsort(selected, axis=1)[:, -4:][:, ::-1]

        # 統計每個標籤次數
        top4_tags = tags  # 標籤與選擇的索引對應
        tag_counts = {tag: 0 for tag in top4_tags}

        # 計算每個標籤在所有列中的出現次數
        for indices in top4:
            for idx in indices:
                tag_counts[top4_tags[idx]] += 1

        # 找出出現最多次的前四高標籤
        sorted_tag_counts = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)
        # 只取出前四高標籤的名稱
        final_4_tags = [tag for tag, count in sorted_tag_counts[:4]]
        task_status.genre = str(final_4_tags)
        # 輸出結果
        for tag in final_4_tags:
            print(tag)

        # ============== 將分析結果存入資料庫 ==============

        for idx, segment in enumerate(segments_dict, start=1):
            genre = final_4_tags[0] # 取第一個標籤作為曲風
            # sketch_file = get_random_sketch(genre)
            sketch_file = get_combined_sketch(final_4_tags)
            while idx > 1 and sketch_file == SegmentModel.objects.filter(task_status=task_status).order_by('-order').first().sketch:
                sketch_file = get_random_sketch(genre)
            SegmentModel.objects.create(
                task_status=task_status,
                order=idx,
                duration=(segment['end'] - segment['start'])*1000,
                start=(segment['start'])*1000,
                end=(segment['end'])*1000,
                label=segment['label'],
                color=color_result,
                bpm=song_structure.bpm,
                sketch=sketch_file
            )

        task_status.status = 'COMPLETED'
        task_status.save()
        return "Task completed"
    except ZeroDivisionError as e:
        error_message = f"Division by zero: {e}"
        logger.error(error_message)  # 記錄錯誤日誌
        task_status.status = 'FAILED'
        task_status.result = str(e)
        task_status.save()
        # 返回錯誤訊息
        return {"status": "error", "message": error_message}
    except Exception as e:
        error_message = f"Unexpected error: {e}"
        logger.error(error_message, exc_info=True)  # 記錄完整的回溯
        task_status.status = 'FAILED'
        task_status.result = str(e)
        task_status.save()
        # 返回錯誤訊息
        return {"status": "error", "message": error_message}
