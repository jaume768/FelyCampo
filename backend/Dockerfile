FROM python:3.12-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PYDEVD_DISABLE_FILE_VALIDATION=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# pip actualizado: la versión que trae la imagen base tiene CVEs (pip-audit).
RUN pip install --upgrade "pip>=26.1.2"

COPY requirements/ requirements/


FROM base AS dev

RUN pip install -r requirements/dev.txt
COPY . .
CMD ["/app/scripts/entrypoint-dev.sh"]


FROM base AS prod

RUN pip install -r requirements/base.txt
COPY . .

RUN adduser --disabled-password --gecos "" appuser \
    && chown -R appuser:appuser /app
USER appuser

# El entrypoint corre migrate + collectstatic antes de gunicorn: con
# CompressedManifestStaticFilesStorage, sin collectstatic no hay staticfiles.json y el
# admin de Django revienta al primer render.
CMD ["/app/scripts/entrypoint-prod.sh"]
