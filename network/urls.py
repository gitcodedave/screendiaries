from rest_framework_nested import routers
from . import views
from django.urls import path

router = routers.DefaultRouter()

router.register('userprofiles', views.UserProfileViewSet)
router.register('follows', views.FollowViewSet)
router.register('watchlistitems', views.WatchListItemViewSet)
router.register('queueitems', views.QueueItemViewSet)
router.register('topten', views.TopTenViewSet)
router.register('reviews', views.ReviewViewSet)
router.register('ratings', views.RatingViewSet)
router.register('activityfeeditems', views.ActivityFeedItemViewSet)
router.register('messages', views.MessageViewSet)

reviews_router = routers.NestedDefaultRouter(
    router, 'reviews', lookup='review'
)
reviews_router.register(
    'comments', views.ReviewCommentViewSet, basename='review-comments')
reviews_router.register(
    'reactions', views.ReviewReactionViewSet, basename='review-reactions')

review_comments_router = routers.NestedDefaultRouter(
    reviews_router, 'comments', lookup='comment'
)
review_comments_router.register(
    'replies', views.ReviewReplyViewSet, basename='comment-replies')


ratings_router = routers.NestedDefaultRouter(
    router, 'ratings', lookup='rating'
)
ratings_router.register(
    'comments', views.RatingCommentViewSet, basename='rating-comments')
ratings_router.register(
    'reactions', views.RatingReactionViewSet, basename='rating-reactions')

rating_comments_router = routers.NestedDefaultRouter(
    ratings_router, 'comments', lookup='comment'
)
rating_comments_router.register(
    'replies', views.RatingReplyViewSet, basename='comment-replies')


# URLConf
urlpatterns = router.urls + reviews_router.urls + \
    review_comments_router.urls + ratings_router.urls + rating_comments_router.urls + \
    [path('contentsearch', views.ContentSearch.as_view(), name='content-search')]

