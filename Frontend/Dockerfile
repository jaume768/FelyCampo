# Imagen del frontend (Next.js 16, App Router). Multi-stage, mismo estilo que
# backend/Dockerfile: una capa `base` con dependencias y luego `dev` / `prod`.
#
# En desarrollo el código va montado como bind mount desde docker-compose.yml de la
# raíz (`./frontend:/app`), con `node_modules` y `.next` como volúmenes anónimos para
# que no los pise el mount del host. Por eso el `dev` instala dependencias en la imagen:
# el volumen anónimo se siembra con lo que haya en `/app/node_modules` al crear el
# contenedor.

FROM node:22-slim AS base

# NODE_ENV NO se fija aquí: `npm ci` necesita también las devDependencies (Next, Vitest,
# Storybook), y con NODE_ENV=production npm las omite. Cada stage pone el suyo.
# Fijarlo a "development" en la base hacía que un `next build` dentro del contenedor de
# desarrollo mezclara React de desarrollo y de producción, y el prerender reventaba con
# "Cannot read properties of null (reading 'useContext')".
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Solo los manifiestos primero: la capa de dependencias se cachea mientras no cambien.
COPY package.json package-lock.json ./
RUN npm ci


FROM base AS dev

ENV NODE_ENV=development

# El código real llega por bind mount en compose; este COPY es para que la imagen
# funcione también sin mount (build suelto, CI).
COPY . .

EXPOSE 3000
# compose sobreescribe con `command: npm run dev`; se deja explícito por si se corre suelta.
CMD ["npm", "run", "dev"]


FROM base AS build

# `next build` exige NODE_ENV=production: con otro valor React se enlaza en modo
# desarrollo y el prerender falla.
ENV NODE_ENV=production

# Las NEXT_PUBLIC_* se INCRUSTAN en el bundle del navegador durante el build, no se leen
# al arrancar: si no llega aquí, el sitio publicado pediría la API a localhost:8001 (la
# de la máquina del visitante) y no cargaría nada. Por eso es un build arg, no una
# variable de entorno del contenedor.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY . .
RUN npm run build


FROM node:22-slim AS prod

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Next.js en modo standalone deja un servidor mínimo en .next/standalone
# (`output: 'standalone'` en next.config.mjs).
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

RUN adduser --disabled-password --gecos "" appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 3000
CMD ["node", "server.js"]
