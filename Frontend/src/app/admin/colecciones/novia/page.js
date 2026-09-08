'use client';

import ListaProductos from '@/components/admin/ListaProductos';

// cat20 Bride 27 / cat21 ME / cat22 Bambú Novia / cat23 Savia Novia /
// cat24 Inside / cat25 Introspección — ids fijados en mockData.js
// categoriasMock.novia, portadas en public/img/collections/novia.
const IMAGENES_CATEGORIA = {
  cat20: '/img/collections/novia/Bride27-cover.webp',
  cat21: '/img/collections/novia/ME-cover.webp',
  cat22: '/img/collections/novia/Bambu-cover.webp',
  cat23: '/img/collections/novia/Savia-cover.webp',
  cat24: '/img/collections/novia/Inside-cover.webp',
  cat25: '/img/collections/novia/Introspeccion-cover.webp',
};

export default function ProductosNoviaPage() {
  return (
    <ListaProductos
      tipoFijo="novia"
      titulo="Novia"
      agruparPorCategoria
      imagenesCategoria={IMAGENES_CATEGORIA}
    />
  );
}
