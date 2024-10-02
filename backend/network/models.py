from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator


# Create your models here.

class UserProfile(models.Model):
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(blank=True)
    profile_cover = models.ImageField(blank=True)
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
    CONTENT_TYPE_MOVIE = 'M'
    CONTENT_TYPE_SERIES = 'S'
    CONTENT_TYPE_EPISODE = 'E'
    CONTENT_TYPE_CHOICES = [
        (CONTENT_TYPE_MOVIE, 'Movie'),
        (CONTENT_TYPE_SERIES, 'Series'),
        (CONTENT_TYPE_EPISODE, 'Episode')
    ]
    content_type = models.CharField(choices=CONTENT_TYPE_CHOICES, max_length=1)
    season = models.PositiveSmallIntegerField(null=True, blank=True)
    episode = models.PositiveSmallIntegerField(null=True, blank=True)
    title = models.CharField(max_length=200)
    release_date = models.DateField()
    director = models.CharField(max_length=70)
    actors = models.TextField()
    genre = models.CharField(max_length=40)
    plot = models.TextField()
    poster = models.URLField()
    runtime = models.CharField(max_length=50)


class WatchListItem(models.Model):
    WATCH_STATUS_CURRENTLY_WATCHING = 'C'
    WATCH_STATUS_WATCHED = 'W'
    WATCH_STATUS_CHOICES = [
        (WATCH_STATUS_CURRENTLY_WATCHING, 'Currently Watching'),
        (WATCH_STATUS_WATCHED, 'Watched')
    ]
    status = models.CharField(choices=WATCH_STATUS_CHOICES, max_length=1)
    content = models.ForeignKey(Content, on_delete=models.CASCADE)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now=True)


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


class Review(models.Model):
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


class Rating(models.Model):
    rating = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(5), MinValueValidator(1)]
    )
    content = models.ForeignKey(Content, on_delete=models.CASCADE)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now=True)


class ActivityFeedItem(models.Model):
    ACTIVITY_TYPE_REVIEW = 'REV'
    ACTIVITY_TYPE_RATING = 'RAT'
    ACTIVITY_TYPE_COMMENT = 'COM'
    ACTIVITY_TYPE_REPLY = 'REP'
    ACTIVITY_TYPE_CHOICES = [
        (ACTIVITY_TYPE_REVIEW, 'Review'),
        (ACTIVITY_TYPE_RATING, 'Rating'),
        (ACTIVITY_TYPE_COMMENT, 'Comment'),
        (ACTIVITY_TYPE_REPLY, 'Reply'),
    ]
    activity_type = models.CharField(
        choices=ACTIVITY_TYPE_CHOICES, max_length=3)
    activity_id = models.PositiveIntegerField()
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now=True)


class ReviewComment(models.Model):
    comment_text = models.TextField()
    review = models.ForeignKey(Review, on_delete=models.CASCADE)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    likes = models.PositiveIntegerField(default=0)
    timestamp = models.DateTimeField(auto_now=True)


class ReviewReply(models.Model):
    reply_text = models.TextField()
    review_comment = models.ForeignKey(ReviewComment, on_delete=models.CASCADE)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    likes = models.PositiveIntegerField(default=0)
    timestamp = models.DateTimeField(auto_now=True)


class ReviewReaction(models.Model):
    REACTION_LOVE = 'LO'
    REACTION_THUMBS_UP = 'UP'
    REACTION_THUMBS_DOWN = 'DO'
    REACTION_LAUGH = 'LA'
    REACTION_CRY = 'CR'
    REACTION_SURPRISED = 'SU'
    REACTION_SICK = 'SI'
    REACTION_ANGRY = 'AN'
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
    reaction = models.CharField(choices=REACTION_CHOICES, max_length=2)
    review = models.ForeignKey(Review, on_delete=models.CASCADE)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)


class RatingComment(models.Model):
    comment_text = models.TextField()
    rating = models.ForeignKey(Rating, on_delete=models.CASCADE)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    likes = models.PositiveIntegerField(default=0)
    timestamp = models.DateTimeField(auto_now=True)


class RatingReply(models.Model):
    reply_text = models.TextField()
    rating_comment = models.ForeignKey(RatingComment, on_delete=models.CASCADE)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    likes = models.PositiveIntegerField(default=0)
    timestamp = models.DateTimeField(auto_now=True)


class RatingReaction(models.Model):
    REACTION_LOVE = 'LO'
    REACTION_THUMBS_UP = 'UP'
    REACTION_THUMBS_DOWN = 'DO'
    REACTION_LAUGH = 'LA'
    REACTION_CRY = 'CR'
    REACTION_SURPRISED = 'SU'
    REACTION_SICK = 'SI'
    REACTION_ANGRY = 'AN'
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
    reaction = models.CharField(choices=REACTION_CHOICES, max_length=2)
    rating = models.ForeignKey(Rating, on_delete=models.CASCADE)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)


class Message(models.Model):
    MESSAGE_TYPE_CONTENT = 'C'
    MESSAGE_TYPE_ACTIVITY = 'A'
    MESSAGE_TYPE_TEXT = 'T'
    MESSAGE_TYPE_CHOICES = [
        (MESSAGE_TYPE_CONTENT, 'Content Share'),
        (MESSAGE_TYPE_ACTIVITY, 'Activity Feed Share'),
        (MESSAGE_TYPE_TEXT, 'Text'),
    ]
    message_type = models.CharField(choices=MESSAGE_TYPE_CHOICES, max_length=1)
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
