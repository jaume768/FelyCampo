from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AdminMeView, FeatureFlagViewSet

router = DefaultRouter()
router.register("feature-flags", FeatureFlagViewSet, basename="admin-feature-flag")

urlpatterns = [
    path("me/", AdminMeView.as_view(), name="admin-me"),
    path("", include(router.urls)),
]
