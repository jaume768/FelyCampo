// contenidoServidor.js — carga el contenido de la API en el servidor.
//
// Una sola petición con los 19 documentos (GET /api/v1/content/), guardada
// por Next en su caché de datos con la etiqueta «contenido». Cuando alguien
// publica desde el panel, Django llama a /api/revalidar, que caduca esa
// etiqueta: la siguiente visita vuelve a pedirla y las páginas se
// regeneran con lo nuevo.
//
// Cada página, layout, generateMetadata, sitemap y ruta de /api que lea
// contenido hace `await cargarContenido()` antes. React cache(): dentro de
// una misma petición se pide una sola vez.
//
// Si la API no responde, se lanza el error (no se enseña contenido viejo
// de src/datos): Next sigue sirviendo la última versión buena de la página
// y no guarda en caché una rota.

import { cache } from 'react';
import { fijarContenido } from './contenido';

export const TAG_CONTENIDO = 'contenido';

export const cargarContenido = cache(async () => {
  const base = process.env.API_INTERNAL_URL || 'http://localhost:8001';
  const respuesta = await fetch(`${base}/api/v1/content/`, {
    cache: 'force-cache',
    next: { tags: [TAG_CONTENIDO] },
    // Sin esto, SECURE_SSL_REDIRECT responde 301 a https://backend:8000 y
    // la llamada se queda colgada (docs/DESPLIEGUE.md).
    headers: { Accept: 'application/json', 'X-Forwarded-Proto': 'https' },
  });
  if (!respuesta.ok) {
    throw new Error(`No se ha podido cargar el contenido de la API (${respuesta.status}).`);
  }
  const documentos = await respuesta.json();
  fijarContenido(documentos);
  return documentos;
});
