from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator


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

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['content', 'user_profile'], name='unique_review')
        ]


class Rating(models.Model):
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
    reaction = models.CharField(choices=REACTION_CHOICES, max_length=11)
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
    reaction = models.CharField(choices=REACTION_CHOICES, max_length=11)
    rating = models.ForeignKey(Rating, on_delete=models.CASCADE)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)

class ActivityFeedItem(models.Model):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, null=True, blank=True)
    review_comment = models.ForeignKey(ReviewComment, on_delete=models.CASCADE, null=True, blank=True)
    review_reply = models.ForeignKey(ReviewReply, on_delete=models.CASCADE, null=True, blank=True)
    review_reaction = models.ForeignKey(ReviewReaction, on_delete=models.CASCADE, null=True, blank=True)
    rating = models.ForeignKey(Rating, on_delete=models.CASCADE, null=True, blank=True)
    rating_comment = models.ForeignKey(RatingComment, on_delete=models.CASCADE, null=True, blank=True)
    rating_reply = models.ForeignKey(RatingReply, on_delete=models.CASCADE, null=True, blank=True)
    rating_reaction = models.ForeignKey(RatingReaction, on_delete=models.CASCADE, null=True, blank=True)
    activity_type = models.CharField(max_length=20)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now=True)


class Update(models.Model):
    UPDATE_TYPE_FOLLOW = 'Follow'
    UPDATE_TYPE_REPLY = 'Reply'
    UPDATE_TYPE_REACTION = 'Reaction'
    UPDATE_TYPE_CHOICES = [
        (UPDATE_TYPE_FOLLOW, 'Follow'),
        (UPDATE_TYPE_REPLY, 'Reply'),
        (UPDATE_TYPE_REACTION, 'Reaction')
    ]
    update_type = models.CharField(choices=UPDATE_TYPE_CHOICES, max_length=8)
    user_profile = models.ForeignKey(
        UserProfile, related_name='updates', on_delete=models.CASCADE)
    follower = models.ForeignKey(
        UserProfile, related_name='originaluser', on_delete=models.CASCADE)
    activity_feed_item = models.ForeignKey(ActivityFeedItem, on_delete=models.CASCADE, blank=True, null=True)
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
