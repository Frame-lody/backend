import os
import time

from celery import shared_task
from celery.exceptions import Ignore
from django.conf import settings
from essentia.standard import (MonoLoader, TensorflowPredict2D,
                               TensorflowPredictMusiCNN)

from .models import TaskStatus

# 分析歌曲結構
import json  # 引用json模組
from dataclasses import asdict  # 引用dataclasses模組下的asdict函數
from pathlib import PosixPath  # 引用pathlib模組下的PosixPath類別
from allin1.typings import *  # 去引用allin1資料夾下的typings.py檔案（型別）
import allin1
#分析情緒顏色
import numpy as np
import os
import cv2
import sci
import scipy.spatial

@shared_task(bind=True)
def long_running_task(self, musicid, user_id, music_name):
    task_status, created = TaskStatus.objects.get_or_create(task_id=self.request.id, user=user_id, music_name=music_name)
    task_status.status = 'IN_PROGRESS'
    task_status.save()

    try:
        # =======For Ham: 把code放在這======
        #  顏色權重相關計算
        def get_color_for_point(point_coords, list_of_point_centers, list_of_colors):
            color = np.array([0.0, 0.0, 0.0])
            # get distances of the "query" point from all other points
            distances = scipy.spatial.distance.cdist([point_coords],
                                                    list_of_point_centers)[0]

            # get weights and compute new RGB value as weighted sum:
            weights = 1 / (distances + 0.1)

            for ic, c in enumerate(list_of_colors):
                color += (np.array(c) * weights[ic])
            color /= (np.sum(weights))
            sum_color = np.sum(color)
            required_sum_color = 600.0
            if color.max() * (required_sum_color/sum_color) <= 255:
                color *= (required_sum_color/sum_color)
            else:
                color *= (255/(color.max()))
            return color

        def create_2d_color_map(list_of_points, list_of_colors, height, width):
            rgb = np.zeros((height, width, 3)).astype("uint8")
            c_x = int(width / 2)
            c_y = int(height / 2)
            step = 3
            win_size = int((step-1) / 2)
            for i in range(len(list_of_points)):
                rgb[c_y - int(list_of_points[i][1] * height / 2),
                    c_x + int(list_of_points[i][0] * width / 2)] = list_of_colors[i]
            for y in range(win_size, height - win_size, step):
                for x in range(win_size, width - win_size, step):
                    x_real = (x - width / 2) / (width / 2)
                    y_real = (height / 2 - y ) / (height / 2)
                    color = get_color_for_point([x_real, y_real], list_of_points,
                                                list_of_colors)
                    rgb[y - win_size - 1 : y + win_size + 1,
                        x - win_size - 1 : x + win_size + 1] = color
            bgr = cv2.cvtColor(rgb, cv2.COLOR_BGR2RGB)
            return bgr

        # 定義顏色與情緒位置
        colors = {
            "orange": [255, 165, 0],
            "blue": [0, 0, 255],
            "bluegreen": [0, 165, 255],
            "green": [0, 205, 0],
            "red": [255, 0, 0],
            "yellow": [255, 255, 0],
            "purple": [128, 0, 128],
            "neutral": [255, 241, 224]
        }

        disgust_pos = [-0.9, 0]
        angry_pos = [-0.5, 0.5]
        alert_pos = [0, 0.6]
        happy_pos = [0.5, 0.5]
        calm_pos = [0.4, -0.4]
        relaxed_pos = [0, -0.6]
        sad_pos = [-0.5, -0.5]
        neu_pos = [0.0, 0.0]

        emotion_positions = [disgust_pos, angry_pos, alert_pos, happy_pos, calm_pos, relaxed_pos, sad_pos, neu_pos]
        emotion_colors = [colors["purple"], colors["red"], colors["orange"], colors["yellow"], colors["green"], colors["bluegreen"], colors["blue"], colors["neutral"]]

        # 創建情緒顏色地圖
        width, height = 500, 500
        emo_map = create_2d_color_map(emotion_positions, emotion_colors, width, height)

        # 將1-9範圍轉換到-1到1範圍
        def scale_value(value, old_min, old_max, new_min, new_max):
            return new_min + (float(value - old_min) / (old_max - old_min) * (new_max - new_min))

        # 將AV轉換顏色
        def get_color_from_valence_arousal(valence, arousal):
            arousal = scale_value(arousal, 1, 9, -1, 1)
            valence = scale_value(valence, 1, 9, -1, 1)

            y_center, x_center = int(height / 2), int(width / 2)
            x = x_center + int((width / 2) * valence)
            y = y_center - int((height / 2) * arousal)

            color = np.median(emo_map[y-2:y+2, x-2:x+2], axis=0).mean(axis=0)
            return '#{:02x}{:02x}{:02x}'.format(int(color[0]), int(color[1]), int(color[2]))

        #將prediction陣列轉換成十六進位的RGB值
        def convert_prediction_to_hex(prediction, emo_map, height, width):
            result = []
            for valence, arousal in prediction:
                valence, arousal = float(valence), float(arousal)
                color_hex = get_color_from_valence_arousal(valence, arousal, emo_map, height, width)
                result.append(color_hex)
            return result


        # 去定義essentia model路徑，從settings.py裡面拿
        # 這裡可以跑essentia的code
        # os.path.join(settings.MEDIA_ROOT, musicid) 是音樂檔案的路徑
        input_file_path = os.path.join(settings.MEDIA_ROOT, musicid)
        # os.path.join(essentia_path, 'msd-musicnn-1.pb') 是模型的路徑
        if __name__ == "__main__":
            #音頻分析
            audio = MonoLoader(filename=input_file_path, sampleRate=48000, resampleQuality=4)()
            embedding_model = TensorflowPredictMusiCNN(graphFilename=os.path.join(essentia_path, 'msd-musicnn-1.pb'), output='model/dense/BiasAdd')
            embeddings = embedding_model(audio)
            model = TensorflowPredict2D(graphFilename=os.path.join(essentia_path, 'deam-msd-musicnn-2.pb'), output='model/Identity')
            predictions = model(embeddings)
            #轉換為字串陣列
            predictions = predictions.astype(str).tolist()
            #獲取顏色
            hex_values = []
            hex_values = convert_prediction_to_hex(predictions, emo_map, height, width)

            print(hex_values[:5])


        # task_status.result = str(predictions)
        # =======到這裡結束，請注意把你的結果存成str，到task_status.result======




        # ======= 歌曲段落分析 =======

        # fake data:
        # 假設已經有一個 AnalysisResult 物件 result
        song_structure = AnalysisResult(
            path='content/stay.mp3',
            bpm=102,
            beats=[26.49, 27.06, 27.65, 28.23, 28.82, 29.4, 30.0, 30.59, 31.17, 31.76, 32.35, 32.93, 33.53, 34.11, 34.69, 35.29, 35.87, 36.46, 37.06, 37.64, 38.23, 38.82, 39.4, 40.0, 40.58, 41.17, 41.76, 42.35, 42.94, 43.52, 44.11, 44.7, 45.29, 45.87, 46.46, 47.05, 47.64, 48.23, 48.82, 49.38, 49.99, 50.56, 51.18, 51.74, 52.35, 52.93, 53.52, 54.11, 54.7, 55.26, 55.87, 56.45, 57.05, 57.65, 58.23, 58.82, 59.41, 60.0, 60.58, 61.17, 61.76, 62.35, 62.94, 63.52, 64.12, 64.7, 65.29, 65.88, 66.47, 67.06, 67.64, 68.24, 68.82, 69.4, 70.0, 70.59, 71.17, 71.76, 72.35, 72.94, 73.52, 74.12, 74.7, 75.29, 75.88, 76.47, 77.05, 77.65, 78.23, 78.82, 79.41, 80.0, 80.58, 81.17, 81.76, 82.35, 82.94, 83.53, 84.11, 84.7, 85.28, 85.88, 86.46, 87.05, 87.64, 88.22, 88.82, 89.4, 90.0, 90.58, 91.17, 91.76, 92.35, 92.93, 93.53, 94.11, 94.7, 95.29, 95.87, 96.46, 97.06, 97.64, 98.23, 98.82, 99.4, 99.99, 100.58, 101.17, 101.76, 102.34, 102.93, 103.52, 104.12, 104.7, 105.29, 105.88, 106.46, 107.05, 107.64, 108.23, 108.82, 109.4, 109.99, 110.58, 111.17, 111.75, 112.34, 112.93, 113.52, 114.1, 114.7, 115.29, 115.88, 116.46, 117.05, 117.64, 118.23, 118.81, 119.4, 119.99, 120.59, 121.16, 121.76, 122.34, 122.93, 123.52, 124.11, 124.7, 125.29, 125.89, 126.47, 127.03, 127.64, 128.21, 128.82, 129.41, 130.0, 130.59, 131.17, 131.77, 132.35, 132.94, 133.53, 134.11, 134.7, 135.29, 135.88, 136.46, 137.06, 137.64, 138.23, 138.82, 139.41, 140.0, 140.58, 141.17, 141.76, 142.34, 142.96, 143.53, 144.11, 144.7, 145.29, 145.88, 146.46, 147.05, 147.64, 148.23, 148.82, 149.41, 150.0, 150.59, 151.17, 151.76, 152.35, 152.94, 153.52, 154.11, 154.7, 155.29, 155.88, 156.47, 157.06, 157.65, 158.23, 158.82, 159.41, 160.0, 160.58, 161.17, 161.76, 162.35, 162.92, 163.52, 164.1, 164.7, 165.29, 165.87, 166.47, 167.05, 167.65, 168.22, 168.82, 169.41, 170.0, 170.58, 171.17, 171.76, 172.35, 172.93, 173.52, 174.11, 174.7, 175.29, 175.87, 176.46, 177.05, 177.64, 178.23, 178.82, 179.41, 179.99, 180.58, 181.17, 181.77, 182.35, 182.93, 183.52, 184.11, 184.7, 185.29, 185.88, 186.46, 187.05, 187.64, 188.23, 188.82, 189.41, 189.99, 190.58, 191.17, 191.76, 192.35, 192.94, 193.53, 194.11, 194.7, 195.29, 195.87, 196.46, 197.05, 197.64, 198.23, 198.82, 199.4, 199.99, 200.57],
            downbeats=[26.49, 28.82, 31.17, 33.53, 35.87, 38.23, 40.58, 42.94, 45.29, 47.64, 49.99, 52.35, 54.7, 57.05, 59.41, 61.76, 64.12, 66.47, 68.82, 71.17, 73.52, 75.88, 78.23, 80.58, 82.94, 85.28, 87.64, 90.0, 92.35, 94.7, 97.06, 99.4, 101.76, 104.12, 106.46, 108.82, 111.17, 113.52, 115.88, 118.23, 120.59, 122.93, 125.29, 127.64, 130.0, 132.35, 134.7, 137.06, 139.41, 141.76, 144.11, 146.46, 148.82, 151.17, 153.52, 155.88, 158.23, 160.58, 162.92, 165.29, 167.65, 170.0, 172.35, 174.7, 177.05, 179.41, 181.77, 184.11, 186.46, 188.82, 191.17, 193.53, 195.87, 198.23, 200.57],
            beat_positions=[1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1],
            segments=[
                Segment(start=0.0, end=0.03, label='cool'),
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

        # 實際分析請取消註解下面這行：
        # song_structure = allin1.analyze(os.path.join(settings.MEDIA_ROOT, music_name))

        # 將 segments 轉換為字典列表
        segments_dict = [asdict(segment) for segment in song_structure.segments]

        task_status.segments = segments_dict
        task_status.bpm = song_structure.bpm
        # ==========================

        task_status.status = 'COMPLETED'
        task_status.save()
        return "Task completed"
    except Exception as e:
        task_status.status = 'FAILED'
        task_status.result = str(e)
        task_status.save()
        raise Ignore()
