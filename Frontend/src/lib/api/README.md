# Capa de API

**Única puerta por la que el frontend habla con Django.** Ningún componente hace `fetch`
directo, y ninguno lee `campo_en` a mano.

```
src/lib/api/
├── client.js        Cliente base: URL según entorno, CSRF, X-Cart-Id, timeout, errores
├── errors.js        ApiError — el shape de error del backend, normalizado
├── cartId.js        El X-Cart-Id del invitado en localStorage
├── pickLocalized.js campo vs campo_en según el locale
├── endpoints.js     Punto de entrada: reexporta los cinco dominios
├── catalog.js       Catálogo (lectura pública)
├── cart.js          Carrito y checkout
├── orders.js        Pedidos y devoluciones
├── account.js       Perfil, direcciones, favoritos
├── auth.js          Sesión y contraseña
└── adapters/        API → props que YA esperan los componentes
```

## Server Component o Client Component

La regla es una sola pregunta: **¿esto depende de algo que solo existe en el navegador?**

### Server Component — lecturas de catálogo, SEO

Todo lo público y de solo lectura. Es lo preferible: se renderiza en el servidor, sale en
el HTML inicial y lo indexan los buscadores.

```js
// app/[locale]/tienda/page.js  — sin 'use client'
import { catalog } from '@/lib/api/endpoints';
import { adaptarPaginaProductos } from '@/lib/api/adapters';

export default async function Tienda({ params, searchParams }) {
  const { locale } = await params;
  const { page, size } = await searchParams;

  const pagina = await catalog.listarProductos({ page, size, page_size: 24 });
  const { productos, total, hayMas } = adaptarPaginaProductos(pagina, locale);
  // ...
}
```

Usa `API_INTERNAL_URL` (`http://backend:8000` dentro de Docker) — `client.js` la elige
solo. Aquí puedes pasar `next: { revalidate: 60 }` o `cache` para cachear la lectura.

| Módulo | Desde servidor |
|---|---|
| `catalog.listarProductos`, `obtenerProducto`, `listarFamilias`, `listarCategorias`, `listarTallas` | ✅ |

### Client Component — carrito, cuenta, pedidos

Todo lo que dependa del `X-Cart-Id` de localStorage, de la cookie de sesión del visitante,
o de una interacción. Necesita `'use client'`.

```js
'use client';
import { cart } from '@/lib/api/endpoints';
import { adaptarCarrito } from '@/lib/api/adapters';

const carrito = adaptarCarrito(await cart.anadirAlCarrito(variantId, 1));
```

| Módulo | Por qué solo cliente |
|---|---|
| `cart.*` | El carrito de invitado va por `X-Cart-Id`, que vive en localStorage |
| `account.*` | Sesión por cookie del navegador |
| `orders.*` | Ídem (y la consulta de invitado es interactiva) |
| `auth.*` | Ídem |
| `catalog.enviarConsultaProducto`, `catalog.avisarmeDeStock` | Son escrituras: necesitan CSRF |

Llamar a `cart.obtenerCarrito()` desde un Server Component **no falla**: devuelve siempre
el carrito vacío de nadie, porque en el servidor no hay localStorage. Es peor que un error,
porque parece funcionar.

## Cómo funciona por dentro

### La URL depende de dónde se ejecuta

```js
servidor  → process.env.API_INTERNAL_URL     // http://backend:8000
navegador → process.env.NEXT_PUBLIC_API_URL  // http://localhost:8001
```

No son intercambiables. `localhost` **dentro del contenedor del frontend** apunta al propio
frontend, no al backend; y `http://backend:8000` no lo resuelve ningún navegador.

### Sesión y CSRF

`credentials: "include"` en todas las peticiones, siempre. Para escrituras, Django exige
`X-CSRFToken`: `client.js` pide `GET /auth/csrf/` **una sola vez** antes de la primera
escritura, guarda el token **en memoria del módulo** y lo reusa.

El token sale del **cuerpo JSON**, no de `document.cookie`. No intentes leer la cookie: en
producción el panel vive en otro subdominio y desde ahí no es legible.

### Carrito de invitado

El id **no llega en una cabecera de respuesta**: viene en el cuerpo (`cart.id`), y **nace
en el primer POST** — `GET /cart/` devuelve `{ id: null }` a propósito, para que los
crawlers no creen una fila por visita. `client.js` lo persiste solo en cuanto aparece, si
la llamada lleva `conCarrito: true`.

Al iniciar sesión, **el backend fusiona** el carrito de invitado con el del usuario
(`_adopt_guest_cart` → `merge_carts`): suma cantidades sin pasarse del stock y descarta lo
agotado. Por eso `auth.iniciarSesion` acepta el `cartId`.

### Errores

El backend responde siempre `{"error": {"code","message","details"}}`. Todo eso —y también
un backend caído, un timeout o un 502 sin JSON— sale como `ApiError`:

```js
try {
  await cart.anadirAlCarrito(variantId);
} catch (error) {
  if (error.isNetworkError) mostrarAviso('No hemos podido conectar.');
  else if (error.isValidationError) mostrarAviso(error.firstDetail ?? error.message);
  else throw error;
}
```

| Propiedad | Cuándo |
|---|---|
| `isNetworkError` | `status: 0` — backend caído o timeout. **La web no puede quedarse en blanco.** |
| `isNotFound` | 404 — en una página, tradúcelo a `notFound()` de Next |
| `isAuthError` | 401/403 — hace falta sesión |
| `isValidationError` | 400/409/422 — sin stock, datos inválidos, regla de negocio |
| `firstDetail` | Primer mensaje de `details`, el motivo real por campo |

Para lecturas prescindibles, `conValorPorDefecto(promesa, valorPorDefecto)` se traga el
`ApiError` y devuelve el respaldo, para que un bloque secundario no tumbe la página. En una
ficha de producto **no** lo uses: ahí el error debe verse.

Timeout: 10 s por defecto (`timeoutMs` para ajustarlo).

## Precios: nunca recalcules el IVA

El backend guarda **decimales netos** y añade los `*_gross` con el 21 % ya aplicado.

```js
import { formatearImporte, precioProducto } from '@/lib/precio';

precioProducto(producto)          // usa effective_price_gross → "242,00 €"
formatearImporte('181.50')        // "181,50 €"
```

`parsearPrecio` / `formatearPrecio` están **deprecadas**: solo sirven para los datos de
ejemplo (`"890 €"`). Con importes de la API fallan en silencio —
`parsearPrecio("181.50") === 18150`, factor 100 — porque leen el punto decimal como
separador de miles.

Multiplicar por 1.21 en el frontend es un bug: el tipo vive en `VAT_RATE` del backend.

## Traducciones

```js
import { pickLocalized } from '@/lib/api/pickLocalized';
pickLocalized(producto, 'name', locale);
```

El castellano es el idioma base y siempre está relleno; `*_en` suele venir vacío (`""`) y
entonces se cae al castellano. **Si ves un `producto.name_en` en un componente, es un
error.**

## Adapters

Traducen la forma de la API a las props que los componentes **ya** esperan. Los componentes
no se cambian para encajar con la API: el adapter se pliega a ellos.

| Función | Para |
|---|---|
| `adaptarProductoListado` | `TarjetaProducto`, `CuadriculaProductos` |
| `adaptarProductoFicha` | `GaleriaProducto`, `FichaProductoAcciones`, `FichaProductoAtelier` |
| `adaptarPaginaProductos` | Listados con paginación de servidor |
| `variantePorColorYTalla` | **Resuelve el UUID de variante** que pide `POST /cart/` |
| `tallasDeColor` | Acotar `SelectorTalla` al color elegido |
| `adaptarCarrito`, `adaptarLineaCarrito` | `LineaCarrito`, `TarjetaCarrito` |

`variantePorColorYTalla` es la pieza que hace posible el carrito de servidor: los
selectores trabajan con strings (color por nombre, talla por código) y `POST /cart/` quiere
el UUID de la variante.

Ojo con los dos ids del carrito: `linea.id` es el del **CartItem** (el que va en
`PATCH/DELETE /cart/items/{id}/`) y `linea.variantId` el de la variante. Confundirlos da un
404.

## Tests

```bash
docker compose exec frontend npx vitest run --project unit
```

Proyecto `unit` en `vitest.config.js`, entorno node, sin Playwright. Cubre CSRF (incluido
que no se toca `document.cookie`), `X-Cart-Id`, normalización de errores, los adapters y la
resolución de variantes.
