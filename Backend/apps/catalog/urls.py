from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    FamilyViewSet,
    ProductEnquiryView,
    ProductViewSet,
    SizeViewSet,
    StockNotificationView,
)

router = DefaultRouter()
router.register("products", ProductViewSet, basename="product")
router.register("families", FamilyViewSet, basename="family")
router.register("categories", CategoryViewSet, basename="category")
router.register("sizes", SizeViewSet, basename="size")

urlpatterns = [
    path("catalog/", include(router.urls)),
    path(
        "catalog/stock-notifications/",
        StockNotificationView.as_view(),
        name="stock-notification",
    ),
    path("catalog/enquiries/", ProductEnquiryView.as_view(), name="product-enquiry"),
]
