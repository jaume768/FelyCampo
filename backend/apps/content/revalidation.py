"""
Aviso a Next.js de que un documento ha cambiado, para que lo publicado salga al momento.

La web lee cada documento con `fetch(..., {next: {tags: ["contenido:<clave>"]}})` y lo
guarda en caché; esta llamada hace que Next invalide esa etiqueta
(`Frontend/src/app/api/revalidar/route.js`, protegida con `REVALIDATE_SECRET`).

Va por la red interna (`FRONTEND_INTERNAL_URL`, en Docker `http://frontend:3000`), nunca
por el dominio público. Si falla, NO se deshace la publicación: el dato ya está guardado
y la caché caduca sola (`revalidate` en el frontend), así que se registra y se sigue.
"""

import json
import logging
import urllib.error
import urllib.request

from django.conf import settings

from .registry import TAG_CONTENIDO, cache_tag

logger = logging.getLogger(__name__)

TIMEOUT_SECONDS = 5


def revalidate_document(key: str) -> bool:
    base = settings.FRONTEND_INTERNAL_URL
    secret = settings.REVALIDATE_SECRET
    if not base or not secret:
        logger.info("Revalidación desactivada (falta FRONTEND_INTERNAL_URL o REVALIDATE_SECRET)")
        return False

    request = urllib.request.Request(
        f"{base.rstrip('/')}/api/revalidar",
        data=json.dumps({"tags": [TAG_CONTENIDO, cache_tag(key)]}).encode(),
        headers={"Content-Type": "application/json", "X-Revalidate-Secret": secret},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:  # noqa: S310
            ok = 200 <= response.status < 300
    except (urllib.error.URLError, TimeoutError) as exc:
        logger.warning("No se pudo revalidar «%s» en el frontend: %s", key, exc)
        return False
    if not ok:
        logger.warning("El frontend respondió %s al revalidar «%s»", response.status, key)
    return ok
