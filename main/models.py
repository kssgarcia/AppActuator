from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class ActuatorModel(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=200)
    height = models.FloatField()
    force = models.FloatField()
    stroke = models.FloatField()
    minLen = models.FloatField()
    angleSimul = models.FloatField()
    direction = models.IntegerField()
    airLoad = models.FloatField()
    weight = models.FloatField()
    step = models.FloatField()
    numGraph = models.IntegerField()
    tol = models.FloatField()
    limXA1 = models.CharField(max_length=20)
    limYA1 = models.CharField(max_length=20)
    stepA1 = models.FloatField()
    limXA2 = models.CharField(max_length=20)
    limYA2 = models.CharField(max_length=20)
    stepA2 = models.FloatField()
    def __str__(self):
        return self.title

    class Meta:
        order_with_respect_to = 'user'
