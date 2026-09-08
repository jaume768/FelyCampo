'use client';

import ListaProductos from '@/components/admin/ListaProductos';

// cat3 Novias / cat4 Fiesta — ids fijados en mockData.js
// categoriasMock.atelier. Reutiliza las mismas fotos de sección que ya usan
// Vestido Elena/Vestido Celeste en productosMock, no hay carpeta
// /categorias dedicada para Atelier.
const IMAGENES_CATEGORIA = {
  cat3: '/img/novias-sección-FelyCampo.jpg',
  cat4: '/img/invitadas-sección-FelyCampo.jpg',
};

export default function ProductosAtelierPage() {
  return (
    <ListaProductos
      tipoFijo="atelier"
      titulo="Atelier"
      agruparPorCategoria
      imagenesCategoria={IMAGENES_CATEGORIA}
    />
  );
}
