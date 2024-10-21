from django.shortcuts import render, get_object_or_404
from upload.models import TaskStatus

# Create your views here.

def test(request):
    return render(request, 'test.html', locals())

def adjust(request, task_id):
    task_status = get_object_or_404(TaskStatus, task_id=task_id)
    return render(request, 'adjust.html', locals())

def select_mode(request, task_id):
    task_status = get_object_or_404(TaskStatus, task_id=task_id) # 取得 task_id 對應的 TaskStatus 物件

    # 如果狀態不是 'completed'，顯示處理中的頁面
    if task_status.status != 'COMPLETED':
        return render(request, 'processing.html')

    return render(request, 'select_mode.html', locals())

def music_part(request, task_id):
    task_status = get_object_or_404(TaskStatus, task_id=task_id) # 取得 task_id 對應的 TaskStatus 物件

    # 如果狀態不是 'completed'，顯示處理中的頁面
    if task_status.status != 'COMPLETED':
        return render(request, 'processing.html')

    return render(request, 'music_part.html', locals())

def pay(request, task_id):
    task_status = get_object_or_404(TaskStatus, task_id=task_id) # 取得 task_id 對應的 TaskStatus 物件

    # 如果狀態不是 'completed'，顯示處理中的頁面
    if task_status.status != 'COMPLETED':
        return render(request, 'processing.html')

    return render(request, 'pay.html', locals())

def view_task(request, task_id):
    task_status = get_object_or_404(TaskStatus, task_id=task_id) # 取得 task_id 對應的 TaskStatus 物件

    # 如果狀態不是 'completed'，顯示處理中的頁面
    if task_status.status != 'COMPLETED':
        return render(request, 'processing.html')

    user_id = request.user.id
    task = TaskStatus.objects.filter(task_id=task_id).first()
    return render(request, 'test.html', locals())