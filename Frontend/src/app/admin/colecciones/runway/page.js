'use client';

import ListaProductos from '@/components/admin/ListaProductos';

// cat11 La Colección / cat12 Dreaming / cat13 Self World / cat14 Lei Zu /
// cat15 The Way Here / cat16 Zigurat / cat17 Tempore / cat18 Nagare /
// cat19 Diafonía — ids fijados en mockData.js categoriasMock.archivo,
// emparejados por temporada con las portadas en public/img/collections/runway.
const IMAGENES_CATEGORIA = {
  cat11: '/img/collections/runway/FW27_lacoleccion-cover.webp',
  cat12: '/img/collections/runway/SS26_dreaming-cover.webp',
  cat13: '/img/collections/runway/FW26_selfworld-cover.webp',
  cat14: '/img/collections/runway/SS25_leizu-cover.webp',
  cat15: '/img/collections/runway/FW25_thewayhere-cover.webp',
  cat16: '/img/collections/runway/SS24_zigurat-cover.webp',
  cat17: '/img/collections/runway/FW24_tempore-cover.webp',
  cat18: '/img/collections/runway/SS23_nagare-cover.webp',
  cat19: '/img/collections/runway/FW23_diafonia-cover.webp',
};

export default function ProductosRunwayPage() {
  return (
    <ListaProductos
      tipoFijo="archivo"
      titulo="Runway"
      agruparPorCategoria
      imagenesCategoria={IMAGENES_CATEGORIA}
    />
  );
}
