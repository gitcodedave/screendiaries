from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, GenericViewSet

from network import serializers
from network.models import ActivityFeedItem, Content, Follow, Message, QueueItem, Rating, RatingComment, RatingReaction, RatingReply, Review, ReviewComment, ReviewReaction, ReviewReply, TopTen, UserProfile, WatchListItem
from network.serializers import ActivityFeedItemSerializer, ContentSerializer, FollowSerializer, MessageSerializer, QueueItemSerializer, RatingCommentSerializer, RatingReactionSerializer, RatingReplySerializer, RatingSerializer, ReviewCommentSerializer, ReviewReactionSerializer, ReviewReplySerializer, ReviewSerializer, TopTenSerializer, UserProfileSerializer, WatchListItemSerializer

# Create your views here.


class UserProfileViewSet(ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer


class FollowViewSet(ModelViewSet):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer


class ContentViewSet(ModelViewSet):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer


class WatchListItemViewSet(ModelViewSet):
    queryset = WatchListItem.objects.all()
    serializer_class = WatchListItemSerializer


class QueueItemViewSet(ModelViewSet):
    queryset = QueueItem.objects.all()
    serializer_class = QueueItemSerializer


class TopTenViewSet(ModelViewSet):
    queryset = TopTen.objects.all()
    serializer_class = TopTenSerializer


class ReviewViewSet(ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer


class RatingViewSet(ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer


class ActivityFeedItemViewSet(ModelViewSet):
    queryset = ActivityFeedItem.objects.all()
    serializer_class = ActivityFeedItemSerializer


class ReviewCommentViewSet(ModelViewSet):
    queryset = ReviewComment.objects.all()
    serializer_class = ReviewCommentSerializer


class ReviewReplyViewSet(ModelViewSet):
    queryset = ReviewReply.objects.all()
    serializer_class = ReviewReplySerializer


class ReviewReactionViewSet(ModelViewSet):
    queryset = ReviewReaction.objects.all()
    serializer_class = ReviewReactionSerializer


class RatingCommentViewSet(ModelViewSet):
    queryset = RatingComment.objects.all()
    serializer_class = RatingCommentSerializer


class RatingReplyViewSet(ModelViewSet):
    queryset = RatingReply.objects.all()
    serializer_class = RatingReplySerializer


class RatingReactionViewSet(ModelViewSet):
    queryset = RatingReaction.objects.all()
    serializer_class = RatingReactionSerializer


class MessageViewSet(ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
