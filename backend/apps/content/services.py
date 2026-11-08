import json

from django.db import transaction

from apps.core.exceptions import BusinessRuleError

from . import registry
from .models import Document, DocumentRevision
from .revalidation import revalidate_document


def validate_document(key: str, data) -> None:
    """Comprobación estructural (ver `registry`). Lanza `ValueError` con el motivo."""
    expected = registry.DOCUMENTS.get(key)
    if expected is None:
        raise ValueError(f"No existe el documento «{key}».")
    if not isinstance(data, expected):
        kind = "un objeto" if expected is dict else "una lista"
        raise ValueError(f"«{key}» tiene que ser {kind}.")
    size = len(json.dumps(data, ensure_ascii=False).encode())
    if size > registry.MAX_DOCUMENT_BYTES:
        raise ValueError(
            f"«{key}» ocupa demasiado ({size // 1024} KB; máximo "
            f"{registry.MAX_DOCUMENT_BYTES // 1024} KB)."
        )


@transaction.atomic
def publish_document(
    key: str, data, *, expected_version: int | None, user=None, revalidate: bool = True
) -> Document:
    """
    Publica una sección. `expected_version` es la versión sobre la que editó el panel:
    si alguien ha publicado después, 409 `version_conflict` con quién y cuándo, para
    que el panel pueda avisar en vez de pisar el trabajo de otra persona.

    `expected_version=None` y `revalidate=False` solo los usa la carga inicial
    (`cargar_contenido`), que no viene de ningún editor y se ejecuta antes de que el
    frontend esté levantado.
    """
    validate_document(key, data)

    document = Document.objects.select_for_update().filter(key=key).first()
    if document is None:
        document = Document(key=key, data=data, version=1, updated_by=user)
        document.save()
    else:
        if expected_version is not None and expected_version != document.version:
            raise BusinessRuleError(
                "Otra persona ha publicado cambios en esta sección mientras la editabas. "
                "Recarga para ver su versión antes de publicar la tuya.",
                code="version_conflict",
                details={
                    "current_version": document.version,
                    "updated_at": document.updated_at.isoformat(),
                    "updated_by": document.updated_by.email if document.updated_by else None,
                },
            )
        document.data = data
        document.version += 1
        document.updated_by = user
        document.save(update_fields=["data", "version", "updated_by", "updated_at"])

    DocumentRevision.objects.create(
        document=document, version=document.version, data=data, created_by=user
    )
    old = document.revisions.order_by("-version").values_list("pk", flat=True)[
        registry.MAX_REVISIONS :
    ]
    DocumentRevision.objects.filter(pk__in=list(old)).delete()

    # Después del commit: si la transacción se deshace, la web no debe enterarse.
    if revalidate:
        transaction.on_commit(lambda: revalidate_document(key))
    return document
