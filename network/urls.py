from rest_framework_nested import routers
from . import views

router = routers.DefaultRouter()

router.register('userprofiles', views.UserProfileViewSet)

# URLConf
urlpatterns = router.urls