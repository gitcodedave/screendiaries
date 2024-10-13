from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import ActivityFeedItem, Content, Follow, Message, QueueItem, Rating, RatingComment, RatingReaction, RatingReply, Review, ReviewComment, ReviewReaction, ReviewReply, TopTen, UserProfile, WatchListItem


CustomUser = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(read_only=True)
    first_name = serializers.CharField(
        source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    username = serializers.CharField(source='user.username', required=False)

    class Meta:
        model = UserProfile
        fields = ['id', 'bio', 'profile_picture',
                  'user_id', 'first_name', 'last_name', 'username']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        # Update UserProfile fields
        instance.bio = validated_data.get('bio', instance.bio)
        instance.profile_picture = validated_data.get(
            'profile_picture', instance.profile_picture)
        instance.profile_cover = validated_data.get(
            'profile_cover', instance.profile_cover)
        instance.save()

        # Update CustomUser fields
        user.first_name = user_data.get('first_name', user.first_name)
        user.last_name = user_data.get('last_name', user.last_name)
        user.email = user_data.get('email', user.email)
        user.save()

        return instance


class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'timestamp']


class FollowWithUserProfileSerializer(serializers.ModelSerializer):
    following_profile = UserProfileSerializer(source='following')

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following',
                  'timestamp', 'following_profile']


class ContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Content
        fields = ['imdbid', 'content_type', 'season', 'episode', 'title',
                  'year', 'director', 'actors', 'genre', 'plot', 'poster', 'runtime', 'seriesid']


class ContentWithStatusSerializer(serializers.ModelSerializer):
    status = serializers.CharField()

    class Meta:
        model = Content
        fields = ['imdbid', 'content_type', 'season', 'episode', 'title',
                  'year', 'director', 'actors', 'genre', 'plot', 'poster', 'runtime', 'status']

class FriendWatchListSerializer(serializers.ModelSerializer):
    status = serializers.CharField()
    user_profile = UserProfileSerializer()

    class Meta:
        model = Content
        fields = ['imdbid', 'content_type', 'season', 'episode', 'title',
                  'year', 'director', 'actors', 'genre', 'plot', 'poster', 'runtime', 'status', 'user_profile']


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
    activity_type = serializers.CharField(read_only=True)
    user_profile = UserProfileSerializer(read_only=True)
    user_profile_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(), write_only=True, source='user_profile'
    )

    class Meta:
        model = Review
        fields = ['id', 'review_text', 'rating', 'activity_type', 'content',
                  'user_profile', 'user_profile_id', 'contains_spoiler', 'timestamp']

class ReviewReadSerializer(serializers.ModelSerializer):
    activity_type = serializers.CharField(read_only=True)
    user_profile = UserProfileSerializer(read_only=True)
    user_profile_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(), write_only=True, source='user_profile'
    )
    content = ContentSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'review_text', 'rating', 'activity_type', 'content',
                  'user_profile', 'user_profile_id', 'contains_spoiler', 'timestamp']

class RatingSerializer(serializers.ModelSerializer):
    activity_type = serializers.CharField(read_only=True)
    user_profile = UserProfileSerializer(read_only=True)
    user_profile_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(), write_only=True, source='user_profile'
    )

    class Meta:
        model = Rating
        fields = ['id', 'rating', 'activity_type', 'content',
                  'user_profile_id', 'user_profile', 'timestamp']
        
class RatingReadSerializer(serializers.ModelSerializer):
    activity_type = serializers.CharField(read_only=True)
    user_profile = UserProfileSerializer(read_only=True)
    user_profile_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(), write_only=True, source='user_profile'
    )
    content = ContentSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'rating', 'activity_type', 'content',
                  'user_profile_id', 'user_profile', 'timestamp']


class ReviewCommentSerializer(serializers.ModelSerializer):
    activity_type = serializers.CharField(read_only=True)

    class Meta:
        model = ReviewComment
        fields = ['id', 'comment_text', 'review', 'activity_type',
                  'user_profile', 'likes', 'timestamp']


class ReviewReplySerializer(serializers.ModelSerializer):
    activity_type = serializers.CharField(read_only=True)

    class Meta:
        model = ReviewReply
        fields = ['id', 'reply_text', 'review_comment', 'activity_type',
                  'user_profile', 'likes', 'timestamp']


class ReviewReactionSerializer(serializers.ModelSerializer):
    activity_type = serializers.CharField(read_only=True)

    class Meta:
        model = ReviewReaction
        fields = ['id', 'reaction', 'review', 'activity_type', 'user_profile']


class RatingCommentSerializer(serializers.ModelSerializer):
    activity_type = serializers.CharField(read_only=True)

    class Meta:
        model = RatingComment
        fields = ['id', 'comment_text', 'rating', 'activity_type',
                  'user_profile', 'likes', 'timestamp']


class RatingReplySerializer(serializers.ModelSerializer):
    activity_type = serializers.CharField(read_only=True)

    class Meta:
        model = RatingReply
        fields = ['id', 'reply_text', 'rating_comment', 'activity_type',
                  'user_profile', 'likes', 'timestamp']


class RatingReactionSerializer(serializers.ModelSerializer):
    activity_type = serializers.CharField(read_only=True)

    class Meta:
        model = RatingReaction
        fields = ['id', 'reaction', 'rating', 'activity_type', 'user_profile']


class ActivityFeedItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = ActivityFeedItem
        fields = ['id', 'activity_type', 'review', 'review_comment', 'review_reply',
                  'review_reaction', 'rating', 'rating_comment',
                  'rating_reply', 'rating_reaction', 'user_profile', 'timestamp']


class ActivityFeedItemReadSerializer(serializers.ModelSerializer):
    review = ReviewReadSerializer()
    review_comment = ReviewCommentSerializer()
    review_reply = ReviewReplySerializer()
    review_reaction = ReviewReactionSerializer()
    rating = RatingReadSerializer()
    rating_comment = RatingCommentSerializer()
    rating_reply = RatingReplySerializer()
    rating_reaction = RatingReactionSerializer()
    in_queue = serializers.BooleanField()
    in_watchlist = serializers.CharField()

    class Meta:
        model = ActivityFeedItem
        fields = ['id', 'activity_type', 'review', 'review_comment', 'review_reply',
                  'review_reaction', 'rating', 'rating_comment',
                  'rating_reply', 'rating_reaction', 'user_profile', 'timestamp', 'in_queue', 'in_watchlist']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'message_type', 'content_id', 'activity_feed_id', 'message_text',
                  'reaction_emoji', 'status_unread', 'sender', 'recipient', 'timestamp']
