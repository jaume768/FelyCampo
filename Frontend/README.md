# Fely Campo — Proyecto frontend

Proyecto Next.js + Tailwind v4 listo para levantar, previo al backend.

## Cómo levantarlo (primera vez)

```bash
npm install     # instala Next, React y Tailwind (solo la primera vez)
npm run dev     # arranca en http://localhost:3000
```

Todas las rutas del sitemap ya navegan (con placeholder las pendientes).

---

## Estructura — con el origen de cada archivo

Leyenda:  ✅ = ya lo tenías (entregas anteriores, sin cambios)
          ✏️ = ya lo tenías, con un ajuste pequeño (indicado)
          🆕 = nuevo (creado para levantar el proyecto)
          🔧 = lo añadirá Jaume (backend/lógica)

```
fely-campo/
├── package.json               🆕 dependencias y scripts (npm run dev)
├── postcss.config.mjs         🆕 conecta Tailwind v4 con Next
├── jsconfig.json              🆕 activa el alias @/  →  src/
├── README.md                  🆕 este archivo
├── styleguide.html            ✅ guía visual (doble clic, fuera del build)
│
├── docs/
│   └── design.md              ✅ documentación del sistema de diseño
├── tokens/
│   └── tokens.json            ✅ design tokens W3C (puente con Figma)
│
├── public/                    🆕 estáticos: aquí va la FOTOGRAFÍA
│   ├── img/                      (organizar por colección: novias-2026/, atelier/...)
│   └── video/
│
└── src/
    ├── styles/
    │   └── global.css         ✅ Tailwind v4 + @theme, todos los tokens
    │
    ├── components/
    │   ├── ui/
    │   │   ├── Boton.jsx            ✏️ añadido 'use client' (necesario en Next)
    │   │   ├── Input.jsx            ✏️ añadido 'use client'
    │   │   ├── SelectorTalla.jsx    ✏️ añadido 'use client'
    │   │   ├── SelectorCantidad.jsx ✏️ añadido 'use client'
    │   │   └── index.js             ✅
    │   ├── producto/
    │   │   ├── TarjetaProducto.jsx  ✅
    │   │   ├── LineaCarrito.jsx     ✏️ añadido 'use client'
    │   │   └── index.js             ✅
    │   └── layout/
    │       ├── Navbar.jsx           ✅
    │       ├── Footer.jsx           ✅
    │       ├── BloqueSeccion.jsx    ✅
    │       └── index.js             ✅
    │
    └── app/                   ← LAS PÁGINAS: cada carpeta = una ruta
        ├── layout.js          🆕 plantilla raíz: Navbar + Footer envuelven todo
        ├── page.js            🆕 home mínima (usa los componentes del sistema)
        ├── atelier/
        │   ├── page.js        🆕 placeholder            → /atelier
        │   ├── novias/        🆕 placeholder            → /atelier/novias
        │   └── fiesta/        🆕 placeholder            → /atelier/fiesta
        ├── pret-a-porter/
        │   ├── page.js        🆕 placeholder            → /pret-a-porter
        │   └── [producto]/    🆕 plantilla dinámica     → /pret-a-porter/vestido-aurora
        ├── archivo/
        │   ├── page.js        🆕 placeholder            → /archivo
        │   ├── runway/        🆕 placeholder            → /archivo/runway
        │   └── colecciones/
        │       ├── page.js    🆕 placeholder            → /archivo/colecciones
        │       └── [coleccion]/
        │           ├── page.js 🆕 plantilla dinámica    → /archivo/colecciones/lei-zu
        │           └── [look]/ 🆕 plantilla dinámica    → .../lei-zu/look-03
        ├── about/
        │   ├── page.js        🆕 placeholder            → /about
        │   └── fely-campo/    🆕 placeholder            → /about/fely-campo
        ├── visitenos/         🆕 placeholder            → /visitenos
        ├── carrito/           🆕 placeholder            → /carrito
        ├── responsabilidad/   🆕 placeholder            → /responsabilidad
        ├── ayuda/atencion-cliente/  🆕 placeholder      → /ayuda/atencion-cliente
        └── legal/
            ├── aviso-legal/   🆕 placeholder
            ├── privacidad/    🆕 placeholder
            ├── cookies/       🆕 placeholder
            └── terminos/      🆕 placeholder
```

### Lo que añadirá Jaume (no existe aún, a propósito) 🔧
- `src/lib/` o `src/utils/` — funciones auxiliares
- `src/hooks/` — lógica reutilizable (carrito, etc.)
- `src/context/` — estado global
- Conexión de datos en las rutas dinámicas `[producto]`, `[coleccion]`, `[look]`
- Zona de usuario registrado y panel de administración
- `jsconfig`/tooling adicional que decida en el montaje

## Notas

- Las rutas entre corchetes (`[producto]`) son PLANTILLAS DINÁMICAS: un solo
  diseño sirve para todos los productos/colecciones/looks. Prueba a visitar
  /pret-a-porter/vestido-aurora y verás que ya responde.
- `layout.js` monta Navbar y Footer una sola vez para toda la web.
- Los componentes interactivos llevan `'use client'` (requisito de Next.js
  para todo lo que usa clics o estado).
- Identidad: rosa #E92174 como acento, Helvetica/Inter sin tracking,
  botones rectos, aire 120–200px. Ver docs/design.md.

---

## Corrección aplicada (verificado contra capturas reales de Cecilie Bahnsen)

Al comparar el sistema con capturas reales de ceciliebahnsen.com se detectaron
tres desviaciones sin base en el referente, ya corregidas en todos los archivos
(`global.css`, `tokens.json`, `design.md`, `styleguide.html`, `TarjetaProducto.jsx`):

- **Radio de imágenes:** era 4px → **0px**. Cero redondeo en todo el sistema,
  sin excepción — así es el referente real, ni siquiera las fotos de producto
  llevan esquina suavizada.
- **Badge de producto:** era un pill relleno de rosa → **texto plano, sin fondo**,
  esquina superior derecha de la imagen (así aparece "New" en el sitio real).
- **Tarjeta de producto:** sin contenedor ni marco — la imagen ocupa toda la
  columna, se separa de otras solo por el gap del grid (16px), nunca por borde
  ni sombra.
