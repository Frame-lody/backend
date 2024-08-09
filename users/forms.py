from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

# class RegisterForm(UserCreationForm):
#     username = forms.CharField(
#         label="帳號",
#         widget=forms.TextInput(attrs={'class': 'form-control'})
#     )
#     email = forms.EmailField(
#         label="電子郵件",
#         widget=forms.EmailInput(attrs={'class': 'form-control'})
#     )
#     password1 = forms.CharField(
#         label="密碼",
#         widget=forms.PasswordInput(attrs={'class': 'form-control'})
#     )
#     password2 = forms.CharField(
#         label="密碼確認",
#         widget=forms.PasswordInput(attrs={'class': 'form-control'})
#     )
#     class Meta:
#         model = User
#         fields = ('username', 'email', 'password1', 'password2')

class RegisterForm(UserCreationForm):
    username = forms.CharField(
        label="帳號",
        widget=forms.TextInput()
    )
    email = forms.EmailField(
        label="電子郵件",
        widget=forms.EmailInput()
    )
    password1 = forms.CharField(
        label="密碼",
        widget=forms.PasswordInput()
    )
    password2 = forms.CharField(
        label="密碼確認",
        widget=forms.PasswordInput()
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # 为每个字段添加自定义的HTML结构和CSS类
        for field_name, field in self.fields.items():
            field.widget.attrs.update({'class': 'form-control'})  # 更新字段的widget的class

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')