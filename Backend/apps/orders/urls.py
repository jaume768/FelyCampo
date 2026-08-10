from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CartItemView,
    CartView,
    CheckoutView,
    GuestOrderLookupView,
    OrderViewSet,
    StripeWebhookView,
)

router = DefaultRouter()
router.register("orders", OrderViewSet, basename="order")

urlpatterns = [
    path("cart/", CartView.as_view(), name="cart"),
    path("cart/items/<uuid:item_id>/", CartItemView.as_view(), name="cart-item"),
    path("checkout/", CheckoutView.as_view(), name="checkout"),
    path("orders/lookup/", GuestOrderLookupView.as_view(), name="order-lookup"),
    path("webhooks/stripe/", StripeWebhookView.as_view(), name="stripe-webhook"),
    path("", include(router.urls)),
]
