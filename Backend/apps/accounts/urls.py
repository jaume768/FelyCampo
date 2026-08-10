from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AddressViewSet,
    CSRFTokenView,
    FavoriteViewSet,
    LoginView,
    LogoutView,
    MeView,
    PasswordChangeView,
    RegisterView,
)

router = DefaultRouter()
router.register("addresses", AddressViewSet, basename="address")
router.register("favorites", FavoriteViewSet, basename="favorite")

urlpatterns = [
    path("auth/csrf/", CSRFTokenView.as_view(), name="csrf"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/password/", PasswordChangeView.as_view(), name="password-change"),
    path("account/me/", MeView.as_view(), name="me"),
    path("account/", include(router.urls)),
]
