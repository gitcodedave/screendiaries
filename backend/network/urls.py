from rest_framework_nested import routers
from . import views
from django.urls import path

router = routers.DefaultRouter()

router.register('userprofiles', views.UserProfileViewSet)
router.register('follows', views.FollowViewSet)
router.register('content', views.ContentViewSet)
router.register('watchlistitems', views.WatchListItemViewSet)
router.register('queueitems', views.QueueItemViewSet)
router.register('topten', views.TopTenViewSet)
router.register('reviews', views.ReviewViewSet)
router.register('reviewreactions', views.ReviewReactionViewSet)
router.register('ratings', views.RatingViewSet)
router.register('activityfeeditems', views.ActivityFeedItemViewSet)
router.register('updates', views.UpdateViewSet)
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
    [path('contentsearch/', views.ContentSearchView.as_view(), name='content-search')] + \
    [path('userreviews/<int:user_id>/', views.UserReviewsView.as_view(), name='user-reviews')] + \
    [path('userreviewcount/<int:user_id>/', views.UserReviewCountView.as_view(), name='user-review-count')] + \
    [path('userratingcount/<int:user_id>/', views.UserRatingCountView.as_view(), name='user-rating-count')] + \
    [path('mywatchlist/<int:user_id>/', views.MyWatchListView.as_view(), name='my-watchlist')] + \
    [path('friendwatchlist/', views.FriendWatchListView.as_view(), name='friend-watchlist')] + \
    [path('update/', views.UpdateIdView.as_view(), name='update')] + \
    [path('myupdates/<int:user_id>/', views.MyUpdatesView.as_view(), name='my-updates')] + \
    [path('myupdatesread/<int:user_id>/', views.MyUpdatesReadView.as_view(), name='my-updates-read')] + \
    [path('myupdatecount/<int:user_id>/', views.MyUpdateCountView.as_view(), name='my-update-count')] + \
    [path('removeupdate/<int:update_id>/', views.UpdateIdView.as_view(), name='remove-update')] + \
    [path('mywatchlistdelete/<str:content_id>/<int:user_id>/', views.MyWatchListView.as_view(), name='watchlist-item-delete')] + \
    [path('myqueue/<int:user_id>/', views.MyQueueView.as_view(), name='my-queue')] + \
    [path('myqueuedelete/<str:content_id>/<int:user_id>/', views.MyQueueView.as_view(), name='queue-item-delete')] + \
    [path('checkfollow/<int:follower>/<int:following>/', views.MyFollowView.as_view(), name='check-if-follow')] + \
    [path('unfollow/<int:follower>/<int:following>/', views.MyFollowView.as_view(), name='unfollow')] + \
    [path('friendslist/<int:user_id>/', views.MyFollowListView.as_view(), name='follow-list')] + \
    [path('myactivityfeed/', views.MyActivityFeedView.as_view(), name='activity-feed')] + \
    [path('userfollowcount/<int:user_id>/', views.UserFollowCountView.as_view(), name='user-follow-count')] + \
    [path('userratings/<int:user_id>/', views.UserRatingsView.as_view(), name='user-ratings')] + \
    [path('myrating/<str:content_id>/<int:user_id>/', views.MyRatingView.as_view(), name='my-rating')] + \
    [path('myratingfeed/<int:user_id>/', views.MyRatingFeedView.as_view(), name='my-rating-feed')] + \
    [path('myreview/<str:content_id>/<int:user_id>/', views.MyReviewView.as_view(), name='my-review')] + \
    [path('myreviewfeed/<int:user_id>/', views.MyReviewFeedView.as_view(), name='my-review-feed')] + \
    [path('checkinqueue/<str:content_id>/<int:user_id>/', views.ContentInQueueView.as_view(), name='check-in-queue')] + \
    [path('checkinwatchlist/<str:content_id>/<int:user_id>/', views.ContentInWatchListView.as_view(), name='check-in-watchlist')] + \
    [path('allotherreviews/<str:content_id>/<int:user_id>/', views.AllOtherReviewsView.as_view(), name='all-other-reviews')] + \
    [path('contentreviews/<str:content_id>/', views.ContentReviewsView.as_view(), name='content-reviews')] + \
    [path('contentratings/<str:content_id>/',
          views.ContentRatingsView.as_view(), name='content-ratings')]
