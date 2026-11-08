from rest_framework.routers import DefaultRouter

from .views import AdminDocumentViewSet

router = DefaultRouter()
router.register("content", AdminDocumentViewSet, basename="admin-content")

urlpatterns = router.urls
