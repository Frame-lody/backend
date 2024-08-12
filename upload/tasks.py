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
from essentia.standard import MonoLoader, TensorflowPredictMusiCNN, TensorflowPredict2D
from django.conf import settings
import os
import cv2
import color_map_2d

@shared_task(bind=True)
def long_running_task(self, musicid, user_id, music_name):
    task_status, created = TaskStatus.objects.get_or_create(task_id=self.request.id, user=user_id, music_name=music_name)
    task_status.status = 'IN_PROGRESS'
    task_status.save()

    try:
        # =======For Ham: 把code放在這======

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
        emo_map = color_map_2d.create_2d_color_map(emotion_positions, emotion_colors, width, height)

        # 將1-9範圍轉換到-1到1範圍
        def scale_value(value, old_min, old_max, new_min, new_max):
            return new_min + (float(value - old_min) / (old_max - old_min) * (new_max - new_min))

        # 轉換範圍
        def get_color_from_valence_arousal(valence, arousal):
            arousal = scale_value(arousal, 1, 9, -1, 1)
            valence = scale_value(valence, 1, 9, -1, 1)

            y_center, x_center = int(height / 2), int(width / 2)
            x = x_center + int((width / 2) * valence)
            y = y_center - int((height / 2) * arousal)

            color = np.median(emo_map[y-2:y+2, x-2:x+2], axis=0).mean(axis=0)
            return (int(color[0]), int(color[1]), int(color[2]))

        # 讀取txt檔案並寫入結果到新檔案
        def process_txt_file(input_file_path, output_file_path):
            with open(input_file_path, 'r') as file:
                lines = file.readlines()

            results = []
            for line in lines:
                try:
                    valence, arousal = map(float, line.strip().split())
                    color = get_color_from_valence_arousal(valence, arousal)
                    results.append(color)
                except ValueError:
                    print(f"Invalid line: {line.strip()}")

            # 把結果寫入輸出檔案
            with open(output_file_path, 'w') as file:
                for color in results:
                    file.write(f"{color}\n")

        #讀取包含RGB參數的txt文件並返回RGB列表
        def read_rgb_parameters(file_path):
            rgb_list = []
            with open(file_path, 'r') as file:
                for line in file:
                    # 去括號和空格、分割
                    line = line.strip().replace('(', '').replace(')', '').replace(' ', '')
                    r, g, b = map(int, line.split(','))
                    rgb_list.append((r, g, b))
            return rgb_list

        #根據RGB列表生成HTML文件顯示顏色區塊
        def generate_html(rgb_list, output_file):
            html_content = '''
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Color Blocks</title>
                <style>
                    .color-block {
                        width: 100%;
                        height: 100px;
                        margin: 10px 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 24px;
                        color: white;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
            '''

            for i, (r, g, b) in enumerate(rgb_list, start=1):
                text_color = "white" if (r*0.299 + g*0.587 + b*0.114) < 186 else "black"
                html_content += f'<div class="color-block" style="background-color: rgb({r}, {g}, {b}); color: {text_color};">{i}</div>\n'

            html_content += '''
            </body>
            </html>
            '''

            with open(output_file, 'w') as file:
                file.write(html_content)

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

            #Arousal, Valence儲存
            file_name_without_exten = os.path.splitext(os.path.basename(input_file_path))[0] #提取文件名

            #新檔案夾名稱（重要）
            new_dir = settings.MEDIA_ROOT
            txtfile = os.path.join(new_dir, f'{file_name_without_exten}.txt')
            np.savetxt(txtfile, predictions)

            #RGB參數儲存
            input_file_path = txtfile
            rgb_file_path =  txtfile.replace(".txt", "_rgb.txt")
            process_txt_file(input_file_path, rgb_file_path)
            rgb_list = read_rgb_parameters(rgb_file_path)

            #挑出RGB參數
            with open(rgb_file_path, 'r') as file:
                lines = file.readlines()

            hex_values = []
            for line in lines[:5]:
                rgb = eval(line.strip())
                hex_value = rgb_to_hex(rgb)
                hex_values.append(hex_value)
            print(hex_values)


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
