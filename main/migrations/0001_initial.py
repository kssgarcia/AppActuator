# Generated by Django 3.2.9 on 2021-11-30 17:47

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ActuatorModels',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('height', models.FloatField()),
                ('force', models.FloatField()),
                ('stroke', models.FloatField()),
                ('minLen', models.FloatField()),
                ('angleSimul', models.FloatField()),
                ('direction', models.IntegerField()),
                ('airLoad', models.FloatField()),
                ('weight', models.FloatField()),
                ('step', models.FloatField()),
                ('numGraph', models.IntegerField()),
                ('tol', models.FloatField()),
                ('limXA1', models.CharField(max_length=20)),
                ('limYA1', models.CharField(max_length=20)),
                ('stepA1', models.FloatField()),
                ('limXA2', models.CharField(max_length=20)),
                ('limYA2', models.CharField(max_length=20)),
                ('stepA2', models.FloatField()),
            ],
        ),
        migrations.CreateModel(
            name='DataResult',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('dataXY', django.contrib.postgres.fields.ArrayField(base_field=django.contrib.postgres.fields.ArrayField(base_field=models.FloatField(), size=None), size=None)),
            ],
        ),
    ]
