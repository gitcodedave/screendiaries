import json
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework.mixins import ListModelMixin
from rest_framework import status

from network import serializers
from network.models import ActivityFeedItem, Content, Follow, Message, QueueItem, Rating, RatingComment, RatingReaction, RatingReply, Review, ReviewComment, ReviewReaction, ReviewReply, TopTen, UserProfile, WatchListItem
from network.serializers import ActivityFeedItemSerializer, ContentSerializer, FollowSerializer, MessageSerializer, QueueItemSerializer, RatingCommentSerializer, RatingReactionSerializer, RatingReplySerializer, RatingSerializer, ReviewCommentSerializer, ReviewReactionSerializer, ReviewReplySerializer, ReviewSerializer, TopTenSerializer, UserProfileSerializer, WatchListItemSerializer
import requests
import os

from dotenv import load_dotenv
load_dotenv()
# Create your views here.


class UserProfileViewSet(ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer


class FollowViewSet(ModelViewSet):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer


class ContentSearchView(APIView):
    serializer_class = ContentSerializer

    def get(self, request):
        omdb_url = 'https://www.omdbapi.com/'
        params = dict(request.query_params.copy().items())
        api_params = {}
        if not params:
            return Response({'error': 'Please enter valid parameters'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        if 'i' in params:
            api_params = {
                'i': params['i']
            }
        else:
            if params['type'] == 'series' and 'season' in params:
                api_params = {
                    't': params['s'],
                    'season': params['season']
                }
                if 'episode' in params:
                    api_params['episode'] = params['episode']
            else:
                api_params = {
                    's': params['s'],
                    'type': params['type'],
                }

        api_params['apikey'] = str(os.getenv('OMDB_API_KEY'))
        try:
            response = requests.get(omdb_url, params=api_params)
            response_data = response.json()

            if response.status_code == 200:
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                return Response(response_data, status=response.status_code)
        except requests.exceptions.RequestException as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        serializer = ContentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


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
