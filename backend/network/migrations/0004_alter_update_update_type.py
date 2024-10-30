# Generated by Django 5.1.2 on 2024-10-30 00:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0003_remove_comment_likes'),
    ]

    operations = [
        migrations.AlterField(
            model_name='update',
            name='update_type',
            field=models.CharField(choices=[('Follow', 'Follow'), ('Reply', 'Reply'), ('Comment', 'Comment'), ('Reaction', 'Reaction')], max_length=8),
        ),
    ]
