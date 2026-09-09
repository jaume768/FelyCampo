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
  it('las tallas y los colores YA NO se avisan: ahora se guardan', () => {
    // Viven en `Colorway`/`Variant` y los crea `sincronizarColorways`. Antes se
    // rellenaban y se perdían.
    expect(camposQueNoSeGuardan({ tallas: [{ talla: '38', stock: 3 }], colorIds: ['negro'] })).toEqual([]);
  });

  it('tampoco los orígenes ni los iconos de cuidado, que ya son campos de Product', () => {
    expect(camposQueNoSeGuardan({
      cuidadoIds: ['wash_30'],
      disenadoEn: { es: 'Mallorca', en: '' },
    })).toEqual([]);
  });

  it('las prendas tampoco: ya tienen su modelo (ProductPiece)', () => {
    expect(camposQueNoSeGuardan({ prendas: [{ nombre: 'Pantalón', sku: 'X' }] })).toEqual([]);
  });

  it('sigue avisando de lo que de verdad no tiene dónde guardarse', () => {
    // `Look` y `Review` no existen como modelos, ni hay modelo de estampado.
    expect(camposQueNoSeGuardan({ lookVinculado: { id: 'l1' } })).toContain('Look de pasarela');
    expect(camposQueNoSeGuardan({ estampadoId: 'e1' })).toContain('Estampado');
  });

  it('no avisa de lo que está vacío', () => {
    expect(camposQueNoSeGuardan({ prendas: [], resenas: [], lookVinculado: null })).toEqual([]);
  });
});

describe('productoAFormulario · colores y tallas', () => {
  it('reconstruye los colores y el stock desde los colorways', () => {
    const conInventario = productoAFormulario(adaptarProductoAdmin({
      ...DE_LA_API,
      colorways: [{
        id: 'cw1',
        color: 'color-uuid',
        color_detail: { id: 'color-uuid', code: 'black', name: 'Negro' },
        is_active: true,
        variants: [
          { id: 'v1', size: 's1', size_detail: { id: 's1', code: '38' }, stock: 3, is_active: true },
          { id: 'v2', size: 's2', size_detail: { id: 's2', code: '40' }, stock: 0, is_active: true },
        ],
      }],
    }), CATEGORIAS_PANEL);

    expect(conInventario.colorIds).toEqual(['black']);
    // NÚMEROS, no cadenas: es el vocabulario del formulario (`TALLAS_DISPONIBLES` hace
    // `Number(talla)`), y con cadenas `'38' === 38` era false y no se marcaba ninguna.
    expect(conInventario.tallas).toEqual([{ talla: 38, stock: 3 }, { talla: 40, stock: 0 }]);
  });

  it('ignora los colorways desactivados: son colores que se quitaron', () => {
    const conDesactivado = productoAFormulario(adaptarProductoAdmin({
      ...DE_LA_API,
      colorways: [
        { id: 'cw1', color: 'c1', color_detail: { code: 'black' }, is_active: false, variants: [] },
        { id: 'cw2', color: 'c2', color_detail: { code: 'camel' }, is_active: true, variants: [] },
      ],
    }), CATEGORIAS_PANEL);

    expect(conDesactivado.colorIds).toEqual(['camel']);
  });

  it('una talla que no es numérica se deja como está (escala de letras)', () => {
    const conLetras = productoAFormulario(adaptarProductoAdmin({
      ...DE_LA_API,
      colorways: [{
        id: 'cw1', color: 'c1', color_detail: { code: 'black' }, is_active: true,
        variants: [{ size_detail: { code: 'M' }, stock: 2, is_active: true }],
      }],
    }), CATEGORIAS_PANEL);
    expect(conLetras.tallas).toEqual([{ talla: 'M', stock: 2 }]);
  });

  it('sin colorways no inventa colores ni tallas', () => {
    const sinNada = productoAFormulario(adaptarProductoAdmin(DE_LA_API), CATEGORIAS_PANEL);
    expect(sinNada.colorIds).toEqual([]);
    expect(sinNada.tallas).toEqual([]);
  });
});

describe('prendas y colección', () => {
  it('lee las prendas que devuelve la API', () => {
    const conPrendas = productoAFormulario(adaptarProductoAdmin({
      ...DE_LA_API,
      pieces: [{ id: 'p1', name: 'Chaqueta', name_en: 'Jacket', sku: 'MBO2724', position: 0 }],
    }), CATEGORIAS_PANEL);
    expect(conPrendas.prendas).toEqual([{ nombre: 'Chaqueta', nombreEn: 'Jacket', sku: 'MBO2724' }]);
  });

  it('las manda de vuelta con su orden, descartando las filas vacías', () => {
    const cuerpo = formularioAApi({
      nombre: { es: 'x', en: '' },
      prendas: [{ nombre: 'Chaqueta', sku: 'A' }, { nombre: '', sku: '' }, { nombre: 'Pantalón', sku: 'B' }],
    });
    expect(cuerpo.pieces).toEqual([
      { name: 'Chaqueta', name_en: '', sku: 'A', position: 0 },
      { name: 'Pantalón', name_en: '', sku: 'B', position: 1 },
    ]);
  });

  it('sin prendas en el formulario no manda la clave: un PATCH parcial no las borra', () => {
    expect('pieces' in formularioAApi({ nombre: { es: 'x', en: '' } })).toBe(false);
  });

  it('la colección se lee como código, que es lo que usa el desplegable', () => {
    const semilla = productoAFormulario(adaptarProductoAdmin(DE_LA_API), CATEGORIAS_PANEL);
    expect(semilla.coleccion).toBe('FW27');
  });
});

describe('serialización de cuidados y orígenes', () => {
  it('manda los códigos de cuidado y los orígenes repartidos en es/en', () => {
    const cuerpo = formularioAApi({
      nombre: { es: 'x', en: '' },
      cuidadoIds: ['wash_30', 'iron_low'],
      composicion: { es: '100% seda', en: '100% silk' },
      disenadoEn: { es: 'Mallorca', en: 'Majorca' },
      origenTejido: { es: 'Japón', en: 'Japan' },
    });

    expect(cuerpo.care_codes).toEqual(['wash_30', 'iron_low']);
    expect(cuerpo.composition).toBe('100% seda');
    expect(cuerpo.composition_en).toBe('100% silk');
    expect(cuerpo.designed_in).toBe('Mallorca');
    expect(cuerpo.designed_in_en).toBe('Majorca');
    expect(cuerpo.fabric_origin).toBe('Japón');
    expect(cuerpo.fabric_origin_en).toBe('Japan');
  });

  it('un origen que el formulario no toca no se manda: no machaca lo guardado', () => {
    const cuerpo = formularioAApi({ nombre: { es: 'x', en: '' } });
    expect('made_in' in cuerpo).toBe(false);
    expect('designed_in' in cuerpo).toBe(false);
  });
});
