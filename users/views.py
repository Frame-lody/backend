from django.contrib import auth, messages
# Create your views here.
from django.contrib.auth.forms import UserCreationForm
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import redirect, render
from django.urls import reverse_lazy
from django.views.generic import CreateView, TemplateView

from .forms import RegisterForm

# def sign_up(request):
#     return render(request, 'sign_up.html')

class SignUpView(CreateView):
    form_class = RegisterForm
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
        # return HttpResponseRedirect('/users/main_page')
        next_url = request.GET.get('next', '/users/main_page')
        return redirect(next_url)
    else:
        return render(request, 'login.html', locals())

def main_page(request):
    return render(request, 'main_page.html')

def log_out(request):
    auth.logout(request)
    return HttpResponseRedirect('/users/main_page')
