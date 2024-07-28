from unittest.util import _MAX_LENGTH
from django.db import models

# Create your models here.
class account_info(models.Model):
    account_name = models.CharField(max_length= 10)
    account_email = models.EmailField()
    account_order = models.DateField()
