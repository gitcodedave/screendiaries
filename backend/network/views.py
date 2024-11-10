from django.db.models import Case, When, Value, CharField, Subquery, OuterRef, Exists, IntegerField, Prefetch
from django.db import transaction
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, filters
from rest_framework.parsers import MultiPartParser, FormParser
from network.models import ActivityFeedItem, Content, Follow, Message, QueueItem, Rating, Review, Comment, Reaction, TopTen, Update, UserProfile, WatchListItem
from network.serializers import ActivityFeedItemReactionSerializer, ActivityFeedItemReadSerializer, ActivityFeedItemSerializer, ContentSerializer, ContentWithStatusSerializer, FollowSerializer, FollowWithUserProfileSerializer, FriendWatchListSerializer, MessageSerializer, MyActivityFeedItemReadSerializer, MyUpdatesSerializer, NewCommentSerializer, QueueItemSerializer, CommentSerializer, RatingReadSerializer, ReactionSerializer, RatingSerializer, ReviewReadSerializer, ReviewSerializer, TopTenSerializer, UpdateSerializer, UserProfileSerializer, WatchListItemSerializer
import requests

from dotenv import load_dotenv
load_dotenv()
# Create your views here.


class UserProfileViewSet(ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    parser_classes = (MultiPartParser, FormParser)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['user__username', 'user__first_name',
                     'user__last_name']

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
        api_params['apikey'] = '3f3860cf'
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


class FriendWatchListView(APIView):
    serializer_class = FriendWatchListSerializer

    def get(self, request):
        user_list = request.GET.get('user_list')
        if user_list:
            user_list = user_list.split(',')
            user_list = [int(num) for num in user_list]
        else:
            user_list = []

        watchlist_items = WatchListItem.objects.filter(
            user_profile_id__in=user_list
        ).order_by('-timestamp')

        status_dict = {}
        for item in watchlist_items:
            if item.content_id not in status_dict:
                status_dict[item.content_id] = []
            status_dict[item.content_id].append(
                (item.user_profile_id, item.status))

        content_ids_ordered = [item.content_id for item in watchlist_items]

        case_status = Case(
            *[
                When(pk=content_id, then=Value(status))
                for content_id, status_list in status_dict.items()
                for _, status in status_list
            ],
            output_field=CharField(),
        )

        case_user_profile = Case(
            *[
                When(pk=content_id, then=Value(user_id))
                for content_id, status_list in status_dict.items()
                for user_id, _ in status_list
            ],
            output_field=IntegerField(),
        )

        content_objects = Content.objects.filter(
            pk__in=content_ids_ordered
        ).annotate(status=case_status, user_profile_id=case_user_profile)

        user_profile_dict = {
            profile.pk: profile for profile in UserProfile.objects.filter(pk__in=user_list)}

        for content in content_objects:
            content.user_profile = user_profile_dict.get(
                content.user_profile_id)

        content_dict = {content.pk: content for content in content_objects}

        ordered_content = [content_dict[content_id]
                           for content_id in content_ids_ordered]

        serializer = FriendWatchListSerializer(ordered_content, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MyWatchListView(APIView):
    serializer_class = WatchListItemSerializer

    # This watchlist view annotates the status from content as well, in order by timestamp
    def get(self, request, user_id):
        watchlist_items = WatchListItem.objects.filter(
            user_profile_id=user_id).order_by('timestamp')
        status_dict = {
            item.content_id: item.status for item in watchlist_items}
        content_ids_ordered = [item.content_id for item in watchlist_items]
        case_status = Case(
            *[When(pk=content_id, then=Value(status))
              for content_id, status in status_dict.items()],
            output_field=CharField(),
        )
        content_objects = Content.objects.filter(
            pk__in=content_ids_ordered).annotate(status=case_status)
        content_dict = {content.pk: content for content in content_objects}
        ordered_content = [content_dict[content_id]
                           for content_id in content_ids_ordered]

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


class MyUpdatesView(APIView):
    queryset = Update.objects.all()
    serializer_class = UpdateSerializer

    def get(self, request, user_id):
        updates = Update.objects.filter(
            user_profile_id=user_id).order_by('-timestamp')

        serializer = MyUpdatesSerializer(updates, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MyUpdateReadView(APIView):
    queryset = Update.objects.all()
    serializer_class = UpdateSerializer

    def patch(self, request, update_id):
        update = Update.objects.get(pk=update_id)
        Update.objects.filter(pk=update_id).update(read_status=True)
        update.refresh_from_db()
        
        serializer = MyUpdatesSerializer(update)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MyUpdateCountView(APIView):
    def get(self, request, user_id):
        update_count = Update.objects.filter(
            user_profile_id=user_id, read_status=False).count()
        return Response(update_count, status=status.HTTP_200_OK)


class ActivityFeedItemViewSet(ModelViewSet):
    queryset = ActivityFeedItem.objects.all()
    serializer_class = ActivityFeedItemSerializer


class UpdateViewSet(ModelViewSet):
    queryset = Update.objects.all()
    serializer_class = UpdateSerializer


class UpdateIdView(APIView):
    def get(self, request):
        user_id = int(request.GET.get('user_id'))
        follower_profile = int(request.GET.get('follower_profile'))
        update_type = request.GET.get('update_type')
        activity_feed_item = request.GET.get('activity_feed_item')
        if activity_feed_item == 'null':
            update = Update.objects.filter(user_profile_id=user_id, follower_id=follower_profile,
                                           update_type=update_type, activity_feed_item_id__isnull=True).values_list('id', flat=True)
        else:
            activity_feed_item = int(activity_feed_item)
            update = Update.objects.filter(user_id_id=user_id, follower_profile_id=follower_profile,
                                           update_type=update_type, activity_feed_item_id=activity_feed_item).values_list('id', flat=True)

        return Response(update, status=status.HTTP_200_OK)

    def delete(self, request, update_id):
        instance = Update.objects.filter(
            pk=update_id)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ActivityView(APIView):
    serializer_class = ActivityFeedItemSerializer

    def get(self, request, activity_id, user_id):
        # Use filter instead of get to obtain a queryset, allowing annotate
        activity = ActivityFeedItem.objects.filter(id=activity_id)

        # Subqueries for queue and watchlist status
        queue_content_review_exists = QueueItem.objects.filter(
            content_id=OuterRef('reviews__content__imdbid'),
            user_profile=user_id
        )

        queue_content_rating_exists = QueueItem.objects.filter(
            content_id=OuterRef('ratings__content__imdbid'),
            user_profile=user_id
        )

        watchlist_content_review_subquery = WatchListItem.objects.filter(
            content_id=OuterRef('reviews__content__imdbid'),
            user_profile=user_id
        ).values('status')

        watchlist_content_rating_subquery = WatchListItem.objects.filter(
            content_id=OuterRef('ratings__content__imdbid'),
            user_profile=user_id
        ).values('status')

        activity = activity.prefetch_related(
            Prefetch(
                'reviews', queryset=Review.objects.prefetch_related('reactions')),
            Prefetch('comments', queryset=Comment.objects.filter(parent__isnull=True).prefetch_related(
                'replies',
                Prefetch('reactions', queryset=Reaction.objects.all())
            )),
            # Prefetch only reactions related to activity feed items
            Prefetch('reactions', queryset=Reaction.objects.filter(
                comment__isnull=True))
        ).annotate(
            in_queue=Case(
                When(activity_type='Review', then=Exists(
                    queue_content_review_exists)),
                When(activity_type='Rating', then=Exists(
                    queue_content_rating_exists)),
                default=Value(False),
                output_field=CharField()
            ),
            in_watchlist=Case(
                When(activity_type='Review', then=Subquery(
                    watchlist_content_review_subquery)),
                When(activity_type='Rating', then=Subquery(
                    watchlist_content_rating_subquery)),
                default=Value(False),
                output_field=CharField()
            )
        ).first()

        serializer = ActivityFeedItemReadSerializer(activity)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ActivityFeedView(APIView):
    serializer_class = ActivityFeedItemSerializer

    def get(self, request):
        # Get user list (the users the current user follows)
        user_list = request.GET.get('user_list')
        user_id = request.GET.get('user_id')
        if user_list:
            user_list = [int(num) for num in user_list.split(',')]
        else:
            user_list = []

        # Base ActivityFeedItem queryset
        activity_feed = ActivityFeedItem.objects.filter(
            user_profile__in=user_list
        ).order_by('-timestamp')

        # QueueItem subqueries
        queue_content_review_exists = QueueItem.objects.filter(
            content_id=OuterRef('reviews__content__imdbid'),
            user_profile=user_id
        )
        queue_content_rating_exists = QueueItem.objects.filter(
            content_id=OuterRef('ratings__content__imdbid'),
            user_profile=user_id
        )

        # WatchListItem subqueries
        watchlist_content_review_subquery = WatchListItem.objects.filter(
            content_id=OuterRef('reviews__content__imdbid'),
            user_profile=user_id
        ).values('status')
        watchlist_content_rating_subquery = WatchListItem.objects.filter(
            content_id=OuterRef('ratings__content__imdbid'),
            user_profile=user_id
        ).values('status')

        # Prefetch and annotate in a single queryset
        activity_feed = ActivityFeedItem.objects.filter(
            user_profile__in=user_list
        ).order_by('-timestamp').prefetch_related(
            Prefetch(
                'reviews', queryset=Review.objects.prefetch_related('reactions')),
            Prefetch('comments', queryset=Comment.objects.filter(parent__isnull=True).prefetch_related(
                'replies',
                Prefetch('reactions', queryset=Reaction.objects.all())
            )),
            # Prefetch only reactions related to activity feed items
            Prefetch('reactions', queryset=Reaction.objects.filter(
                comment__isnull=True))
        ).annotate(
            in_queue=Case(
                When(activity_type='Review', then=Exists(
                    queue_content_review_exists)),
                When(activity_type='Rating', then=Exists(
                    queue_content_rating_exists)),
                default=Value(False),
                output_field=CharField()
            ),
            in_watchlist=Case(
                When(activity_type='Review', then=Subquery(
                    watchlist_content_review_subquery)),
                When(activity_type='Rating', then=Subquery(
                    watchlist_content_rating_subquery)),
                default=Value(False),
                output_field=CharField()
            )
        )

        # Serialize the activity feed
        serializer = ActivityFeedItemReadSerializer(activity_feed, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MyReviewFeedView(APIView):
    def get(self, request, user_id):
        # Base query without annotations
        reviews = Review.objects.filter(
            user_profile=user_id
        ).order_by('-timestamp')

        # Serialize and return response
        serializer = ReviewReadSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MyRatingFeedView(APIView):
    def get(self, request, user_id):
        # Base query without annotations
        ratings = Rating.objects.filter(
            user_profile=user_id
        ).order_by('-timestamp')

        # Serialize and return response
        serializer = RatingReadSerializer(ratings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CheckReviewExistsView(APIView):
    def get(self, request, content_id, user_id):
        review_exists = Review.objects.filter(
            content_id=content_id, user_profile_id=user_id).exists()
        return Response({"exists": review_exists}, status=status.HTTP_200_OK)


class CheckRatingExistsView(APIView):
    def get(self, request, content_id, user_id):
        rating_exists = Rating.objects.filter(
            content_id=content_id, user_profile_id=user_id).exists()
        return Response({"exists": rating_exists}, status=status.HTTP_200_OK)


class CommentViewSet(ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = NewCommentSerializer


class ReactionViewSet(ModelViewSet):
    queryset = Reaction.objects.all()
    serializer_class = ReactionSerializer


class ReactionListView(APIView):
    def get(self, request, activity_id):

        activity = ActivityFeedItem.objects.get(
            id=activity_id
        )

        serializer = ActivityFeedItemReactionSerializer(activity)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MessageViewSet(ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
