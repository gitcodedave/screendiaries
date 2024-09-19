from django.db import models
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator


# Create your models here.

class UserProfile(models.Model):
    bio = models.TextField(null=True)
    profile_picture = models.ImageField(null=True)
    profile_cover = models.ImageField(null=True)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

class WatchListItem(models.Model):
    WATCH_STATUS_CURENTLY_WATCHING = 'C'
    WATCH_STATUS_WATCHED = 'W'
    WATCH_STATUS_CHOICES = [
        (WATCH_STATUS_CURENTLY_WATCHING, 'Currently Watching'),
        (WATCH_STATUS_WATCHED, 'Watched')
    ]
    status = models.CharField(choices=WATCH_STATUS_CHOICES)
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    content = models.ForeignKey('content.Content')
    date_added = models.DateTimeField(auto_now=True)

class QueueItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    content = models.ForeignKey('content.Content')
    date_added = models.DateTimeField(auto_now=True)

class TopTen(models.Model):
    TYPE_MOVIE = 'M'
    TYPE_SHOW = 'S'
    TYPE_CHOICES = [
        (TYPE_MOVIE, 'Movie'),
        (TYPE_SHOW, 'Tv Show')
    ]
    media_type = models.CharField(choices=TYPE_CHOICES)
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    content = models.ForeignKey('content.Content')
    ranking = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(5), MinValueValidator(1)]
    )

class Follower(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    follower = models.IntegerField()
    date_added = models.DateTimeField(auto_now=True)

    