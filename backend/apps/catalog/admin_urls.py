from rest_framework.routers import DefaultRouter

from .admin_views import (
    AdminCategoryViewSet,
    AdminCollectionViewSet,
    AdminColorViewSet,
    AdminColorwayViewSet,
    AdminFabricViewSet,
    AdminFamilyViewSet,
    AdminProductImageViewSet,
    AdminProductViewSet,
    AdminSizeViewSet,
    AdminVariantViewSet,
)

router = DefaultRouter()
router.register("products", AdminProductViewSet, basename="admin-product")
router.register("colorways", AdminColorwayViewSet, basename="admin-colorway")
router.register("variants", AdminVariantViewSet, basename="admin-variant")
router.register("product-images", AdminProductImageViewSet, basename="admin-product-image")
router.register("families", AdminFamilyViewSet, basename="admin-family")
router.register("categories", AdminCategoryViewSet, basename="admin-category")
router.register("sizes", AdminSizeViewSet, basename="admin-size")
router.register("colors", AdminColorViewSet, basename="admin-color")
router.register("fabrics", AdminFabricViewSet, basename="admin-fabric")
router.register("collections", AdminCollectionViewSet, basename="admin-collection")

urlpatterns = router.urls
