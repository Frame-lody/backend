from django.shortcuts import render

# Create your views here.
from django.contrib.auth.forms import UserCreationForm
from django.views.generic import TemplateView, CreateView
from django.urls import reverse_lazy
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import auth

# def sign_up(request):
#     return render(request, 'sign_up.html')

class SignUpView(CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy('login')
    template_name = 'sign_up.html'

def login(request):
    if request.user.is_authenticated:
        return HttpResponseRedirect('/users/main_page')
    username = request.POST.get('username')
    password = request.POST.get('password')
    user = auth.authenticate(username=username, password=password)
    if user is not None and user.is_active:
        auth.login(request, user)
        return HttpResponseRedirect('/users/main_page')
    else:
        return render(request, 'login.html', locals())

def main_page(request):
    return render(request, 'main_page.html')

def log_out(request):
    auth.logout(request)
    return HttpResponseRedirect('/users/main_page')