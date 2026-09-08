from rest_framework.routers import DefaultRouter

from .views import MediaAssetViewSet

router = DefaultRouter()
router.register("media", MediaAssetViewSet, basename="admin-media")

urlpatterns = router.urls
