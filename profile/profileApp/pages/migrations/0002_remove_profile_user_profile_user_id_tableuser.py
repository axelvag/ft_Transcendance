# Generated by Django 4.2.10 on 2024-02-21 09:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pages', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profile',
            name='user',
        ),
        migrations.AddField(
            model_name='profile',
            name='user_id_tableUser',
            field=models.IntegerField(default=0),
        ),
    ]
