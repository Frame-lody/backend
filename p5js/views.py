from django.shortcuts import render

# Create your views here.

def test(request):
    return render(request, 'test.html')

def adjust(request):
    return render(request, 'adjust.html')