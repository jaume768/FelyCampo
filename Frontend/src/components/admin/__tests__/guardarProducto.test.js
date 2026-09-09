/**
 * El viaje de ida y vuelta entre la API y el formulario del panel.
 *
 * Estos tests existen porque el modal de edición salía casi vacío —sin descripción, sin
 * categoría, sin composición— aunque el producto estuviera guardado con todo. No fallaba
 * el guardado: fallaba la traducción de vuelta, que sencillamente no existía.
 */

import { describe, expect, it } from 'vitest';

import { adaptarProductoAdmin } from '@/lib/api/adminCatalog';
import { productoAFormulario, camposQueNoSeGuardan, formularioAApi } from '../guardarProducto';

/** Respuesta REAL de `/api/v1/admin/products/`, comprobada contra el servidor. */
const DE_LA_API = {
  id: 'p-uuid',
  slug: 'prueba',
  name: 'prueba',
  name_en: 'test',
  description: 'una descripcion',
  description_en: 'a description',
  composition: '100% algodon',
  care: '',
  design_code: 'FCSWUK4QPW0',
  line: 'pret_a_porter',
  status: 'active',
  is_published: true,
  kind: 'simple',
  sale_mode: 'in_stock',
  price: '100.00',
  family: 'f-uuid',
  family_detail: { id: 'f-uuid', name: 'Tops y Camisas', slug: 'tops-y-camisas', code: 'TO' },
  collection: 'col-uuid',
  collection_detail: { id: 'col-uuid', name: 'Otoño-Invierno 2027', code: 'FW27' },
  categories: ['c-uuid'],
  categories_detail: [{ id: 'c-uuid', name: 'Tops y Camisas', slug: 'tops-y-camisas' }],
  fabrics: [],
  images: [],
};

// Las del panel viven en `CategoriasProvider`, con ids locales tipo 'cat7'.
const CATEGORIAS_PANEL = [
  { id: 'cat1', nombre: 'Vestidos' },
  { id: 'cat7', nombre: 'Tops y Camisas' },
];

describe('productoAFormulario', () => {
  const semilla = productoAFormulario(adaptarProductoAdmin(DE_LA_API), CATEGORIAS_PANEL);

  it('rellena la descripción, que el formulario lee como `descripcionCorta`', () => {
    expect(semilla.descripcionCorta).toEqual({ es: 'una descripcion', en: 'a description' });
  });

  it('convierte la composición en bilingüe: el formulario lee `composicion.es`', () => {
    // La API devuelve una cadena; leer `.es` sobre ella daba undefined → campo vacío.
    expect(semilla.composicion).toEqual({ es: '100% algodon', en: '' });
  });

  it('conserva el nombre en inglés, que antes se perdía al reguardar', () => {
    expect(semilla.nombre).toEqual({ es: 'prueba', en: 'test' });
  });

  it('traduce la `Category` real al id del panel, que es lo que usa el <select>', () => {
    // El puente es el slug, igual que al guardar: 'cat7' no significa nada en la API, y
    // el UUID no significa nada en el desplegable.
    expect(semilla.categoriaId).toBe('cat7');
  });

  it('deja la colección como código, no como el objeto entero', () => {
    expect(semilla.coleccion).toBe('FW27');
  });

  it('mantiene familia, tipo, estado y precio para que el modal abra relleno', () => {
    expect(semilla.familiaId).toBe('f-uuid');
    expect(semilla.tipo).toBe('pret-a-porter');
    expect(semilla.estado).toBe('Activo');
    expect(semilla.precio).toBe('100.00');
  });

  it('sin categoría equivalente en el panel, no inventa una', () => {
    const sinPareja = productoAFormulario(adaptarProductoAdmin(DE_LA_API), [{ id: 'cat1', nombre: 'Faldas' }]);
    expect(sinPareja.categoriaId).toBe('');
  });

  it('lo que sale de aquí vuelve a entrar por formularioAApi sin perder nada', () => {
    const cuerpo = formularioAApi({ ...semilla, modoVenta: 'in_stock' }, { familiaId: semilla.familiaId });
    expect(cuerpo.name).toBe('prueba');
    expect(cuerpo.name_en).toBe('test');
    expect(cuerpo.description).toBe('una descripcion');
    expect(cuerpo.composition).toBe('100% algodon');
    expect(cuerpo.family).toBe('f-uuid');
    expect(cuerpo.status).toBe('active');
  });
});

describe('camposQueNoSeGuardan', () => {
  it('avisa de las tallas y el stock, que no son de Product sino de Variant', () => {
    // Faltaban en la lista: se rellenaban y se perdían en silencio.
    expect(camposQueNoSeGuardan({ tallas: [{ talla: '38', stock: 3 }] })).toContain('Tallas y stock');
  });

  it('avisa de los colores, que viven en Colorway', () => {
    expect(camposQueNoSeGuardan({ colorIds: ['negro'] })).toContain('Colores');
  });

  it('no avisa de lo que está vacío', () => {
    expect(camposQueNoSeGuardan({ tallas: [], colorIds: [], prendas: [] })).toEqual([]);
  });
});
