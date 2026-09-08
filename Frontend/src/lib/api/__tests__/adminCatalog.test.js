import { describe, it, expect } from 'vitest';

import {
  adaptarProductoAdmin,
  serializarProductoAdmin,
  filtrosProductosAdmin,
  ESTADO_POR_STATUS,
  STATUS_POR_ESTADO,
  LINEA_POR_TIPO,
  TIPO_POR_LINEA,
} from '../adminCatalog';

/** Copia recortada de una respuesta real de GET /api/v1/admin/products/. */
const PRODUCTO_ADMIN = {
  id: '2b0091ed-a11a-4188-9080-15ad2851f650',
  slug: 'vestido-aria-ve-120',
  name: 'Vestido Aria',
  name_en: '',
  description: 'Descripción',
  description_en: '',
  composition: '100% seda',
  care: 'Lavar en frío',
  design_code: '120',
  line: 'pret_a_porter',
  kind: 'simple',
  sale_mode: 'in_stock',
  status: 'active',
  is_published: true,
  published_at: '2026-09-01T10:00:00Z',
  price: '290.00',
  sale_price: null,
  is_outlet: false,
  is_featured: true,
  featured_position: 1,
  family: 'f-uuid',
  family_detail: { id: 'f-uuid', code: 'VE', name: 'Vestidos', slug: 'vestidos' },
  collection: null,
  collection_detail: null,
  categories: ['c-uuid'],
  categories_detail: [{ id: 'c-uuid', name: 'Fiesta', slug: 'fiesta' }],
  fabrics: [],
  fabrics_detail: [],
  colorways: [],
  images: [{ id: 'i1', image: 'http://localhost:8001/media/a.webp', position: 0 }],
  created_at: '2026-09-01T10:00:00Z',
  updated_at: '2026-09-01T10:00:00Z',
};

describe('vocabulario estado', () => {
  it('traduce status del backend a la etiqueta del panel', () => {
    expect(ESTADO_POR_STATUS.draft).toBe('Borrador');
    expect(ESTADO_POR_STATUS.active).toBe('Activo');
    expect(ESTADO_POR_STATUS.archived).toBe('Archivado');
  });

  it('la vuelta es simétrica', () => {
    for (const [status, etiqueta] of Object.entries(ESTADO_POR_STATUS)) {
      expect(STATUS_POR_ESTADO[etiqueta]).toBe(status);
    }
  });

  it('"Programado" ya existe en el backend como `scheduled`', () => {
    // Se añadió al modelo: el producto no es público hasta su `published_at`, y el
    // comando `publish_scheduled` (cron) lo pasa a `active` cuando llega la hora.
    expect(STATUS_POR_ESTADO.Programado).toBe('scheduled');
    expect(ESTADO_POR_STATUS.scheduled).toBe('Programado');
  });
});

describe('vocabulario tipo/línea', () => {
  it('traduce los tres tipos que SÍ son líneas comerciales', () => {
    expect(LINEA_POR_TIPO['pret-a-porter']).toBe('pret_a_porter');
    expect(LINEA_POR_TIPO.atelier).toBe('atelier');
    expect(LINEA_POR_TIPO.archivo).toBe('archive');
  });

  it('novia y fiesta NO son líneas: van por Collection dentro de archive', () => {
    // Decisión tomada: son colecciones editoriales, no líneas comerciales.
    expect(LINEA_POR_TIPO.novia).toBeUndefined();
    expect(LINEA_POR_TIPO.fiesta).toBeUndefined();
  });

  it('la vuelta cubre las tres líneas del modelo', () => {
    expect(TIPO_POR_LINEA.pret_a_porter).toBe('pret-a-porter');
    expect(TIPO_POR_LINEA.archive).toBe('archivo');
  });
});

describe('adaptarProductoAdmin', () => {
  const p = adaptarProductoAdmin(PRODUCTO_ADMIN);

  it('deja el precio como decimal, sin formatear', () => {
    // El mock guardaba "890 €" DENTRO del dato; eso es lo que hacía que parsearPrecio
    // leyera el punto decimal como separador de miles.
    expect(p.precio).toBe('290.00');
    expect(String(p.precio)).not.toContain('€');
  });

  it('traduce estado y tipo al vocabulario del panel', () => {
    expect(p.estado).toBe('Activo');
    expect(p.tipo).toBe('pret-a-porter');
  });

  it('relaciona por UUID y además trae el detalle para pintar', () => {
    // El mock resolvía con .find(x => x.nombre === ...). Ahora hay id.
    expect(p.familiaId).toBe('f-uuid');
    expect(p.familia.nombre).toBe('Vestidos');
    expect(p.categoriaIds).toEqual(['c-uuid']);
    expect(p.categorias[0].nombre).toBe('Fiesta');
  });

  it('usa como portada la primera imagen por posición', () => {
    expect(p.imagen).toBe('http://localhost:8001/media/a.webp');
  });

  it('un producto sin precio (solo consulta) no inventa un cero', () => {
    const sinPrecio = adaptarProductoAdmin({ ...PRODUCTO_ADMIN, price: null, sale_mode: 'on_request' });
    expect(sinPrecio.precio).toBeNull();
  });
});

describe('serializarProductoAdmin', () => {
  it('manda status, nunca is_published', () => {
    // is_published se deriva en Product.save(): mandarlo a mano se sobrescribe solo.
    const cuerpo = serializarProductoAdmin({ estado: 'Activo', nombre: 'X' });
    expect(cuerpo.status).toBe('active');
    expect(cuerpo).not.toHaveProperty('is_published');
  });

  it('traduce el tipo del panel a line', () => {
    expect(serializarProductoAdmin({ tipo: 'archivo' }).line).toBe('archive');
  });

  it('un precio vacío se manda como null, no como cero', () => {
    // "" y 0 son cosas distintas: 0 € es gratis, "" es sin precio de catálogo.
    expect(serializarProductoAdmin({ precio: '' }).price).toBeNull();
    expect(serializarProductoAdmin({ precio: '10.00' }).price).toBe('10.00');
  });

  it('no manda campos que no se han tocado', () => {
    const cuerpo = serializarProductoAdmin({ nombre: 'Solo el nombre' });
    expect(cuerpo).toEqual({ name: 'Solo el nombre' });
  });
});

describe('filtrosProductosAdmin', () => {
  it('siempre pagina en servidor', () => {
    expect(filtrosProductosAdmin()).toEqual({ page: 1, page_size: 20 });
  });

  it('traduce búsqueda, tipo y estado a los params de la API', () => {
    expect(filtrosProductosAdmin({ busqueda: 'aria', tipo: 'atelier', estado: 'Borrador' })).toEqual({
      page: 1,
      page_size: 20,
      search: 'aria',
      line: 'atelier',
      status: 'draft',
    });
  });

  it('filtra por programado, que ya es un estado real', () => {
    expect(filtrosProductosAdmin({ estado: 'Programado' }).status).toBe('scheduled');
  });

  it('ignora un estado que el backend no conoce', () => {
    expect(filtrosProductosAdmin({ estado: 'Inventado' })).not.toHaveProperty('status');
  });
});
