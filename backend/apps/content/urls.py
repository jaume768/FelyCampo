from django.urls import re_path

from .views import KEY_REGEX, PublicDocumentsView, PublicDocumentView

urlpatterns = [
    re_path(r"^content/$", PublicDocumentsView.as_view(), name="content-documents"),
    re_path(
        rf"^content/(?P<key>{KEY_REGEX})/$",
        PublicDocumentView.as_view(),
        name="content-document",
    ),
]
