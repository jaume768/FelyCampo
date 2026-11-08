from rest_framework import serializers

from .models import Document, DocumentRevision


class PublicDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ("key", "data", "version", "updated_at")
        read_only_fields = fields


class AdminDocumentSummarySerializer(serializers.ModelSerializer):
    """Listado del panel: sin `data`, que entre todos los documentos pasa de 500 KB."""

    updated_by = serializers.EmailField(source="updated_by.email", default=None, read_only=True)

    class Meta:
        model = Document
        fields = ("key", "version", "updated_at", "updated_by")
        read_only_fields = fields


class AdminDocumentSerializer(AdminDocumentSummarySerializer):
    class Meta(AdminDocumentSummarySerializer.Meta):
        fields = ("key", "data", "version", "updated_at", "updated_by")
        read_only_fields = fields


class PublishDocumentSerializer(serializers.Serializer):
    """
    `version`: la versión que el panel tenía al empezar a editar. Obligatoria: sin ella
    no hay forma de saber si se está pisando una publicación ajena.
    """

    data = serializers.JSONField()
    version = serializers.IntegerField(min_value=1)


class RevisionSummarySerializer(serializers.ModelSerializer):
    created_by = serializers.EmailField(source="created_by.email", default=None, read_only=True)

    class Meta:
        model = DocumentRevision
        fields = ("version", "created_at", "created_by")
        read_only_fields = fields


class RevisionSerializer(RevisionSummarySerializer):
    class Meta(RevisionSummarySerializer.Meta):
        fields = ("version", "data", "created_at", "created_by")
        read_only_fields = fields
