from django.shortcuts import render
from upload.models import TaskStatus

# Create your views here.

def test(request):
    return render(request, 'test.html', locals())

def adjust(request):
    return render(request, 'adjust.html', locals())

def select_mode(request):
    return render(request, 'select_mode.html', locals())

def music_part(request):
    return render(request, 'music_part.html', locals())

def pay(request):
    return render(request, 'pay.html', locals())

def view_task(request, task_id):
    user_id = request.user.id
    task = TaskStatus.objects.filter(task_id=task_id).first()
    return render(request, 'test.html', locals())