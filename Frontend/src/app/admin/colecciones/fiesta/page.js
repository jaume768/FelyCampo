'use client';

import ListaProductos from '@/components/admin/ListaProductos';

// cat26 Primavera Verano 2026 / cat27 Primavera Verano 2025 / cat28
// Prêt-à-porter / cat29 En Madrid / cat30 A Walk / cat31 Bambú / cat32
// Savia / cat33 Miscelanea / cat34 Essentielle / cat35 Furisode — ids
// fijados en mockData.js categoriasMock.fiesta, portadas en
// public/img/collections/fiesta.
const IMAGENES_CATEGORIA = {
  cat26: '/img/collections/fiesta/PrimaveraVerano-cover.webp',
  cat27: '/img/collections/fiesta/PrimaveraVerano25-cover.webp',
  cat28: '/img/collections/fiesta/pretaporter-cover.webp',
  cat29: '/img/collections/fiesta/Madrid-cover.webp',
  cat30: '/img/collections/fiesta/AWalk-cover.webp',
  cat31: '/img/collections/fiesta/Bambu-cover.webp',
  cat32: '/img/collections/fiesta/Savia-cover.webp',
  cat33: '/img/collections/fiesta/Miscelania-cover.webp',
  cat34: '/img/collections/fiesta/essentiele-cover.webp',
  cat35: '/img/collections/fiesta/furisode-cover.webp',
};

export default function ProductosFiestaPage() {
  return (
    <ListaProductos
      tipoFijo="fiesta"
      titulo="Fiesta"
      agruparPorCategoria
      imagenesCategoria={IMAGENES_CATEGORIA}
    />
  );
}
