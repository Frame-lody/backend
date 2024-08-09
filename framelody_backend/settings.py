"""
Django settings for framelody_backend project.

Generated by 'django-admin startproject' using Django 5.0.6.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-k!5s0*qpi7g#6cx1scr9h+u@#e1xc4p*^12m($sk6s92!bjho#'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin', # 管理者後台
    'django.contrib.auth', # 認證授權管理
    'django.contrib.contenttypes', # 內容類型管理
    'django.contrib.sessions', # session 管理
    'django.contrib.messages', # 訊息管理
    'django.contrib.staticfiles', # 靜態檔案管理
    # 'django.contrib.messages',
    'channels', # Django Channels
    'upload',
    'users'
]

ASGI_APPLICATION = 'framelody_backend.asgi.application'

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware', # 安全性管理
    'django.contrib.sessions.middleware.SessionMiddleware', # session 管理
    'django.middleware.common.CommonMiddleware', # 通用管理
    'django.middleware.csrf.CsrfViewMiddleware', # CSRF 防護
    'django.contrib.auth.middleware.AuthenticationMiddleware', # 認證管理
    'django.contrib.messages.middleware.MessageMiddleware', # 訊息管理
    'django.middleware.clickjacking.XFrameOptionsMiddleware', # 防止點擊劫持
    # 'django.contrib.messages.middleware.MessageMiddleware',
]

ROOT_URLCONF = 'framelody_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ['./templates',],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'framelody_backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'zh-Hant'

TIME_ZONE = 'Asia/Taipei'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'

STATICFILES_DIRS = [
    BASE_DIR / "static",
]

STATIC_ROOT = BASE_DIR / "staticfiles"

# Media files (Upload files)

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / "media"


ESSENTIA_PATH = BASE_DIR / "essentia_model"

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# celery
CELERY_BROKER_URL = 'redis://myredis:6379'
CELERY_RESULT_BACKEND = 'redis://myredis:6379'
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Asia/Taipei'

# # 配置messages標籤
# from django.contrib.messages import constants as messages

# MESSAGE_TAGS = {
#     messages.DEBUG: 'debug',
#     messages.INFO: 'info',
#     messages.SUCCESS: 'success',
#     messages.WARNING: 'warning',
#     messages.ERROR: 'danger',
# }