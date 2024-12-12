from django.shortcuts import render, get_object_or_404
from upload.models import TaskStatus, Segment
from django.shortcuts import redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.serializers import serialize
import json

import logging
logger = logging.getLogger(__name__)

# Create your views here.

def test(request):
    return render(request, 'test.html', locals())

def adjust(request, task_id, order):
    task_status = get_object_or_404(TaskStatus, task_id=task_id)
    segment = get_object_or_404(Segment, order=order, task_status=task_status)
    # 傳遞 `task_status` 和 `segments` 給模板
    context = {
        'task_status': task_status,
        'segment': segment,
        'task_id': task_id,
        'order_id': order
    }
    return render(request, 'adjust.html', context)

def select_mode(request, task_id, order):
    task_status = get_object_or_404(TaskStatus, task_id=task_id)
    segment = get_object_or_404(Segment, order=order, task_status=task_status)
    # 傳遞 `task_status` 和 `segments` 給模板
    context = {
        'task_status': task_status,
        'segment': segment,
        'task_id': task_id,
        'order_id': order
    }

    # 如果狀態不是 'completed'，顯示處理中的頁面
    if task_status.status == 'FAILED':
        return redirect('task_status')
    elif task_status.status != 'COMPLETED':
        return render(request, 'processing.html')

    return render(request, 'select_mode.html', context)

def music_part(request, task_id):
    task_id = task_id
    task_status = get_object_or_404(TaskStatus, task_id=task_id) # 取得 task_id 對應的 TaskStatus 物件

    # 如果狀態不是 'completed'，顯示處理中的頁面
    if task_status.status == 'FAILED':
        return redirect('task_status')
    elif task_status.status != 'COMPLETED':
        return render(request, 'processing.html')

    # 查詢對應的 Segment 資料，按順序排列
    segments = task_status.segments.all()  # 使用 `related_name` 取得段落資料

    # 傳遞 `task_status` 和 `segments` 給模板
    context = {
        'task_status': task_status,
        'segments': segments,
        'task_id': task_id
    }

    return render(request, 'music_part.html', context)

def show(request, task_id):
    task_id = task_id
    task_status = get_object_or_404(TaskStatus, task_id=task_id) # 取得 task_id 對應的 TaskStatus 物件

    # 如果狀態不是 'completed'，顯示處理中的頁面
    if task_status.status == 'FAILED':
        return redirect('task_status')
    elif task_status.status != 'COMPLETED':
        return render(request, 'processing.html')

    # 查詢對應的 Segment 資料，按順序排列
    segments = task_status.segments.all()  # 使用 `related_name` 取得段落資料
    segments_json = json.loads(serialize('json', segments, fields=('id', 'order', 'label', 'start', 'duration', 'end', 'color', 'sketch', 'bpm', 'task_status_id')))  # 將 QuerySet 轉換為 JSON 格式

    # 傳遞 `task_status` 和 `segments` 給模板
    context = {
        'task_status': task_status,
        'segments': segments,
        'task_id': task_id,
        'segments_json': segments_json
    }

    return render(request, 'show.html', context)

def pay(request, task_id):
    task_status = get_object_or_404(TaskStatus, task_id=task_id) # 取得 task_id 對應的 TaskStatus 物件

    # 如果狀態不是 'completed'，顯示處理中的頁面
    if task_status.status != 'COMPLETED':
        return render(request, 'processing.html')

    return render(request, 'pay.html', locals())

@csrf_exempt
def update_segment_color(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            task_id = data.get('task_id')  # 確保獲取 segment ID
            color_array = data.get('color_array')  # 獲取顏色陣列
            order_id = data.get('order_id')

            # 更新資料庫
            task_status = get_object_or_404(TaskStatus, task_id=task_id)
            segment = get_object_or_404(Segment, order=order_id, task_status=task_status)
            # segment = Segment.objects.get(id=segment_id)
            segment.color = color_array  # 假設 color 是 JSONField
            segment.save()

            return JsonResponse({'success': True, 'message': 'Colors updated successfully'})
        except Segment.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Segment not found'}, status=404)
        except Exception as e:
            logger.error(f"Error occurred: {str(e)}")
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    return JsonResponse({'success': False, 'message': 'Invalid request'}, status=400)

@csrf_exempt
def update_sketch(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            task_id = data.get('task_id')  # 確保獲取 segment ID
            sketch = data.get('sketch')
            order_id = data.get('order_id')

            # 更新資料庫
            task_status = get_object_or_404(TaskStatus, task_id=task_id)
            segment = get_object_or_404(Segment, order=order_id, task_status=task_status)
            # segment = Segment.objects.get(id=segment_id)
            segment.sketch = sketch
            segment.save()

            return JsonResponse({'success': True, 'message': 'Sketch updated successfully'})
        except Segment.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Sketch not found'}, status=404)
        except Exception as e:
            logger.error(f"Error occurred: {str(e)}")
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    return JsonResponse({'success': False, 'message': 'Invalid request'}, status=400)

@csrf_exempt
def update_bpm(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            task_id = data.get('task_id')  # 確保獲取 segment ID
            bpm = data.get('bpm')
            order_id = data.get('order_id')

            # 更新資料庫
            task_status = get_object_or_404(TaskStatus, task_id=task_id)
            segment = get_object_or_404(Segment, order=order_id, task_status=task_status)
            # segment = Segment.objects.get(id=segment_id)
            segment.bpm = bpm
            segment.save()

            return JsonResponse({'success': True, 'message': 'Bpm updated successfully'})
        except Segment.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Bpm not found'}, status=404)
        except Exception as e:
            logger.error(f"Error occurred: {str(e)}")
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    return JsonResponse({'success': False, 'message': 'Invalid request'}, status=400)

# def view_task(request, task_id):
#     task_status = get_object_or_404(TaskStatus, task_id=task_id) # 取得 task_id 對應的 TaskStatus 物件

#     # 如果狀態不是 'completed'，顯示處理中的頁面
#     if task_status.status != 'COMPLETED':
#         return render(request, 'processing.html')

#     user_id = request.user.id
#     task = TaskStatus.objects.filter(task_id=task_id).first()
#     return render(request, 'test.html', locals())