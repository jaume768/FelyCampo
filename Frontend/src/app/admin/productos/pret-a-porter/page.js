'use client';

import ListaProductos from '@/components/admin/ListaProductos';

// cat7 Tops y Camisas / cat8 Chaquetas y Abrigos / cat2 Faldas / cat1
// Vestidos / cat9 Zapatos / cat10 Accesorios — ids fijados en
// mockData.js categoriasMock['pret-a-porter'].
const IMAGENES_CATEGORIA = {
  cat7: '/img/ecommerce/categorias/camisa.webp',
  cat8: '/img/ecommerce/categorias/chaqueta.webp',
  cat2: '/img/ecommerce/categorias/faldas.webp',
  cat1: '/img/ecommerce/categorias/vestido.webp',
  cat9: '/img/ecommerce/categorias/zapatos.webp',
  cat10: '/img/ecommerce/categorias/pendientes.webp',
};

export default function ProductosPretAPorterPage() {
  return (
    <ListaProductos
      tipoFijo="pret-a-porter"
      titulo="Prêt-à-porter"
      agruparPorCategoria
      imagenesCategoria={IMAGENES_CATEGORIA}
    />
  );
}
