// AtelierDetalle.jsx

/* ============================================================
   FICHA DE ATELIER — Fely Campo. Plantilla compartida por
   /atelier-fiesta/salamanca, /madrid y /oviedo (cada page.js solo pasa
   su id). Server Component: pone los datos para Google (ClothingStore +
   BreadcrumbList, con lo publicado) y deja el cuerpo a
   AtelierContenido.jsx, que admite la vista previa del admin
   (/admin/ateliers/<id>). Datos: lib/ateliers.js (src/datos/ateliers.js).
   ============================================================ */

import { JsonLd } from '@/components/ui';
import { tiendaAtelier, migas } from '@/lib/datosEstructurados';
import { obtenerSede, ubicacionDe } from '@/lib/ateliers';
import { textoEn } from '@/lib/previa';
import AtelierContenido from './AtelierContenido';

function AtelierDetalle({ id, locale }) {
  const sede = obtenerSede(id);
  const ubicacion = ubicacionDe(sede);
  const nombreCiudad = textoEn(sede.nombreCiudad, locale);

  // ClothingStore + BreadcrumbList (auditoría SEO M2): dirección y
  // teléfono los mismos que se pintan en la página.
  const jsonLd = [
    tiendaAtelier({
      ubicacion,
      nombre: `Fely Campo ${ubicacion.nombre}`,
      url: `/${locale}/atelier-fiesta/${id}`,
      imagen: sede.heroMedio.tipo === 'imagen' ? sede.heroMedio.src : sede.heroMedio.poster,
    }),
    migas([
      { nombre: 'Fely Campo', ruta: `/${locale}` },
      { nombre: 'Atelier', ruta: `/${locale}/atelier` },
      { nombre: nombreCiudad },
    ]),
  ];

  return (
    <section>
      <JsonLd datos={jsonLd} />
      <AtelierContenido publicado={sede} locale={locale} />
    </section>
  );
}

export default AtelierDetalle;
