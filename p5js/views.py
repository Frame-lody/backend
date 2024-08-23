from django.shortcuts import render

# Create your views here.

def test(request):
    return render(request, 'test.html')

def adjust(request):
    return render(request, 'adjust.html')

def select_mode(request):
    return render(request, 'select_mode.html')

def music_part(request):
    return render(request, 'music_part.html')

def pay(request):
    return render(request, 'pay.html')