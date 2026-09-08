from rest_framework.routers import DefaultRouter

from .views import AdminLocationViewSet, AdminStockMovementViewSet, AdminStockVariantViewSet

router = DefaultRouter()
router.register("variants", AdminStockVariantViewSet, basename="admin-stock-variant")
router.register("movements", AdminStockMovementViewSet, basename="admin-stock-movement")
router.register("locations", AdminLocationViewSet, basename="admin-stock-location")

urlpatterns = router.urls
