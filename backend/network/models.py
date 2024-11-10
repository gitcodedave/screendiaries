from django.db import models

# Create your models here.
from django.db import models
from django.db.models import Q
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.forms import ValidationError


# Create your models here.

class UserProfile(models.Model):
    bio = models.TextField(blank=True, default='I just joined screendiaries!')
    profile_picture = models.ImageField(
        upload_to='network/images', default='network/images/default_profile_img.png', max_length=500)
    profile_cover = models.ImageField(
        upload_to='network/images', blank=True, max_length=500)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE)


class Follow(models.Model):
    follower = models.ForeignKey(
        UserProfile, related_name='following', on_delete=models.CASCADE)
    following = models.ForeignKey(
        UserProfile, related_name='followers', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['follower', 'following'], name='unique_follower')
        ]


class Content(models.Model):
    CONTENT_TYPE_MOVIE = 'Movie'
    CONTENT_TYPE_SERIES = 'Series'
    CONTENT_TYPE_EPISODE = 'Episode'
    CONTENT_TYPE_CHOICES = [
        (CONTENT_TYPE_MOVIE, 'Movie'),
        (CONTENT_TYPE_SERIES, 'Series'),
        (CONTENT_TYPE_EPISODE, 'Episode')
    ]
    content_type = models.CharField(choices=CONTENT_TYPE_CHOICES, max_length=7)
    season = models.PositiveSmallIntegerField(null=True, blank=True)
    episode = models.PositiveSmallIntegerField(null=True, blank=True)
    title = models.CharField(max_length=200)
    year = models.CharField(max_length=20)
    director = models.CharField(max_length=70)
    actors = models.TextField()
    genre = models.CharField(max_length=40)
    plot = models.TextField()
    poster = models.URLField()
    runtime = models.CharField(max_length=50)
    imdbid = models.CharField(max_length=50, primary_key=True)
    seriesid = models.CharField(max_length=50, null=True)


class WatchListItem(models.Model):
    WATCH_STATUS_CURRENTLY_WATCHING = 'Currently Watching'
    WATCH_STATUS_WATCHED = 'Watched'
    WATCH_STATUS_CHOICES = [
        (WATCH_STATUS_CURRENTLY_WATCHING, 'Currently Watching'),
        (WATCH_STATUS_WATCHED, 'Watched')
    ]
    status = models.CharField(choices=WATCH_STATUS_CHOICES, max_length=18)
    content = models.ForeignKey(Content, on_delete=models.CASCADE)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['content', 'user_profile'], name='unique_watchlist_item')
        ]


class QueueItem(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    content = models.ForeignKey(Content, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now=True)


class TopTen(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    content = models.ForeignKey(Content, on_delete=models.CASCADE)
    ranking = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(10), MinValueValidator(1)]
    )


class ActivityFeedItem(models.Model):
    activity_type = models.CharField(max_length=20)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now=True)


class Rating(models.Model):
    activity_feed = models.ForeignKey(
        ActivityFeedItem, on_delete=models.CASCADE, related_name='ratings')
    rating = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(5), MinValueValidator(1)]
    )
    content = models.ForeignKey(Content, on_delete=models.CASCADE)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['content', 'user_profile'], name='unique_rating')
        ]


class Review(models.Model):
    activity_feed = models.ForeignKey(
        ActivityFeedItem, on_delete=models.CASCADE, related_name='reviews')
    review_text = models.TextField()
    rating = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(5), MinValueValidator(1)],
        null=True,
        blank=True,
    )
    content = models.ForeignKey(Content, on_delete=models.CASCADE)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    contains_spoiler = models.BooleanField()
    timestamp = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['content', 'user_profile'], name='unique_review')
        ]


class Comment(models.Model):
    comment_text = models.TextField()
    parent = models.ForeignKey(
        'self', null=True, blank=True, related_name='replies', on_delete=models.CASCADE)
    activity_feed = models.ForeignKey(
        ActivityFeedItem, null=True, blank=True, on_delete=models.CASCADE, related_name='comments')
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now=True)


class Reaction(models.Model):
    REACTION_LOVE = 'Love'
    REACTION_THUMBS_UP = 'Thumbs Up'
    REACTION_THUMBS_DOWN = 'Thumbs Down'
    REACTION_LAUGH = 'Laughing'
    REACTION_CRY = 'Crying'
    REACTION_SURPRISED = 'Surprised'
    REACTION_SICK = 'Sick'
    REACTION_ANGRY = 'Angry'
    REACTION_CHOICES = [
        (REACTION_LOVE, 'Love'),
        (REACTION_THUMBS_UP, 'Thumbs Up'),
        (REACTION_THUMBS_DOWN, 'Thumbs Down'),
        (REACTION_LAUGH, 'Laughing'),
        (REACTION_CRY, 'Crying'),
        (REACTION_SURPRISED, 'Surprised'),
        (REACTION_SICK, 'Sick'),
        (REACTION_ANGRY, 'Angry'),
    ]
    activity_feed = models.ForeignKey(
        ActivityFeedItem, on_delete=models.CASCADE, related_name='reactions')
    comment = models.ForeignKey(
        Comment, null=True, blank=True, related_name='reactions', on_delete=models.CASCADE)
    review = models.ForeignKey(
        Review, null=True, blank=True, related_name='reactions', on_delete=models.CASCADE)
    rating = models.ForeignKey(
        Rating, null=True, blank=True, related_name='reactions', on_delete=models.CASCADE)
    reaction = models.CharField(choices=REACTION_CHOICES, max_length=11)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['activity_feed', 'comment', 'user_profile'],
                name='unique_reaction'
            )
        ]

    def clean(self):
        super().clean()
        if self.comment is None:
            # Ensure unique reaction per activity feed item
            if Reaction.objects.filter(
                activity_feed=self.activity_feed,
                comment__isnull=True,
                user_profile=self.user_profile
            ).exists():
                raise ValidationError('You can only react once per activity feed item.')
        else:
            # Ensure unique reaction per comment
            if Reaction.objects.filter(
                comment=self.comment,
                user_profile=self.user_profile
            ).exists():
                raise ValidationError('You can only react once per comment.')


class Update(models.Model):
    UPDATE_TYPE_FOLLOW = 'Follow'
    UPDATE_TYPE_REPLY = 'Reply'
    UPDATE_TYPE_COMMENT = 'Comment'
    UPDATE_TYPE_REACTION = 'Reaction'
    UPDATE_TYPE_COMMENT_REACTION = 'CommentReaction'
    UPDATE_TYPE_CHOICES = [
        (UPDATE_TYPE_FOLLOW, 'Follow'),
        (UPDATE_TYPE_REPLY, 'Reply'),
        (UPDATE_TYPE_COMMENT, 'Comment'),
        (UPDATE_TYPE_REACTION, 'Reaction'),
        (UPDATE_TYPE_COMMENT_REACTION, 'CommentReaction')
    ]
    update_type = models.CharField(choices=UPDATE_TYPE_CHOICES, max_length=15)
    user_profile = models.ForeignKey(
        UserProfile, related_name='updates', on_delete=models.CASCADE)
    follower = models.ForeignKey(
        UserProfile, related_name='originaluser', on_delete=models.CASCADE)
    activity_feed_item = models.ForeignKey(
        ActivityFeedItem, on_delete=models.CASCADE, blank=True, null=True)
    read_status = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now=True)


class Message(models.Model):
    MESSAGE_TYPE_CONTENT = 'Content Share'
    MESSAGE_TYPE_ACTIVITY = 'Activity Feed Share'
    MESSAGE_TYPE_TEXT = 'Text'
    MESSAGE_TYPE_CHOICES = [
        (MESSAGE_TYPE_CONTENT, 'Content Share'),
        (MESSAGE_TYPE_ACTIVITY, 'Activity Feed Share'),
        (MESSAGE_TYPE_TEXT, 'Text'),
    ]
    message_type = models.CharField(
        choices=MESSAGE_TYPE_CHOICES, max_length=19)
    content_id = models.PositiveIntegerField(null=True, blank=True)
    activity_feed_id = models.PositiveIntegerField(null=True, blank=True)
    message_text = models.TextField()
    reaction_emoji = models.CharField(max_length=10, default='')
    status_unread = models.BooleanField(default=True)
    sender = models.ForeignKey(
        UserProfile, related_name='sent_messages', on_delete=models.CASCADE)
    recipient = models.ForeignKey(
        UserProfile, related_name='received_messages', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now=True)
