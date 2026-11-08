#!/bin/sh
set -e

# Arranque de producción. A diferencia del de desarrollo, aquí:
#
#   · `collectstatic` es OBLIGATORIO. Producción usa
#     `CompressedManifestStaticFilesStorage` (whitenoise), que resuelve cada archivo por
#     su hash a través de staticfiles.json. Sin ese manifiesto, el admin de Django y
#     cualquier plantilla que use {% static %} revientan al primer render.
#   · gunicorn en vez de runserver.
#
# `migrate` se mantiene: es idempotente y evita desplegar código nuevo contra un esquema
# viejo. Con varias réplicas habría que sacarlo a un job aparte para que no corran a la vez.

python manage.py migrate --noinput
python manage.py collectstatic --noinput --clear

# --timeout 120 y no 30: los workers son síncronos y Caddy no almacena el cuerpo de la
# petición, así que una subida de vídeo (hasta 15 MB) por una conexión lenta ocupa el
# worker mientras llega. Con 30 s gunicorn lo mataba a mitad de subida.
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers "${GUNICORN_WORKERS:-3}" \
    --timeout "${GUNICORN_TIMEOUT:-120}" \
    --access-logfile - \
    --error-logfile -
