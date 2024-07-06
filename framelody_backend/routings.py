from django.urls import re_path
from users.consumers import ChatConsumer

websocket_urlpatterns =[
	re_path(r'chat/', ChatConsumer.as_asgi()),
]