# Publicar la web en felycampo.com y Google — guía para el programador

**Estado (7 de noviembre de 2026).** Lo técnico de SEO está hecho y comprobado; falta lo del despliegue y Search Console (apartados 2 y 3). La web sustituye a la de WordPress en el mismo dominio.

> Sustituye a `publicar-en-google.md`, `SEO-AUDITORIA-INFORME.md` (auditoría del 4/11, ya aplicada), `SEO-INFORME.md`, `textos-web-seo.md` y `categorias-guardadas.md` (ahora en el anexo). Todo lo del panel de administración está en `docs/ADMIN.md`.

---

## 1. Qué está hecho (y dónde)

| Qué | Dónde |
|---|---|
| Title, description, canonical, hreflang (es / en / x-default), Open Graph y Twitter de cada página | `metadataPagina()` en `src/lib/seo.js`. Los textos de las páginas fijas están en `src/datos/seoTextos.js` y se editan en el admin («Textos de Google»); las fichas (looks, prendas, colecciones de Runway, artículos) los generan de sus propios datos en su `generateMetadata`. |
| Indexar o no | `SITIO_INDEXABLE` (ver apartado 2). Sin ella: `noindex, nofollow` en todo y `robots.txt` = `Disallow: /`. Con ella: `index, follow, max-image-preview:large`. Siempre `noindex`: `/admin`, `/api`, las vistas previas (`?previa=`), las confirmaciones de cita y cualquier respuesta desde `*.netlify.app` (`next.config.mjs`). |
| `robots.txt` y sitemap | `src/app/robots.js` y `src/app/sitemap.js` (páginas fijas de `seoTextos.js` + looks, prendas, colecciones de Runway y artículos publicados, en los dos idiomas). |
| Datos estructurados (JSON-LD) | `src/lib/datosEstructurados.js`: Organization + WebSite en la home; ClothingStore (dirección y teléfono iguales a los visibles) en cada atelier; Product (sin precio) en looks y prendas; BlogPosting en artículos; BreadcrumbList. |
| Verificación de Meta | `<meta name="facebook-domain-verification" content="52ua5uh83t9xk46o8js2214qt0aczn">` en todas las páginas (la misma que la web actual). |
| Analítica con consentimiento | `components/layout/Analitica.jsx` + `CookieConsent.jsx`: Tag Manager con Consent Mode v2 («denied» por defecto); el Pixel de Meta, si se configura aquí, solo carga con el consentimiento de «Marketing». |
| Redirecciones de la web de WordPress | Ver apartado 4. |

---

## 2. Antes de publicar

1. **Compilar:** `npm run build` sin errores, y `npm start` para revisarla en local con las variables de abajo.
2. **Proteger `/admin`.** No tiene inicio de sesión: cualquiera que escriba la dirección entra. Lleva `noindex` y `robots.txt` lo bloquea, pero eso no impide entrar. Ver `docs/ADMIN.md`, apartado 4.
3. **Variables de entorno en Netlify (producción).** Plantilla en `.env.example`.

| Variable | Valor | Por qué |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://felycampo.com` | Canonical, sitemap y Open Graph (por defecto ya es esta). |
| `SITIO_INDEXABLE` | `true` | **Imprescindible.** Solo en producción, nunca en las previews. |
| `NEXT_PUBLIC_GTM_ID` | `GTM-T2MJKZHT` | El mismo contenedor que usa hoy la web de WordPress (comprobado en su HTML). |
| `NEXT_PUBLIC_META_PIXEL_ID` | `1258085321257704` | **Corregido el 2026-11-12:** la web de WordPress NO lo tiene dentro de GTM; lo carga el plugin de Facebook para WordPress (con Conversions API, que se pierde). Revisado el contenedor GTM-T2MJKZHT: solo lleva GA4 `G-XCP746PKRV`. La web antigua carga además a mano GA4 `G-RGE8VR2FY5` y Google Ads `AW-11350885986`, que **no** están en GTM: van en `NEXT_PUBLIC_GOOGLE_TAG_IDS` (`GOOGLE_TAG_IDS` en el `.env` del servidor), cargados con gtag.js y el mismo consentimiento. |
| `NEXT_PUBLIC_GOOGLE_TAG_IDS` | `G-RGE8VR2FY5,AW-11350885986` | Ver la fila anterior. Si algún día se meten dentro de GTM, vaciarla o contarán doble. |
| `CITA_EMAIL_EQUIPO` | `info@felycampo.com` | Quién recibe el aviso de cada cita y consulta. El envío (SMTP) se configura en `backend/.env.prod`. |
| `SUBSTACK_URL` | `https://felycampo.substack.com` | Solo cuando se conecte la newsletter (`docs/ADMIN.md`, apartado 5). |

## 3. Al publicar

1. **Comprobar en producción:**
   - `https://felycampo.com/robots.txt` → `Allow: /`, `Disallow: /admin` y `/api/`, y la línea del sitemap.
   - En el HTML de cualquier página: `<meta name="robots" content="index, follow, max-image-preview:large">`, no `noindex`.
   - Unas cuantas URL antiguas → un solo 301 a su página nueva (por ejemplo `/aviso-legal/`, `/vestidos-de-madrina/`, `/categoria-producto/estilos-fiesta/minimal-estilos-fiesta/`, `/tienda/`).
2. **Search Console:**
   - La web de WordPress **no tiene** meta `google-site-verification`, así que la propiedad está verificada por DNS, por Tag Manager o con un archivo `google….html`. Mirarlo en Search Console › Configuración › Verificación de la propiedad. DNS y Tag Manager siguen valiendo con la web nueva (mismo dominio y mismo GTM); si es un archivo, copiarlo a `public/` antes de publicar o se pierde la verificación.
   - Enviar `https://felycampo.com/sitemap.xml`.
   - Las semanas siguientes, revisar «Páginas» (indexación) y los 404.
3. **Google Business Profile:** que la ficha de cada atelier tenga la misma dirección y teléfono que la web (Salamanca: C/ Laguna Negra 17-19; Oviedo: C/ Gil de Jaz 15; ver `src/datos/ateliers.js`).

---

## 4. Redirecciones

- **Web de WordPress → web nueva:** ~800 URL antiguas (páginas, artículos, productos, categorías, autores), cada una a su página nueva con un solo 301. Mapa en `src/lib/redirecciones301.js` (generado; la tabla legible con el criterio de cada una está en `docs/redirecciones-301.csv`), más reglas por prefijo (`REGLAS_PREFIJO`) en `src/proxy.js` para las que no estaban en el sitemap (`/producto/…`, `/category/…`, `/tienda`, `/carrito`…). Las URL antiguas no llevaban idioma, así que van a `/es`. La raíz `/` no se redirige: la resuelve el idioma del navegador.
- **Páginas de esta web que se han quitado** (`RUTAS_ELIMINADAS` en `src/proxy.js`): `/podcast` → `/blog`; `/ayuda/contacto`, `/ayuda/envios`, `/ayuda/atencion-cliente`, `/ayuda/devoluciones` → Visítanos; `/responsabilidad` → Historia de Fely; `/carrito`, `/wishlist`, `/mi-cuenta` y las 5 categorías de Prêt-à-porter → Prêt-à-porter; las categorías de Fiesta y Novias (`/atelier/<seccion>/categoria/…`) → su sección. Las categorías de Atelier en camelCase (`/categoria/corteA`) van directas a su sección en `next.config.mjs`.
- **Renombrar algo publicado** (un look, una prenda) no necesita tocar nada de esto: la propia página redirige su URL anterior (ver `docs/ADMIN.md`, apartado 3).

## 5. Por confirmar con el cliente

- **«Diseñada y confeccionada en Salamanca»** sale en la descripción de Google de cada prenda de Prêt-à-porter, y «Fabricado en: nuestros talleres de Salamanca» en su ficha. La página de talleres habla del atelier de Salamanca y de «dos pequeños talleres de la sierra». ¿Es correcto decir Salamanca para todo?
- **Oviedo «a medida».** Su título en Google es «Atelier de novia y fiesta a medida en Oviedo». Novia y fiesta coinciden con su ficha; ¿también se hace a medida en Oviedo?

(Resuelto: sin compra online, envíos ni devoluciones, y la web ya no lo promete en ningún texto; Salamanca sí tiene sección de prêt-à-porter, lo dice su ficha; Responsabilidad quitada; GTM y Pixel, arriba.)

---

## Anexo. Páginas de categoría quitadas (guardadas por si se recuperan)

**Quitadas de la web el 2026-11-07** (a petición: ningún botón ni enlace de la web llevaba a ellas). Aquí queda todo lo que tenían escrito por si se vuelven a usar. El código completo de las páginas está en el commit `c9a1934` (`git show c9a1934:<ruta>`):

- `src/app/[locale]/atelier/fiesta/categoria/[categoria]/page.js`
- `src/app/[locale]/atelier/novias/categoria/[categoria]/page.js`
- `src/app/[locale]/pret-a-porter/{vestidos,faldas,pantalones,tops-y-camisetas,chaquetas-y-abrigos}/page.js`
- `src/lib/atelierCategoriaSeo.js` (títulos y descripciones de Google de las categorías de Atelier)

**Lo que sigue en la web:** los filtros de Fiesta y Novias (silueta, largo, estilo…) siguen funcionando dentro de cada página, con los mismos nombres (`GRUPOS_ESTILO_SILUETA` en `src/components/layout/estiloSiluetaGrupos.js`, textos en `messages/*.json` → `filtros.estiloYSilueta`). Las prendas de Prêt-à-porter siguen teniendo su categoría (se usa en el admin para agruparlas).

**Redirecciones:** las direcciones antiguas que llevaban a cada categoría (de la web de WordPress) ahora van a la página general de su sección (Fiesta, Novias o Prêt-à-porter), y las propias direcciones de categoría también (`src/proxy.js`). Si se recuperan las páginas, hay que devolver esas redirecciones a su categoría (la lista está abajo, en cada una).

### Atelier: cabecera común de las páginas de categoría

#### Fiesta
- Foto: `/img/landing/fely-campo-portada-hero-landing-3-mobile-atelier-3.webp`
- Frase sobre la foto:
- es: Vestidos de fiesta e invitada, hechos a medida.
- en: Made-to-measure evening and guest dresses.
- Texto encima de los looks:
- es: Descubre nuestros vestidos de novia y de fiesta en el atelier. Reserva tu cita para recibir asesoramiento personalizado y encontrar la silueta, el tejido y los detalles que mejor encajan contigo.
- en: Book your appointment and enjoy a unique day at the Atelier. Experience personalized guidance from our designer.

#### Novias
- Foto: `/img/fely-campo-web-novias-seccion-3.webp`
- Texto encima de los looks:
- es: Descubre nuestros vestidos de novia y de fiesta en el atelier. Reserva tu cita para recibir asesoramiento personalizado y encontrar la silueta, el tejido y los detalles que mejor encajan contigo.
- en: Book your appointment and enjoy a unique day at the Atelier. Experience personalized guidance from our designer.

#### Textos de Google (los mismos para todas, con el nombre de la categoría y de la sección)
- Título: es «{categoria} · {seccion} · Atelier | Fely Campo» · en «{categoria} · {seccion} · Atelier | Fely Campo»
- Descripción: es «Vestidos de estilo {categoria} en la colección {seccion} del Atelier de Fely Campo. Cita personalizada con nuestra diseñadora.» · en «{categoria} style dresses in the {seccion} Atelier collection by Fely Campo. Personalized fitting with our designer.»

### Atelier: las categorías

`/atelier/fiesta/categoria/<slug>` y `/atelier/novias/categoria/<slug>`. Las de «Ocasión» eran solo de Fiesta.

| Grupo | Categoría (es / en) | Slug | Solo Fiesta | Direcciones antiguas que llevaban aquí |
|---|---|---|---|---|
| Ocasión | Alfombra roja / Red carpet | `alfombra-roja` | sí | `/categoria-producto/estilos-fiesta/alfombra-roja → Fiesta` |
| Ocasión | Noche / Evening | `noche` | sí | `/categoria-producto/siluetas-fiesta/noche-fiesta → Fiesta` |
| Ocasión | Tarde / Afternoon | `tarde` | sí | — |
| Ocasión | Día / Day | `dia` | sí | — |
| Silueta | Corte A / A-line | `corte-a` |  | `/categoria-producto/siluetas-fiesta/corte-a-fiesta → Fiesta`<br>`/categoria-producto/siluetas-novia/corte-a → Novias` |
| Silueta | Recto / Straight | `recto` |  | `/categoria-producto/siluetas-fiesta/recto-fiesta → Fiesta`<br>`/categoria-producto/siluetas-novia/recto → Novias` |
| Silueta | Sirena / Mermaid | `sirena` |  | `/categoria-producto/siluetas-fiesta/sirena-fiesta → Fiesta`<br>`/categoria-producto/siluetas-novia/sirena → Novias` |
| Silueta | Princesa / Ballgown | `princesa` |  | `/categoria-producto/siluetas-novia/princesa → Novias` |
| Volumen | Dos piezas / Two-piece | `dos-piezas` |  | `/categoria-producto/siluetas-fiesta/dos-piezas-fiesta → Fiesta`<br>`/categoria-producto/siluetas-novia/dos-piezas → Novias` |
| Largo | Corto / Short | `corto` |  | `/categoria-producto/tendencias-fiesta/corto → Fiesta` |
| Largo | Midi / Midi | `midi` |  | `/categoria-producto/tendencias-fiesta/midi-tendencias-fiesta → Fiesta`<br>`/categoria-producto/tendencias-novia/midi → Novias` |
| Largo | Largo / Long | `largo` |  | `/categoria-producto/tendencias-fiesta/largo → Fiesta` |
| Largo | Cola / Train | `cola` |  | `/categoria-producto/tendencias-novia/cola → Novias` |
| Estilo | Minimal / Minimal | `minimal` |  | `/categoria-producto/estilos-fiesta/minimal-estilos-fiesta → Fiesta`<br>`/categoria-producto/estilos-novia/minimal → Novias` |
| Estilo | Lencero / Slip dress | `lencero` |  | `/categoria-producto/estilos-fiesta/lencero-estilos-fiesta → Fiesta`<br>`/categoria-producto/estilos-novia/lencero → Novias` |
| Estilo | Diferente / Unconventional | `diferente` |  | `/categoria-producto/estilos-fiesta/diferente-estilos-fiesta → Fiesta`<br>`/categoria-producto/estilos-novia/diferente → Novias` |
| Estilo | Clásico / Classic | `clasico` |  | `/categoria-producto/estilos-fiesta/clasico-estilos-fiesta → Fiesta`<br>`/categoria-producto/estilos-novia/clasico → Novias` |
| Estilo | Romántico / Romantic | `romantico` |  | `/categoria-producto/estilos-novia/romantico → Novias` |
| Detalles | Asimétrico / Asymmetric | `asimetrico` |  | `/categoria-producto/tendencias-fiesta/asimetrico → Fiesta` |
| Detalles | Escote espalda / Open back | `escote-espalda` |  | `/categoria-producto/tendencias-fiesta/escote-espalda-tendencias-fiesta → Fiesta`<br>`/categoria-producto/tendencias-novia/escote-espalda → Novias` |
| Detalles | Fluido / Flowy | `fluido` |  | `/categoria-producto/tendencias-fiesta/fluido-tendencias-fiesta → Fiesta`<br>`/categoria-producto/tendencias-novia/fluido → Novias` |
| Detalles | Mangas / Manga / Sleeves | `mangas` |  | `/categoria-producto/tendencias-fiesta/mangas → Fiesta`<br>`/categoria-producto/tendencias-novia/manga → Novias` |

### Prêt-à-porter

Texto común encima de las prendas:
- es: Piezas nuevas de temporada, pensadas para acompañar cada ocasión con la misma artesanía de siempre.
- en: New pieces for the season, crafted with the same care for every occasion.

| Categoría | Dirección | Foto de cabecera | Título de Google (es / en) | Descripción de Google (es / en) |
|---|---|---|---|---|
| Vestidos / Dresses | `/pret-a-porter/vestidos` | `/img/hero-pages/fely-campo-cabecera-hero-pages-pretaporter-vestidos.webp` | Vestidos de mujer de diseño de autor | Fely Campo / Women's dresses | Fely Campo ready-to-wear | Descubre vestidos de mujer de Fely Campo, con patronaje cuidado y tejidos seleccionados para el día a día y ocasiones especiales. Consúltanos. / Fely Campo ready-to-wear dresses for everyday and special occasions, made in Salamanca. Ask us about any piece. |
| Faldas / Skirts | `/pret-a-porter/faldas` | `/img/hero-pages/fely-campo-cabecera-hero-pages-pretaporter-faldas.webp` | Faldas de mujer de diseño de autor | Fely Campo / Women's skirts | Fely Campo ready-to-wear | Explora las faldas de Fely Campo en tejidos seleccionados y siluetas cuidadas. Descubre la colección de prêt-à-porter y consúltanos. / Fely Campo skirts in carefully chosen fabrics, printed and plain, designed and made in Salamanca. Explore the collection online. |
| Pantalones / Trousers | `/pret-a-porter/pantalones` | `/img/hero-pages/fely-campo-cabecera-hero-pages-pretaporter-pantalones.webp` | Pantalones de mujer de diseño de autor | Fely Campo / Women's trousers | Fely Campo ready-to-wear | Descubre pantalones de mujer de Fely Campo, con patronaje propio y acabados cuidados. Encuentra piezas para combinar y consúltanos. / Fely Campo women's trousers with in-house pattern cutting and atelier finishes, made in Salamanca. Ask us about any piece. |
| Tops y Camisas / Tops & Shirts | `/pret-a-porter/tops-y-camisetas` | `/img/hero-pages/fely-campo-cabecera-hero-pages-pretaporter-tops-camisas.webp` | Tops y camisetas de mujer | Prêt-à-porter Fely Campo / Women's tops and T-shirts | Fely Campo | Descubre tops, blusas y camisetas de Fely Campo, diseñados para combinar con las prendas de la colección de prêt-à-porter. Consúltanos. / Fely Campo ready-to-wear tops, blouses and T-shirts, designed in Salamanca to pair with the rest of the collection. Ask us about any piece. |
| Chaquetas y Abrigos / Coats & Jackets | `/pret-a-porter/chaquetas-y-abrigos` | `/img/hero-pages/fely-campo-cabecera-hero-pages-pretaporter-chaquetas-abrigos.webp` | Chaquetas y abrigos de mujer | Prêt-à-porter Fely Campo / Women's jackets and coats | Fely Campo | Descubre chaquetas y abrigos de mujer de Fely Campo, con tejidos seleccionados, líneas cuidadas y patronaje de atelier. Consúltanos. / Fely Campo women's jackets and coats in fine fabrics with atelier pattern cutting, made in Salamanca. Ask us about any piece. |
