#!/bin/sh
set -e

python manage.py migrate --noinput

if [ "$DEBUGPY_ENABLED" = "true" ]; then
    if [ "$DEBUGPY_WAIT_FOR_CLIENT" = "true" ]; then
        echo ">> Waiting for debugger to attach on :5678 ..."
        exec python -m debugpy --listen 0.0.0.0:5678 --wait-for-client \
            manage.py runserver 0.0.0.0:8000 --noreload
    fi
    exec python -m debugpy --listen 0.0.0.0:5678 \
        manage.py runserver 0.0.0.0:8000 --noreload
fi

exec python manage.py runserver 0.0.0.0:8000
