from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import ActivityFeedItem, Content, Follow, Message, QueueItem, Rating, Review, Comment, Reaction, TopTen, Update, UserProfile, WatchListItem


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


class RatingSerializer(serializers.ModelSerializer):
    user_profile = UserProfileSerializer(read_only=True)
    user_profile_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(), write_only=True, source='user_profile'
    )

    class Meta:
        model = Rating
        fields = ['id', 'rating', 'content', 'activity_feed',
                  'user_profile_id', 'user_profile', 'timestamp']


class ReactionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Reaction
        fields = ['id', 'reaction', 'comment', 'activity_feed',
                  'review', 'rating', 'user_profile']
        
    def validate(self, attrs):
        instance = Reaction(**attrs)
        instance.full_clean()
        return attrs


class ReactionReadSerializer(serializers.ModelSerializer):
    user_profile = UserProfileSerializer()

    class Meta:
        model = Reaction
        fields = ['id', 'reaction', 'comment', 'activity_feed',
                  'review', 'rating', 'user_profile']




class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    reactions = ReactionSerializer(many=True)
    user_profile = UserProfileSerializer()

    class Meta:
        model = Comment
        fields = ['id', 'comment_text', 'replies', 'reactions', 'parent', 'activity_feed',
                  'user_profile', 'timestamp']

    def get_replies(self, obj):
        replies = obj.replies.all()
        return CommentSerializer(replies, many=True).data


class ReviewSerializer(serializers.ModelSerializer):
    user_profile = UserProfileSerializer(read_only=True)
    user_profile_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(), write_only=True, source='user_profile'
    )

    class Meta:
        model = Review
        fields = ['id', 'review_text', 'activity_feed', 'rating', 'content',
                  'user_profile', 'user_profile_id', 'contains_spoiler', 'timestamp']


class ActivityFeedItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityFeedItem
        fields = ['id', 'activity_type',
                  'user_profile', 'timestamp']


class ReviewReadSerializer(serializers.ModelSerializer):
    user_profile = UserProfileSerializer(read_only=True)
    user_profile_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(), write_only=True, source='user_profile'
    )
    activity_feed = ActivityFeedItemSerializer()
    content = ContentSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'review_text', 'rating', 'contains_spoiler', 'content', 'activity_feed',
                  'user_profile_id', 'user_profile', 'timestamp']


class RatingReadSerializer(serializers.ModelSerializer):
    user_profile = UserProfileSerializer(read_only=True)
    user_profile_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(), write_only=True, source='user_profile'
    )
    activity_feed = ActivityFeedItemSerializer()
    content = ContentSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'rating', 'content', 'activity_feed',
                  'user_profile_id', 'user_profile', 'timestamp']


class ActivityFeedItemReadSerializer(serializers.ModelSerializer):
    user_profile = UserProfileSerializer(read_only=True)
    user_profile_id = serializers.PrimaryKeyRelatedField(queryset=UserProfile.objects.all(), write_only=True, source='user_profile')
    review = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True)
    reactions = ReactionSerializer(many=True)
    in_queue = serializers.BooleanField()
    in_watchlist = serializers.CharField()

    class Meta:
        model = ActivityFeedItem
        fields = ['id', 'activity_type', 'review', 'rating', 'comments', 'reactions', 'in_queue', 'in_watchlist',
                  'user_profile', 'user_profile_id', 'timestamp']

    def get_review(self, obj):
        review = obj.reviews.first()
        return ReviewReadSerializer(review).data if review else None

    def get_rating(self, obj):
        rating = obj.ratings.first()
        return RatingReadSerializer(rating).data if rating else None


class NewCommentSerializer(serializers.ModelSerializer):
    user_profile = UserProfileSerializer(read_only=True)
    user_profile_id = serializers.PrimaryKeyRelatedField(queryset=UserProfile.objects.all(), write_only=True, source='user_profile')
    
    activity_feed = ActivityFeedItemSerializer(read_only=True)
    activity_feed_id = serializers.PrimaryKeyRelatedField(queryset=ActivityFeedItem.objects.all(), write_only=True, source='activity_feed')

    class Meta:
        model = Comment
        fields = ['id', 'comment_text', 'parent', 'activity_feed', 'activity_feed_id',
                  'user_profile', 'user_profile_id', 'timestamp']
        

class ActivityFeedItemReactionSerializer(serializers.ModelSerializer):
    review = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True)
    reactions = ReactionReadSerializer(many=True)
    user_profile = UserProfileSerializer()

    class Meta:
        model = ActivityFeedItem
        fields = ['id', 'activity_type', 'review', 'rating', 'comments', 'reactions',
                  'user_profile', 'timestamp']

    def get_review(self, obj):
        review = obj.reviews.first()
        return ReviewReadSerializer(review).data if review else None

    def get_rating(self, obj):
        rating = obj.ratings.first()
        return RatingReadSerializer(rating).data if rating else None


class MyActivityFeedItemReadSerializer(serializers.ModelSerializer):
    review = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True)
    reactions = ReactionSerializer(many=True)
    in_queue = serializers.BooleanField()
    in_watchlist = serializers.CharField()

    class Meta:
        model = ActivityFeedItem
        fields = ['id', 'activity_type', 'review', 'rating', 'comments', 'reactions', 'in_queue', 'in_watchlist',
                  'user_profile', 'timestamp']

    def get_review(self, obj):
        if hasattr(obj, 'reviews') and obj.reviews.exists():
            review = obj.reviews.first()
            return ReviewReadSerializer(review).data
        return None

    def get_rating(self, obj):
        if hasattr(obj, 'ratings') and obj.ratings.exists():
            rating = obj.ratings.first()
            return RatingReadSerializer(rating).data
        return None


class UpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Update
        fields = ['id', 'update_type', 'user_profile',
                  'follower', 'activity_feed_item', 'read_status', 'timestamp']


class MyUpdatesSerializer(serializers.ModelSerializer):
    follower = UserProfileSerializer()
    activity_feed_item = ActivityFeedItemSerializer()

    class Meta:
        model = Update
        fields = ['id', 'update_type', 'user_profile',
                  'follower', 'activity_feed_item', 'read_status', 'timestamp']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'message_type', 'content_id', 'activity_feed_id', 'message_text',
                  'reaction_emoji', 'status_unread', 'sender', 'recipient', 'timestamp']
