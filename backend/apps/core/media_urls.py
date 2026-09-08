"""
URL absoluta de un archivo servido por Django (media), sin depender del `Host` de la
petición entrante.

`request.build_absolute_uri()` parecía la forma obvia de hacerlo, y así estaba hasta que
se detectó en vivo: cuando el frontend pide el catálogo desde su Server Component, la
petición sale del contenedor del frontend hacia `API_INTERNAL_URL`
(`http://backend:8000`, nombre de servicio Docker — ver CLAUDE.md, "NEXT_PUBLIC_API_URL
vs API_INTERNAL_URL"), así que el `Host` que ve Django es `backend:8000`. Con
`build_absolute_uri`, la URL de la imagen quedaba `http://backend:8000/media/...` —
resuelve perfectamente DENTRO de la red de Docker, pero el navegador del visitante no
tiene ni idea de qué es "backend": la imagen no cargaba nunca.

`BACKEND_PUBLIC_URL` es fijo (por entorno, no por petición) precisamente porque el sitio
público SÍ necesita que esta URL sea la que ve un navegador real, sea cual sea el origen
interno de la petición que la pidió.
"""

from django.conf import settings


def absolute_media_url(path: str) -> str:
    """@param path: valor de un `FileField`/`ImageField` `.url` (empieza por `MEDIA_URL`)."""
    return f"{settings.BACKEND_PUBLIC_URL.rstrip('/')}{path}"
