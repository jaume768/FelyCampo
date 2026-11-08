from django.urls import re_path

from .views import KEY_REGEX, PublicDocumentView

urlpatterns = [
    re_path(
        rf"^content/(?P<key>{KEY_REGEX})/$",
        PublicDocumentView.as_view(),
        name="content-document",
    ),
]
