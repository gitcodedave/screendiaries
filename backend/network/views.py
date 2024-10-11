from django.db.models import Case, When, Value, CharField
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, filters
from rest_framework.parsers import MultiPartParser, FormParser
from network.models import ActivityFeedItem, Content, Follow, Message, QueueItem, Rating, RatingComment, RatingReaction, RatingReply, Review, ReviewComment, ReviewReaction, ReviewReply, TopTen, UserProfile, WatchListItem
from network.serializers import ActivityFeedItemReadSerializer, ActivityFeedItemSerializer, ContentSerializer, ContentWithStatusSerializer, FollowSerializer, FollowWithUserProfileSerializer, MessageSerializer, QueueItemSerializer, RatingCommentSerializer, RatingReactionSerializer, RatingReplySerializer, RatingSerializer, ReviewCommentSerializer, ReviewReactionSerializer, ReviewReplySerializer, ReviewSerializer, TopTenSerializer, UserProfileSerializer, WatchListItemSerializer
import requests
import os

from dotenv import load_dotenv
load_dotenv()
# Create your views here.


class UserProfileViewSet(ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    parser_classes = (MultiPartParser, FormParser)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['user__username', 'user__first_name',
                     'user__last_name']  # Fields to search

    @action(detail=False, methods=['GET'])
    def me(self, request):
        user = UserProfile.objects.get(user_id=request.user.id)
        if request.method == 'GET':
            serializer = UserProfileSerializer(user)
            return Response(serializer.data)


class FollowViewSet(ModelViewSet):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer


class MyFollowListView(APIView):
    def get(self, request, user_id):
        follows = Follow.objects.filter(
            follower=user_id).order_by('timestamp')
        serializer = FollowWithUserProfileSerializer(follows, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MyFollowView(APIView):
    serializer_class = FollowSerializer

    def get(self, request, follower, following):
        try:
            follow = Follow.objects.get(
                follower=follower, following=following)
        except Follow.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = FollowSerializer(follow)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, follower, following):
        instance = Follow.objects.get(
            follower=follower, following=following)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserFollowCountView(APIView):
    serializer_class = FollowSerializer

    def get(self, request, user_id):
        followerCount = Follow.objects.select_related(
            'user_profile').filter(follower_id=user_id).count()
        return Response(followerCount, status=status.HTTP_200_OK)


class ContentViewSet(ModelViewSet):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer


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
                if 'episode' in params:
                    api_params['episode'] = params['episode']
                    api_params['season'] = params['season']
                    api_params['t'] = params['t']
                    api_params['type'] = 'episode'
                else:
                    api_params = {
                        't': params['s'],
                        'season': params['season'],
                        'type': 'series'
                    }
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


class MyWatchListView(APIView):
    serializer_class = WatchListItemSerializer

    def get(self, request, user_id):
        # Fetch and order WatchListItem objects
        watchlist_items = WatchListItem.objects.filter(
            user_profile_id=user_id).order_by('timestamp')

        # Create a dictionary of content_id to status
        status_dict = {
            item.content_id: item.status for item in watchlist_items}

        # Create a list of content_ids in the same order as watchlist_items
        content_ids_ordered = [item.content_id for item in watchlist_items]

        # Annotate Content objects with status
        case_status = Case(
            *[When(pk=content_id, then=Value(status))
              for content_id, status in status_dict.items()],
            output_field=CharField(),
        )

        # Retrieve Content objects and annotate with status
        content_objects = Content.objects.filter(
            pk__in=content_ids_ordered).annotate(status=case_status)

        # Create a dictionary of content_id to Content object for ordering
        content_dict = {content.pk: content for content in content_objects}

        # Maintain the order of Content objects based on content_ids_ordered
        ordered_content = [content_dict[content_id]
                           for content_id in content_ids_ordered]

        # Serialize the ordered Content objects
        serializer = ContentWithStatusSerializer(ordered_content, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, content_id, user_id):
        instance = WatchListItem.objects.filter(
            content_id=content_id, user_profile_id=user_id)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ContentInWatchListView(APIView):
    serializer_class = WatchListItemSerializer

    def get(self, request, content_id, user_id):
        try:
            watchlist_item = WatchListItem.objects.select_related('user_profile').get(
                content_id=content_id, user_profile_id=user_id)
        except WatchListItem.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = WatchListItemSerializer(watchlist_item)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ContentInQueueView(APIView):
    serializer_class = QueueItemSerializer

    def get(self, request, content_id, user_id):
        try:
            queue_item = QueueItem.objects.select_related('user_profile').get(
                content_id=content_id, user_profile_id=user_id)
        except QueueItem.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = QueueItemSerializer(queue_item)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MyQueueView(APIView):
    serializer_class = QueueItemSerializer

    def get(self, request, user_id):
        queue_items = QueueItem.objects.filter(
            user_profile_id=user_id).order_by('timestamp')
        content_ids = [item.content_id for item in queue_items]
        content_objects = Content.objects.filter(pk__in=content_ids)
        content_dict = {content.imdbid: content for content in content_objects}
        ordered_content = [content_dict[content_id]
                           for content_id in content_ids]
        serializer = ContentSerializer(ordered_content, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, content_id, user_id):
        instance = QueueItem.objects.filter(
            content_id=content_id, user_profile_id=user_id)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class QueueItemViewSet(ModelViewSet):
    queryset = QueueItem.objects.all()
    serializer_class = QueueItemSerializer


class TopTenViewSet(ModelViewSet):
    queryset = TopTen.objects.all()
    serializer_class = TopTenSerializer


class ReviewViewSet(ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer


class UserReviewsView(APIView):
    serializer_class = ReviewSerializer

    def get(self, request, user_id):
        reviews = Review.objects.filter(user_profile_id=user_id)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AllOtherReviewsView(APIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def get(self, request, content_id, user_id):
        reviews = Review.objects.select_related('user_profile').filter(
            content_id=content_id).exclude(user_profile_id=user_id)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MyReviewView(APIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def get(self, request, content_id, user_id):
        review = Review.objects.select_related('user_profile').get(
            content_id=content_id, user_profile_id=user_id)
        serializer = ReviewSerializer(review)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ContentReviewsView(APIView):
    serializer_class = ReviewSerializer

    def get(self, request, content_id):
        reviews = Review.objects.select_related(
            'user_profile').filter(content_id=content_id)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserReviewCountView(APIView):
    serializer_class = ReviewSerializer

    def get(self, request, user_id):
        reviewCount = Review.objects.select_related(
            'user_profile').filter(user_profile_id=user_id).count()
        return Response(reviewCount, status=status.HTTP_200_OK)


class UserRatingCountView(APIView):
    serializer_class = RatingSerializer

    def get(self, request, user_id):
        ratingCount = Rating.objects.select_related(
            'user_profile').filter(user_profile_id=user_id).count()
        return Response(ratingCount, status=status.HTTP_200_OK)


class RatingViewSet(ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer


class UserRatingsView(APIView):
    serializer_class = RatingSerializer

    def get(self, request, user_id):
        ratings = Rating.objects.filter(user_profile_id=user_id)
        serializer = RatingSerializer(ratings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ContentRatingsView(APIView):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer

    def get(self, request, content_id):
        ratings = Rating.objects.select_related(
            'user_profile').filter(content_id=content_id)
        serializer = RatingSerializer(ratings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MyRatingView(APIView):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer

    def get(self, request, content_id, user_id):
        rating = Rating.objects.select_related('user_profile').get(
            content_id=content_id, user_profile_id=user_id)
        serializer = RatingSerializer(rating)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, content_id, user_id):
        try:
            rating = Rating.objects.select_related('user_profile').get(
                content_id=content_id, user_profile_id=user_id)
        except Rating.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = RatingSerializer(
            rating, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ActivityFeedItemViewSet(ModelViewSet):
    queryset = ActivityFeedItem.objects.all()
    serializer_class = ActivityFeedItemSerializer


class MyActivityFeedView(APIView):
    serializer_class = ActivityFeedItemSerializer

    def get(self, request):
        user_list = request.GET.get('user_list')
        if user_list:
            user_list = user_list.split(',')
            user_list = [int(num) for num in user_list]
        else:
            user_list = []
        activity_feed = ActivityFeedItem.objects.select_related().filter(user_profile__in=user_list).order_by('timestamp')
        serializer = ActivityFeedItemReadSerializer(activity_feed, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


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
