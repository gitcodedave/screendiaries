# Generated by Django 5.1.1 on 2024-10-10 04:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0004_rating_unique_rating_review_unique_review'),
    ]

    operations = [
        migrations.AddField(
            model_name='content',
            name='seriesid',
            field=models.CharField(max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='bio',
            field=models.TextField(blank=True, default='I just joined screendiaries!'),
        ),
    ]
