from rest_framework import serializers
from .models import ActivityFeedItem, Content, Follow, Message, QueueItem, Rating, RatingComment, RatingReaction, RatingReply, Review, ReviewComment, ReviewReaction, ReviewReply, TopTen, UserProfile, WatchListItem


class UserProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'bio', 'profile_picture', 'profile_cover', 'user_id']


class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'timestamp']


class ContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Content
        fields = ['id', 'content_type', 'season', 'episode', 'title',
                  'release_date', 'director', 'actors', 'genre', 'plot', 'poster', 'runtime']


class WatchListItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = WatchListItem
        fields = ['id', 'status', 'content', 'user_profile', 'timestamp']


class QueueItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QueueItem
        fields = ['id', 'user_profile', 'content', 'timestamp']


class TopTenSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopTen
        fields = ['id', 'user_profile', 'content', 'ranking']


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'review_text', 'rating', 'content',
                  'user_profile', 'contains_spoiler', 'timestamp']


class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ['id', 'rating', 'content', 'user_profile', 'timestamp']


class ActivityFeedItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityFeedItem
        fields = ['id', 'activity_type',
                  'activity_id', 'user_profile', 'timestamp']


class ReviewCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewComment
        fields = ['id', 'comment_text', 'review',
                  'user_profile', 'likes', 'timestamp']


class ReviewReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewReply
        fields = ['id', 'reply_text', 'review_comment',
                  'user_profile', 'likes', 'timestamp']


class ReviewReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewReaction
        fields = ['id', 'reaction', 'review', 'user_profile']


class RatingCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RatingComment
        fields = ['id', 'comment_text', 'rating',
                  'user_profile', 'likes', 'timestamp']


class RatingReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = RatingReply
        fields = ['id', 'reply_text', 'rating_comment',
                  'user_profile', 'likes', 'timestamp']


class RatingReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RatingReaction
        fields = ['id', 'reaction', 'rating', 'user_profile']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'message_type', 'content_id', 'activity_feed_id', 'message_text',
                  'reaction_emoji', 'status_unread', 'sender', 'recipient', 'timestamp']
