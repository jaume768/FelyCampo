'use client';

/* ============================================================
   ADMIN SIDEBAR — Fely Campo
   Navegación fija del panel interno. Los 3 tipos de producto son ítems de
   primer nivel, no un submenú colapsable "Productos" que los contiene —
   Prêt-à-porter/Atelier están en el grupo "Productos", Runway
   (`tipo: 'archivo'` internamente, ver mockData.js) vive solo en su propio
   grupo "Colecciones". Cada uno conserva su propio desplegable de
   categorías (chevron aparte, igual que antes).
   ============================================================ */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCategorias } from './Categorias';
import { codigoTemporada, citasMock, consultasPrecioMock } from '@/components/admin/mockData';
import {
  Home,
  Newspaper,
  ChevronDown,
  Archive,
  Heart,
  PartyPopper,
  Mail,
  MessageCircleQuestionMark,
  CalendarDays,
  Images,
  LayoutTemplate,
  BookOpen,
  Spool,
  Shirt,
  Store,
  MapPin,
  Phone,
  PanelTop,
  Search,
  // Iconos de las secciones ocultas (GRUPOS_OCULTOS), para cuando vuelvan:
  // Palette, Star, Package, Layers, Boxes, Users, BarChart3,
  // Settings, SwatchBook,
} from 'lucide-react';
import styles from './AdminSidebar.module.css';

// Menú adaptado a lo que usa de verdad el front (2026-10-27): los
// formularios reales (cita, solicitud de atelier, newsletter), las
// fotos/reseñas de /atelier/vosotras y el contenido que se ve en la web
// (colecciones de pasarela, Novia, Fiesta, productos de Atelier y
// Podcast) y los productos de Prêt-à-porter. Lo de la tienda online
// (Pedidos, Stock, Materiales, Métricas, Clientes, Reseñas de producto) y
// Diseño/Settings quedan ocultos de momento (no se usan, a petición): ver GRUPOS_OCULTOS más abajo, comentado —
// para recuperar uno, mover su item de vuelta aquí. Las páginas siguen
// existiendo en /admin/..., solo no salen en el menú.
const grupos = [
  {
    titulo: null,
    items: [
      { href: '/admin', label: 'Home', icono: Home },
    ],
  },
  {
    titulo: 'Contactos',
    items: [
      {
        href: '/admin/consultas', label: 'Citas', icono: CalendarDays, nuevos: citasMock.filter((c) => c.estado === 'Pendiente').length,
      },
      {
        href: '/admin/consultas-precio', label: 'Consultas de vestidos', icono: MessageCircleQuestionMark, nuevos: consultasPrecioMock.filter((c) => c.estado === 'Pendiente').length,
      },
      { href: '/admin/newsletter', label: 'Newsletter', icono: Mail },
    ],
  },
  {
    // Mismo orden y mismos grupos que el menú de la web (Navbar.jsx):
    // Sobre Fely › Atelier › Colecciones › Dónde encontrarnos. "subgrupo"
    // es solo un rótulo.
    titulo: 'Páginas de la web',
    items: [
      { href: '/admin/landing', label: 'Página de inicio', icono: LayoutTemplate },
      // Lo que sale en todas las páginas: menú, «Pedir cita», newsletter.
      { href: '/admin/paginas/piezas-comunes', label: 'Menú, Pedir cita y newsletter', icono: PanelTop },
      { href: '/admin/paginas/textos-google', label: 'Textos de Google', icono: Search },
      { subgrupo: 'Sobre Fely' },
      { href: '/admin/paginas/sobre-fely', label: 'Historia de Fely', icono: BookOpen },
      {
        href: '/admin/blog', label: 'Blog & Podcast', icono: Newspaper,
      },
      { href: '/admin/paginas/talleres', label: 'Nuestros talleres', icono: Spool },
      { subgrupo: 'Atelier' },
      { href: '/admin/vosotras', label: 'Vosotras', icono: Images },
      { subgrupo: 'Colecciones' },
      // Sin desplegable con el nombre de cada colección (a petición): ya
      // están en la pestaña de colecciones de cada sección.
      {
        href: '/admin/colecciones/fiesta', label: 'Colección Fiesta', icono: PartyPopper,
      },
      {
        href: '/admin/colecciones/novia', label: 'Colección Novias', icono: Heart,
      },
      // Prêt-à-porter: los productos de la tienda (sin venta online), en el
      // mismo sitio que en la navegación de la web.
      {
        href: '/admin/productos/pret-a-porter', label: 'Prêt-à-porter', icono: Shirt,
      },
      {
        href: '/admin/colecciones/runway', label: 'Runway', icono: Archive,
      },
      // Como «Dónde encontrar Fely Campo» en el menú de la web: los ateliers
      // propios (su página y su contacto) y el mapa de puntos de venta.
      { subgrupo: 'Dónde encontrarnos' },
      { href: '/admin/contacto', label: 'Contacto y redes', icono: Phone },
      { href: '/admin/paginas/visitanos', label: 'Página Visítanos', icono: LayoutTemplate },
      { href: '/admin/ateliers/salamanca', label: 'Atelier Salamanca', icono: Store },
      { href: '/admin/ateliers/madrid', label: 'Showroom Madrid', icono: Store },
      { href: '/admin/ateliers/oviedo', label: 'Atelier Oviedo', icono: Store },
      { href: '/admin/puntos-de-venta', label: 'Puntos de venta', icono: MapPin },
    ],
  },
];

/* Ocultos de momento (ver comentario de "grupos" arriba):
const GRUPOS_OCULTOS = [
  {
    titulo: 'Ventas',
    items: [
      { href: '/admin/pedidos', label: 'Pedidos', icono: Package, nuevos: 3 },
      { href: '/admin/metricas', label: 'Métricas', icono: BarChart3 },
    ],
  },
  {
    titulo: 'Productos',
    items: [
      // Prêt-à-porter ya sale arriba, en «Páginas de la web › Colecciones».
      { href: '/admin/stock', label: 'Stock', icono: Boxes },
      {
        href: '/admin/materiales/colores',
        label: 'Tus Materiales',
        icono: Layers,
        children: [
          { href: '/admin/materiales/colores', label: 'Colores', icono: Palette },
          { href: '/admin/materiales/tejidos', label: 'Tejidos y Composición', icono: SwatchBook },
        ],
      },
    ],
  },
  {
    titulo: 'Clientes',
    items: [
      { href: '/admin/clientes', label: 'Clientes', icono: Users },
      { href: '/admin/resenas', label: 'Reseñas', icono: Star, nuevos: 2 },
    ],
  },
  {
    titulo: 'Páginas de la web',
    items: [
      { href: '/admin/diseno', label: 'Diseño', icono: Palette, porHacer: true },
    ],
  },
  {
    titulo: 'Sistema',
    items: [
      { href: '/admin/settings', label: 'Settings', icono: Settings, porHacer: true },
    ],
  },
];
*/

// Items con submenú desplegable — dinámico (item.tipo, vía
// CategoriasProvider) o estático (item.children, ver "Tus Materiales").
// Ambos necesitan abrirse solos al aterrizar directamente en una de sus
// sub-rutas (recarga, link externo...), no solo al hacer click.
const itemsConSubmenu = grupos.flatMap((grupo) => grupo.items).filter((item) => item.tipo || item.children);

function itemContieneRuta(item, pathname) {
  if (pathname === item.href) return true;
  return Boolean(item.children?.some((c) => pathname === c.href));
}

export function AdminMarca() {
  return (
    // Sin el icono (logo) a la izquierda — quitado a petición: solo el
    // texto "Admin Panel" y debajo "Fely Campo".
    <Link href="/admin" className={styles.marca}>
      <div className={styles.marcaTexto}>
        <p className={styles.marcaNombre}>Admin Panel</p>
        <p className={styles.marcaSubtitulo}>Fely Campo</p>
      </div>
    </Link>
  );
}

function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoriaActiva = searchParams.get('categoria');
  const { categorias } = useCategorias();
  const [subAbiertos, setSubAbiertos] = useState(() => {
    const itemActivo = itemsConSubmenu.find((item) => itemContieneRuta(item, pathname));
    return itemActivo ? { [itemActivo.href]: true } : {};
  });

  useEffect(() => {
    const itemActivo = itemsConSubmenu.find((item) => itemContieneRuta(item, pathname));
    if (itemActivo) setSubAbiertos((actual) => (actual[itemActivo.href] ? actual : { ...actual, [itemActivo.href]: true }));
  }, [pathname]);

  function renderEnlace(item) {
    if (item.subgrupo) {
      return (
        <li key={`subgrupo-${item.subgrupo}`} className={styles.subgrupo} aria-hidden="true">
          {item.subgrupo}
        </li>
      );
    }
    if (item.tipo) {
      const Icono = item.icono;
      // Los archivos de colecciones (fija: true) ordenan por `orden`
      // ascendente = más reciente primero — sin este sort una colección
      // nueva aparecía al final del array (orden de inserción), no arriba
      // del todo aunque su `orden` diga que es la más reciente. Solo para
      // `fija`: Prêt-à-porter/Atelier se reordenan por drag & drop
      // (`reordenarCategorias` en Categorias.jsx), que cambia el array
      // pero no toca `orden` — ordenar esos por `orden` ignoraría el
      // reorden manual del usuario.
      const categoriasSinFiltrar = categorias[item.tipo] || [];
      const categoriasItem = categoriasSinFiltrar.some((c) => c.fija)
        ? categoriasSinFiltrar.filter((c) => c.visible).sort((a, b) => a.orden - b.orden)
        : categoriasSinFiltrar.filter((c) => c.visible);
      const enRuta = pathname === item.href;
      const tieneCategorias = categoriasItem.length > 0;
      const subAbierto = Boolean(subAbiertos[item.href]);
      return (
        <li key={item.href}>
          <div className={`${styles.item} ${enRuta && !categoriaActiva ? styles.activo : ''}`}>
            <Link
              href={item.href}
              className={styles.itemEnlace}
              onClick={() => {
                if (tieneCategorias) setSubAbiertos((actual) => ({ ...actual, [item.href]: true }));
              }}
            >
              <Icono className={styles.icono} aria-hidden="true" />
              <span className={styles.label}>{item.label}</span>
            </Link>
            {tieneCategorias && (
              <button
                type="button"
                className={styles.chevronBoton}
                aria-expanded={subAbierto}
                aria-label={`${subAbierto ? 'Ocultar' : 'Mostrar'} categorías de ${item.label}`}
                onClick={() => setSubAbiertos((actual) => ({ ...actual, [item.href]: !actual[item.href] }))}
              >
                <ChevronDown className={`${styles.chevron} ${subAbierto ? styles.chevronAbierto : ''}`} aria-hidden="true" />
              </button>
            )}
          </div>
          {tieneCategorias && subAbierto && (
            <ul className={styles.sublista}>
              {categoriasItem.map((cat) => {
                const hrefCategoria = `${item.href}?categoria=${cat.id}`;
                const activo = enRuta && categoriaActiva === cat.id;
                return (
                  <li key={cat.id}>
                    <Link
                      href={hrefCategoria}
                      className={`${styles.subitem} ${activo ? styles.activo : ''}`}
                    >
                      <span>{cat.temporada ? `${cat.nombre} (${codigoTemporada(cat.temporada)})` : cat.nombre}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    }

    if (item.children) {
      const Icono = item.icono;
      const enRuta = item.children.some((c) => pathname === c.href);
      const subAbierto = Boolean(subAbiertos[item.href]);
      return (
        <li key={item.href}>
          <div className={`${styles.item} ${enRuta ? styles.activo : ''}`}>
            <Link
              href={item.href}
              className={styles.itemEnlace}
              onClick={() => setSubAbiertos((actual) => ({ ...actual, [item.href]: true }))}
            >
              <Icono className={styles.icono} aria-hidden="true" />
              <span className={styles.label}>{item.label}</span>
            </Link>
            <button
              type="button"
              className={styles.chevronBoton}
              aria-expanded={subAbierto}
              aria-label={`${subAbierto ? 'Ocultar' : 'Mostrar'} submenú de ${item.label}`}
              onClick={() => setSubAbiertos((actual) => ({ ...actual, [item.href]: !actual[item.href] }))}
            >
              <ChevronDown className={`${styles.chevron} ${subAbierto ? styles.chevronAbierto : ''}`} aria-hidden="true" />
            </button>
          </div>
          {subAbierto && (
            <ul className={styles.sublista}>
              {item.children.map((child) => {
                const IconoChild = child.icono;
                const activo = pathname === child.href;
                return (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      className={`${styles.subitem} ${activo ? styles.activo : ''}`}
                    >
                      <IconoChild className={styles.iconoSubitem} aria-hidden="true" />
                      <span>{child.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    }

    const Icono = item.icono;
    const activo = item.href === '/admin'
      ? pathname === '/admin'
      : (pathname === item.href || pathname.startsWith(`${item.href}/`));
    return (
      <li key={item.href}>
        <Link href={item.href} className={`${styles.item} ${activo ? styles.activo : ''}`}>
          <Icono className={styles.icono} aria-hidden="true" />
          <span className={styles.label}>{item.label}</span>
          {item.nuevos > 0 && <span className={styles.contador}>{item.nuevos}</span>}
          {item.porHacer && <span className={styles.porHacer}>Por hacer</span>}
        </Link>
      </li>
    );
  }

  return (
    <nav className={styles.sidebar} aria-label="Navegación del panel">
      <div className={styles.lista}>
        {grupos.map((grupo, indice) => (
          <div key={grupo.titulo || `grupo-${indice}`} className={styles.grupo}>
            {grupo.titulo && <p className={styles.tituloGrupo}>{grupo.titulo}</p>}
            <ul className={styles.grupoLista}>
              {grupo.items.map((item) => renderEnlace(item))}
            </ul>
          </div>
        ))}
      </div>

      <Link href="/" className={styles.verWeb}>Ver web pública</Link>
    </nav>
  );
}

export default AdminSidebar;
