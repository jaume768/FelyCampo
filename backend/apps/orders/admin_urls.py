from rest_framework.routers import DefaultRouter

from .admin_views import AdminOrderViewSet, AdminReturnViewSet

router = DefaultRouter()
router.register("orders", AdminOrderViewSet, basename="admin-order")
router.register("returns", AdminReturnViewSet, basename="admin-return")

urlpatterns = router.urls
