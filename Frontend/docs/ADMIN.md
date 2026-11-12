# Panel de administración (`/admin`) — guía para el programador

**Estado (7 de noviembre de 2026).** Todo el contenido que se ve en la web se edita desde el admin, con los **mismos datos que lee la web**. Todavía **no hay base de datos ni inicio de sesión**: lo que se publica en el admin vive en memoria y se pierde al recargar (cada aviso lo dice con «demo»). Este documento explica cómo está hecho y qué hay que hacer para conectarlo.

> Sustituye a los antiguos `adminpanel.md` y `admin-*.md` (uno por sección) y a `newsletter-substack.md`. Lo de publicar la web y Google está en `docs/PUBLICAR.md`.

---

## 1. Cómo está hecho (igual en todas las secciones)

**Datos y reglas, separados.** Cada sección tiene:
- `src/datos/<seccion>.js`: los valores actuales, con cada campo explicado arriba del archivo. Es el **sustituto provisional de la base de datos**. Todos se migraron tal cual desde donde estaban antes (archivos de la web y `messages/*.json`) y se comprobó, comparando el HTML de las páginas en español e inglés, que la web enseña lo mismo que antes.
- `src/lib/<seccion>.js`: funciones puras que comparten la web y el admin. La lectura es siempre una función `obtener…()` (tabla del apartado 2) y la validación, una función `campos…(datos)` (qué campos hay, de qué tipo, cuáles son obligatorios), más a veces `validarExtra…` (reglas que no son «falta un campo»).

**Editor común:** `components/admin/EditorPagina.jsx`. Barra fija con el estado (Publicada / Cambios sin publicar), selector Español | English con los textos que faltan, Descartar, Vista previa y Guardar y publicar; índice de bloques a la izquierda y una tarjeta por bloque. Cada página solo le pasa sus `bloques` (pueden ser una función del borrador, para listas que crecen) y su función `campos`.
- Campos: `CampoTexto` (por idioma, con contador y largo recomendado; admite párrafos), `CampoLinea`, `CampoMedio` (una foto o un vídeo), `GaleriaEditable` (varias, reordenables, con pie), `SelectorEnlace` (solo páginas internas, lista en `paginasEnlaceLanding()` de `lib/landing.js`), `CampoUrl` (direcciones externas), `SelectorColores`, `SelectorUbicacion` (mapa).
- Validación: `lib/camposPagina.js` (qué falta en cada idioma, qué bloque está incompleto, errores antes de publicar). Los textos opcionales solo cuentan si están en un idioma y no en el otro.
- Listas que se pueden ampliar (capítulos de Historia, talleres, secciones de los ateliers, bloques de Novias y Fiesta): `ControlesLista.jsx` (Subir, Bajar, Añadir debajo, Quitar con confirmación). Cada elemento nuevo recibe un id fijo que no cambia al moverlo.

**Listados:** las secciones con muchos elementos (Blog, Vosotras, colecciones, Prêt-à-porter, Runway, Puntos de venta) usan `ListadoAdmin.jsx`: las mismas acciones en el mismo orden en todas (ver en la web, ocultar/mostrar, editar, borrar), y cada elemento se edita en una ficha con `EditorPagina`. Las secciones con página propia en la web abren primero la pestaña «Página de la web (fotos y textos)»; el listado tiene su propia dirección (`?vista=…`).

**Estado del admin:** proveedores en `app/admin/layout.js`, de modo que lo publicado se mantiene al moverse por el panel: `Paginas.jsx` (`usePagina(id)` → `{ publicado, guardar }`, para todas las páginas sueltas), `AtelierFiesta.jsx` / `AtelierNovias.jsx` (común: `CatalogoAtelier.jsx`), `Blog.jsx`, `Vosotras.jsx`, `Runway.jsx`, `PretAPorter.jsx`, `PuntosVenta.jsx`. **Estas acciones (`guardar`, `alternar`, `borrar`, `reordenar`…) son las que tienen que llamar a la API.**

**Vista previa:** `lib/previa.js` + `components/layout/usePrevia.js`. El editor guarda el borrador en `localStorage` (`fc_previa_<id>`) y abre la página real con `?previa=<id>`; la página lo pinta con una barra negra «Vista previa» (`BarraPrevia.jsx`) y se actualiza sola con cada cambio. Un visitante sin borrador ve lo publicado. Las vistas previas llevan `noindex`. Las piezas que salen en todas las páginas (contacto, menú, textos de Google) no tienen vista previa.

**Fotos y vídeos subidos:** llegan como URL temporal `blob:` (las fotos ya comprimidas en el navegador, `comprimirImagen`; los vídeos de una galería llevan `#video` al final). Ver el apartado 4.

---

## 2. Qué edita cada sección

| Sección del admin | Ruta del admin | En la web | Datos (`src/datos/`) | Lectura (`src/lib/`) | Pantalla del admin |
|---|---|---|---|---|---|
| Página de inicio | `/admin/landing` | `/` (y el bloque Atelier de `/atelier`) | `landing.js` | `obtenerLanding()` · `landing.js` | `AdminLanding.jsx` |
| Menú, Pedir cita y newsletter | `/admin/paginas/piezas-comunes` | Fotos del menú, banda «Pedir cita», tarjetas «Atelier … & Showroom», ventana de la newsletter | `piezasComunes.js` | `obtenerPiezasComunes()` · `piezasComunes.js` | `AdminPiezasComunes.jsx` |
| Textos de Google | `/admin/paginas/textos-google` | title, description y H1 oculto de 20 páginas fijas | `seoTextos.js` | `obtenerSeoTextos()` · `seoTextos.js` (lo usan `seo.js` y el sitemap) | `AdminTextosGoogle.jsx` |
| Historia de Fely | `/admin/paginas/sobre-fely` | `/sobre-fely` | `sobreFely.js` | `obtenerSobreFely()` · `sobreFely.js` | `AdminSobreFely.jsx` |
| Blog & Podcast | `/admin/blog` | `/blog` y `/blog/<slug>` | `blog.js` | `obtenerArticulos()`, `obtenerEpisodios()` · `blog.js` | `AdminBlog.jsx` + `EditorBloques.jsx` |
| Nuestros talleres | `/admin/paginas/talleres` | `/talleres-fely-campo` | `talleres.js` | `obtenerTalleres()` · `talleres.js` | `AdminTalleres.jsx` |
| Vosotras | `/admin/vosotras` | `/atelier/vosotras` | `vosotras.js` | `obtenerVosotras()` · `vosotras.js` | `AdminVosotras.jsx` |
| Colección Fiesta | `/admin/colecciones/fiesta` | `/atelier/fiesta` y la ficha de cada look | `atelierFiesta.js` + `atelierEditorial.js` | `obtenerColeccionesFiesta()` · `catalogoFiesta.js`; `obtenerEditorialFiesta()` · `atelierEditorial.js` | `AdminAtelierFiesta.jsx` (pantalla común `AdminColeccionesAtelier.jsx`) + `AdminEditorialAtelier.jsx` |
| Colección Novias | `/admin/colecciones/novia` | `/atelier/novias` y la ficha de cada look | `atelierNovias.js` + `atelierEditorial.js` | `obtenerColeccionesNovias()` · `catalogoNovias.js`; `obtenerEditorialNovias()` | `AdminAtelierNovias.jsx` (misma pantalla común) + `AdminEditorialAtelier.jsx` |
| Prêt-à-porter | `/admin/productos/pret-a-porter` | `/pret-a-porter` y la ficha de cada prenda | `pretAPorter.js` + `atelierEditorial.js` | `obtenerProductosPretAPorter()` · `pretAPorter.js`; `obtenerEditorialPretAPorter()` | `AdminPretAPorter.jsx` + `AdminPaginaPretAPorter.jsx` |
| Runway | `/admin/colecciones/runway` | `/colecciones-fely-campo` y `/runways-<slug>` | `runway.js` | `obtenerColeccionesRunway()` · `runway.js` | `AdminRunway.jsx` |
| Contacto y redes | `/admin/contacto` | Email de los avisos de los formularios, botón de WhatsApp, redes del pie y de los datos para Google | `contacto.js` | `obtenerContacto()` · `contacto.js` | `AdminContacto.jsx` |
| Página Visítanos | `/admin/paginas/visitanos` | Cabecera e introducción de `/visita-fely-campo` | `cabeceras.js` | `obtenerCabeceras()` · `cabeceras.js` | `AdminCabecera.jsx` |
| Atelier Salamanca / Showroom Madrid / Atelier Oviedo | `/admin/ateliers/<id>` | `/atelier-fiesta/<id>`, su tarjeta en Visítanos y el formulario de cita | `ateliers.js` | `obtenerSede(id)`, `obtenerSedes()` · `ateliers.js` | `AdminAtelierSede.jsx` |
| Puntos de venta | `/admin/puntos-de-venta` | El mapa de `/puntos-de-venta-fely-campo` (y del final de Visítanos) | `puntosVenta.js` | `obtenerPuntosVenta()` · `puntosVenta.js` | `AdminPuntosVenta.jsx` + `SelectorUbicacion.jsx` |

Las **cabeceras** (foto de arriba y texto de entrada) de Blog, Vosotras, Runway, Visítanos y Puntos de venta están en `datos/cabeceras.js` y se editan desde la pestaña «Página de la web» de cada sección (`AdminCabecera.jsx`; en la web, `components/layout/CabeceraPagina.jsx`).

---

## 3. Reglas que no se ven a simple vista

**Direcciones (URL) que nunca cambian.** Los nombres de looks y prendas se guardan tal cual (no siguen un único patrón: «Look 1 26_Opaline», «Look 1 - En Madrid»…); generarlos cambiaría títulos y URL ya indexados. Si se renombra algo publicado, su URL anterior se guarda en `slugsAnteriores` y la página la redirige con un 301 (`buscarProductoFiesta`, `buscarProductoNovia`, `buscarProductoPretAPorter`). Los artículos del blog y las colecciones de Runway crean su slug al publicarse por primera vez (`slugDesdeTitulo`, `slugRunway`) y no cambia nunca. No hace falta tocar `redirecciones301.js` para nada de esto.

**Publicado / oculto.** Lo oculto no sale en la web ni en el sitemap. Un artículo del blog o una colección de Runway ocultos redirigen (301) a su listado. Un look **publicado** de una colección de Fiesta **oculta** sigue teniendo ficha (es el caso de Prêt-à-porter dentro de Fiesta). En Novias, una colección oculta esconde también sus looks (redirección temporal 307 a `/atelier/novias`); **desde el 2026-11-07 las 6 colecciones de Novias están ocultas** y `/atelier/novias` es solo editorial.

**Orden.** Los looks de Fiesta y Novias van siempre por número, sacado del nombre (`ordenarLooks`): no hace falta guardar posición. El resto (colecciones, prendas, episodios, fotos…) va en el orden de los datos, que se cambia arrastrando: hay que guardar una `posicion`.

**Textos en dos idiomas.** Siempre `{ es, en }`. Donde se indica «en inglés vacío = el español» (descripciones de prendas y looks, texto de Runway, composición), la web enseña el español si falta el inglés. Los looks sin descripción propia enseñan un texto automático (`descripcionAutomatica…` en `catalogoFiesta.js` / `catalogoNovias.js`, en los dos idiomas) y, para Google, su nombre más un texto de cierre (`lib/atelierProductoSeo.js`).

**Detalles por sección:**
- **Inicio:** vídeo de ordenador y, opcional, de móvil (`HeroCarousel` pone dos `<source>` y el navegador descarga uno). Límites de vídeo en `LIMITES_VIDEO` (`lib/landing.js`): ordenador 15 MB (aviso desde 10), móvil 8 MB (aviso desde 5); el admin avisa también si dura más de 30 s, si es más grande de lo que se ve o si tiene la orientación equivocada.
- **Historia de Fely:** máximo 6 fotos por capítulo (`MAXIMO_FOTOS_CAPITULO`).
- **Blog:** el cuerpo de un artículo son bloques (`texto`, `subtitulo`, `foto`, `fotos` de 2 a 4, `cita`). Los episodios del podcast no tienen página propia: la tarjeta abre su enlace. Datos estructurados `BlogPosting` (`articuloBlog()` en `lib/datosEstructurados.js`).
- **Vosotras:** las reseñas son de clientas reales; se intercalan entre las fotos de Invitadas. Al borrar un look, su reseña se queda sin fotos.
- **Prêt-à-porter:** composición, «Diseñado en» y «Fabricado en» por prenda, opcionales; vacíos = el texto general de `messages/*.json` (`producto.composicionTexto`, `origenDisenado`, `origenFabricado`). Precio y tallas siguen en los datos (los usa el carrito, oculto) pero ni se ven ni se editan: no hay venta online. La categoría de cada prenda solo sirve para agruparlas en el admin.
- **Runway:** los «productos de los looks» son de ejemplo (`productosEjemplo.js`) y no se editan.
- **Ateliers:** su dirección y teléfono salen también en su punto del mapa (`sede` en `datos/puntosVenta.js`, `conDatosDeSede` en `lib/puntosVenta.js`): no hay dos copias. Las fotos del final (hasta 10) se colocan solas en filas según cuántas haya (reglas `:has()` en `atelier-fiesta/page.module.css`).
- **Puntos de venta:** los 3 ateliers propios no se pueden borrar (el reparto de citas, `admin/consultas/puntoCercano.js`, cuenta con ellos). El buscador de direcciones usa Nominatim (OpenStreetMap) desde el navegador, sin clave y con un límite de ~1 búsqueda por segundo; para cambiarlo, solo la función `buscar` de `SelectorUbicacion.jsx`.
- **Contacto y redes:** no deja publicar con un email mal escrito, un WhatsApp sin prefijo (+34…) o un enlace que no empiece por https://. El email al que llegan los formularios **no** está aquí: es configuración del servidor (`lib/emailFormularios.js`, variables de entorno).
- **Textos de Google:** no deja publicar dos páginas con el mismo título o la misma descripción en el mismo idioma (`validarExtraSeo`).

---

## 4. Conectar la base de datos

1. **Inicio de sesión — lo primero.** Hoy cualquiera que escriba `/admin` entra (`app/admin/layout.js` no comprueba nada). El botón «Cerrar sesión» de la barra superior ya está, sin lógica.
2. **Lectura:** cambiar solo las funciones `obtener…()` de la tabla del apartado 2 para que lean de la base de datos. Cada página suelta es un registro con la forma de su archivo de `src/datos/`; colecciones, looks, prendas, artículos, puntos… son tablas con la forma de cada entrada. El resto de funciones de `src/lib/` son puras y siguen valiendo. Las páginas que las llaman son Server Components y pueden hacer `await`. Ojo: el menú, el pie, el botón de WhatsApp y la ventana de la newsletter son componentes de cliente (`obtenerPiezasComunes`, `obtenerContacto`): hay que pasarles los datos desde el servidor (por ejemplo desde `app/[locale]/layout.js`) o servirlos en una ruta pública.
3. **Escritura:** las acciones de los proveedores del apartado 1 llaman a la API y, si va bien, actualizan el estado. **Validar también en el servidor** con las mismas funciones que el editor (`validarCampos(campos…(datos))` + `validarExtra…`; en las colecciones, `validarColeccion…` / `validarLook…`). Los slugs nuevos se calculan en el servidor contra todos los existentes.
4. **Fotos y vídeos:** subir el archivo al almacén, pasar las fotos a WebP con un nombre SEO como el de las actuales (por ejemplo `fely-campo-coleccion-fiesta-<coleccion>-…webp`, `fely-campo-pret-a-porter-<categoria>-<producto>-front.webp`, `fely-campo-pasarela-<slug>-look-NN.webp`) y guardar la ruta definitiva. **El servidor debe rechazar los vídeos que pasen del máximo** (el control del navegador se puede saltar); lo ideal es recomprimirlos (H.264, 1080p, o 720p en móvil, sin audio). **Ojo con la «ñ»:** un archivo con la «ñ» en forma Unicode NFD no lo sirve Next.js (404): normalizar a NFC o quitar acentos.
5. **Publicar al momento:** tras guardar, `revalidatePath` de las páginas afectadas (la de la sección, la ficha y su URL anterior si cambió) y de `/sitemap.xml`.
6. **Migración:** cargar los archivos de `src/datos/` tal cual. Los Excel originales de las colecciones están en `docs/catalogo-fuente/` (no se publican).
7. **Vista previa entre dispositivos:** hoy solo funciona en el navegador donde está abierto el editor. Con base de datos, conviene guardar el borrador en el servidor y que la vista previa exija sesión de admin.

---

## 5. Formularios: Citas, Consultas de vestidos y Newsletter

- **Pedir cita** (`/visita-fely-campo/cita` → `POST /api/cita`) y **«Contacta con nosotros»** de las fichas de vestidos (`ModalSolicitudAtelier.jsx` → `POST /api/consulta-vestido`) **ya funcionan**: validan y envían dos emails (aviso al equipo, con «Responder» a la clienta, y confirmación a la clienta en su idioma). Los envía el backend por SMTP; aquí solo se componen (`lib/emailFormularios.js`, variable `CITA_EMAIL_EQUIPO`). La de cita registra además la conversión (`cita_enviada` en `lib/analitica.js`, para Tag Manager y el Pixel).
- **Lo que falta: guardarlas.** Las bandejas del admin **Citas** (`/admin/consultas`) y **Consultas de vestidos** (`/admin/consultas-precio`) ya tienen el listado, los filtros, los estados y el detalle, con los mismos campos que envían los formularios, pero usan datos de ejemplo (`citasMock`, `consultasPrecioMock` en `components/admin/mockData.js`). Hay que guardar cada solicitud en la base de datos desde esas dos rutas de la API y que las bandejas lean de ahí (con historial de estados con fecha del servidor). Una cita empieza asignada al atelier que eligió la clienta y el equipo puede pasarla a otro atelier o a una boutique (`puntoCercano.js`).
- **Newsletter → Substack (pendiente).** Los dos formularios (pie y ventana, `Footer.jsx` y `NewsletterModal.jsx`) solo simulan el envío (`suscribirNewsletter`, espera 500 ms). Plan:
  1. Crear `src/app/api/newsletter/route.js`: recibe `{ email }`, lo valida y lo reenvía desde el servidor a `POST ${SUBSTACK_URL}/api/v1/free` con `{ email, source: 'embed' }` (Substack bloquea las llamadas desde el navegador). Variable `SUBSTACK_URL=https://felycampo.substack.com`.
  2. Sustituir la función falsa de los dos formularios por un `fetch('/api/newsletter')` (mejor en un solo `src/lib/newsletter.js`); sus estados cargando / éxito / error ya sirven.
  3. **Respaldo:** ese endpoint de Substack no es oficial y puede cambiar sin aviso; guardar también cada email (Google Sheets, un email de aviso o la base de datos, donde `/admin/newsletter` ya tiene la tabla, hoy con `newsletterMock`). Pendiente de decidir con Fely.
  4. Plan B estable: redirigir a `https://felycampo.substack.com/subscribe?email=EMAIL` (oficial, pero la persona sale de la web).
  5. Probar con un email propio desde los dos formularios, comprobar que llega a Substack y que, si falla, la web enseña el error y no un «gracias».

---

## 6. Secciones ocultas (de cuando iba a haber tienda online)

En el código siguen, ocultas en el menú (`GRUPOS_OCULTOS` en `AdminSidebar.jsx`) y con datos de ejemplo de `mockData.js`: Pedidos, Clientes, Reseñas, Stock, Métricas, Materiales (colores y tejidos), Productos (el formulario antiguo), Diseño (el editor antiguo de la portada, sustituido por «Página de inicio») y Settings. En la web también siguen guardados, sin usarse, los componentes de carrito, wishlist y cuenta (sus páginas se quitaron el 2026-11-07 y redirigen a Prêt-à-porter). **La web es de atelier: no hay venta online, envíos ni devoluciones.** No hace falta conectar nada de esto; si algún día vuelve la tienda, hay que revisarlo entero (por ejemplo, ahí las relaciones son por nombre de texto y no por id).

## 7. Lo que no se edita (a propósito)

- Los textos legales (aviso legal, privacidad, cookies, términos): `app/[locale]/legal/textos/`. Mejor que los cambie quien los redacta.
- Los textos de botones, formularios y menús (los nombres de los enlaces y su orden son la estructura de la web): `messages/*.json`.
- Los campos que la web no enseña: en los looks, etiquetas de estilo y silueta (se conservan para los filtros), colores, tejidos y composición; en Prêt-à-porter, precio y tallas.
