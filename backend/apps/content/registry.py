"""
Qué documentos de contenido existen y de qué forma es cada uno.

Cada clave es una sección editable de la web (un export de `Frontend/src/datos/`, con la
misma forma — ver `Frontend/scripts/exportar-contenido.mjs`, que usa las mismas claves).
La lista es cerrada a propósito: el panel no puede inventarse documentos nuevos, y una
clave mal escrita es un 404 en vez de una fila huérfana que nadie lee.

La validación de CAMPOS (qué falta en cada idioma, longitudes, URLs…) vive en el
frontend (`src/lib/*.js`, funciones `campos…()` / `validarExtra…()`), compartida entre la
web y el editor. Aquí solo se comprueba lo estructural: que el documento sea del tipo
esperado y no pase de un tamaño razonable.
"""

OBJECT = dict
ARRAY = list

DOCUMENTS: dict[str, type] = {
    "landing": OBJECT,
    "piezas-comunes": OBJECT,
    "seo-textos": OBJECT,
    "sobre-fely": OBJECT,
    "talleres": OBJECT,
    "contacto": OBJECT,
    "cabeceras": OBJECT,
    "sedes": OBJECT,
    "puntos-venta": ARRAY,
    "vosotras": OBJECT,
    "articulos": ARRAY,
    "episodios": ARRAY,
    "editorial-novias": OBJECT,
    "editorial-fiesta": OBJECT,
    "editorial-pret-a-porter": OBJECT,
    "colecciones-fiesta": ARRAY,
    "colecciones-novias": ARRAY,
    "colecciones-runway": ARRAY,
    "productos-pret-a-porter": ARRAY,
}

# El mayor hoy (articulos) ronda 160 KB. 2 MB deja margen de sobra para años de blog sin
# permitir que una petición rota meta megas de basura en la base de datos.
MAX_DOCUMENT_BYTES = 2 * 1024 * 1024

# Revisiones que se guardan por documento. Las más antiguas se borran al guardar.
MAX_REVISIONS = 50


def cache_tag(key: str) -> str:
    """Etiqueta de caché de Next.js para un documento (`fetch(..., {next: {tags}})`)."""
    return f"contenido:{key}"
