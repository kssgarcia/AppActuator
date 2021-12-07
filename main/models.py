from django.db import models

# Create your models here.

class ActuatorModel(models.Model):
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

class RegisterModel(models.Model):
    username = models.CharField(max_length=10)
    password = models.CharField(max_length=10)

