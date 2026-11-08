# Fely Campo — web y panel de administración

Web de Fely Campo (atelier de novia y fiesta, y prêt-à-porter) en español e inglés, con un panel de administración para editar todo su contenido. Next.js 16 (App Router), next-intl, CSS Modules y Storybook. **Es una web de atelier: no hay venta online, envíos ni devoluciones.**

## Arrancarla

```bash
npm install
npm run dev          # http://localhost:3000  (admin: /admin)
npm run build        # compilación de producción
npm run storybook    # componentes, en http://localhost:6006
```

Variables de entorno: plantilla en `.env.example`. En local, sin `SITIO_INDEXABLE=true`, todas las páginas salen con `noindex` (es lo correcto fuera de producción).

## Dónde está cada cosa

| Carpeta | Qué hay |
|---|---|
| `src/app/[locale]/` | Las páginas de la web (`/es/…`, `/en/…`). |
| `src/app/admin/` | El panel de administración. |
| `src/app/api/` | Los formularios de cita y de consulta de vestidos (envían emails con Resend). |
| `src/datos/` | El contenido de la web (textos, fotos, colecciones…). **Sustituto provisional de la base de datos.** |
| `src/lib/` | Las funciones que comparten la web y el admin (lectura, validación, SEO, datos para Google…). |
| `src/components/` | `ui/` (sistema de diseño), `layout/` (piezas de la web), `ecommerce/` (fichas y formularios), `admin/` (el panel). |
| `src/proxy.js` | Idiomas y redirecciones (las ~800 de la web de WordPress y las de páginas quitadas). |
| `messages/` | Textos de botones, menús y formularios (`es.json`, `en.json`). |
| `public/` | Fotos y vídeos. |
| `styleguide.html`, `tokens/`, `docs/design.md` | El sistema de diseño. |

## Documentación

- **`docs/ADMIN.md`**: cómo está hecho el panel de administración y cómo conectarlo a una base de datos (inicio de sesión, lectura, escritura, fotos, formularios, newsletter).
- **`docs/PUBLICAR.md`**: cómo publicar la web en felycampo.com y Google (variables de entorno, Search Console, redirecciones, lo que falta confirmar con el cliente).
- `docs/design.md`: el sistema de diseño.
- `docs/redirecciones-301.csv`: la tabla de redirecciones de la web antigua, legible. `docs/catalogo-fuente/`: los Excel originales de las colecciones.
