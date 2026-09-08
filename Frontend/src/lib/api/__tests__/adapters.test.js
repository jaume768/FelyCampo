import { describe, it, expect } from 'vitest';

import {
  adaptarProductoListado,
  adaptarProductoFicha,
  adaptarPaginaProductos,
  variantePorColorYTalla,
  tallasDeColor,
} from '../adapters/product';
import { adaptarCarrito, adaptarLineaCarrito } from '../adapters/cart';
import { pickLocalized } from '../pickLocalized';
import { formatearImporte, precioProducto, parsearPrecio } from '@/lib/precio';

/** Copia recortada de una respuesta real del seed (GET /catalog/products/). */
const PRODUCTO_LISTADO = {
  id: '2b0091ed-a11a-4188-9080-15ad2851f650',
  slug: 'prueba-ch-1265',
  name: 'Prueba',
  name_en: '',
  family: { id: 'f1', code: 'CH', name: 'Chaquetas', name_en: '', slug: 'chaquetas' },
  line: 'pret_a_porter',
  kind: 'simple',
  sale_mode: 'in_stock',
  price: '150.00',
  sale_price: '200.00',
  price_gross: '181.50',
  sale_price_gross: '242.00',
  effective_price_gross: '242.00',
  is_on_sale: true,
  is_outlet: false,
  primary_image: { id: 'i1', image: 'http://localhost:8001/media/a.webp', alt_text: '', position: 0 },
  colors: [
    { id: 'c1', code: 'AZU', name: 'Azul noche', name_en: 'Night blue', hex_value: '#1F2A54' },
    { id: 'c2', code: 'NEG', name: 'Negro', name_en: '', hex_value: '#111111' },
  ],
  in_stock: true,
};

/** Ficha completa (GET /catalog/products/{slug}/). */
const PRODUCTO_FICHA = {
  ...PRODUCTO_LISTADO,
  description: 'Una descripción',
  description_en: 'A description',
  composition: '70% algodón',
  care: 'lavar en frío',
  categories: [{ id: 'cat1', name: 'Fiesta', name_en: '', slug: 'fiesta', position: 2, children: [] }],
  images: [{ id: 'i1', image: 'http://localhost:8001/media/a.webp', alt_text: '', position: 0 }],
  colorways: [
    {
      id: 'cw1',
      sku: 'CH-1265-AZU',
      color: { id: 'c1', code: 'AZU', name: 'Azul noche', name_en: 'Night blue', hex_value: '#1F2A54' },
      images: [],
      variants: [
        { id: 'v-azu-34', size: { id: 's34', code: '34', position: 0 }, available: 50, in_stock: true },
        { id: 'v-azu-36', size: { id: 's36', code: '36', position: 1 }, available: 0, in_stock: false },
      ],
    },
    {
      id: 'cw2',
      sku: 'CH-1265-NEG',
      color: { id: 'c2', code: 'NEG', name: 'Negro', name_en: '', hex_value: '#111111' },
      images: [{ id: 'i2', image: 'http://localhost:8001/media/b.webp', alt_text: '', position: 0 }],
      variants: [{ id: 'v-neg-36', size: { id: 's36', code: '36', position: 1 }, available: 3, in_stock: true }],
    },
  ],
  components: [],
  enquiry_only: false,
};

describe('pickLocalized', () => {
  it('en "es" devuelve el campo base', () => {
    expect(pickLocalized(PRODUCTO_LISTADO, 'name', 'es')).toBe('Prueba');
  });

  it('en "en" devuelve el campo _en cuando existe', () => {
    expect(pickLocalized(PRODUCTO_FICHA, 'description', 'en')).toBe('A description');
  });

  it('cae al castellano cuando la traducción está vacía', () => {
    // name_en: "" es lo habitual en el seed: sin traducir, no traducido a cadena vacía.
    expect(pickLocalized(PRODUCTO_LISTADO, 'name', 'en')).toBe('Prueba');
  });

  it('no revienta con null', () => {
    expect(pickLocalized(null, 'name', 'es')).toBe('');
  });
});

describe('precio', () => {
  it('formatea el decimal de la API con céntimos', () => {
    expect(formatearImporte('181.50')).toContain('181,50');
  });

  it('usa el effective_price_gross (el que se cobra), no el price_gross', () => {
    // El producto está rebajado: effective 242.00 frente a price 181.50.
    expect(precioProducto(PRODUCTO_LISTADO)).toContain('242,00');
  });

  it('no enseña precio en las piezas bajo petición (atelier)', () => {
    expect(precioProducto({ ...PRODUCTO_LISTADO, sale_mode: 'on_request' })).toBe('');
  });

  it('no aplica el IVA por su cuenta: usa el *_gross tal cual', () => {
    // 181.50 ya lleva el 21% sobre 150.00. Si el frontend lo recalculara saldría 219,62.
    const formateado = formatearImporte('181.50');
    expect(formateado).toContain('181,50');
    expect(formateado).not.toContain('219');
  });

  it('parsearPrecio (deprecado) destroza los decimales de la API', () => {
    // Documenta por qué está deprecado: fallo silencioso de factor 100.
    expect(parsearPrecio('181.50')).toBe(18150);
    expect(parsearPrecio('890 €')).toBe(890); // con datos de ejemplo sí funciona
  });
});

describe('adaptarProductoListado', () => {
  const adaptado = adaptarProductoListado(PRODUCTO_LISTADO, 'es');

  it('da a TarjetaProducto las props que ya espera', () => {
    expect(adaptado.nombre).toBe('Prueba');
    expect(adaptado.imagen).toBe('http://localhost:8001/media/a.webp');
    expect(adaptado.precio).toContain('242,00');
  });

  it('mapea los colores a {hex, nombre} para SelectorColor', () => {
    expect(adaptado.colores).toEqual([
      expect.objectContaining({ hex: '#1F2A54', nombre: 'Azul noche' }),
      expect.objectContaining({ hex: '#111111', nombre: 'Negro' }),
    ]);
  });

  it('traduce los nombres de color con el locale', () => {
    const en = adaptarProductoListado(PRODUCTO_LISTADO, 'en');
    expect(en.colores[0].nombre).toBe('Night blue');
    expect(en.colores[1].nombre).toBe('Negro'); // sin traducir → cae al base
  });

  it('marca agotado con in_stock: false', () => {
    expect(adaptado.agotado).toBe(false);
    expect(adaptarProductoListado({ ...PRODUCTO_LISTADO, in_stock: false }, 'es').agotado).toBe(true);
  });

  it('oculta el precio en las piezas bajo petición', () => {
    const atelier = adaptarProductoListado({ ...PRODUCTO_LISTADO, sale_mode: 'on_request' }, 'es');
    expect(atelier.ocultarPrecio).toBe(true);
    expect(atelier.precio).toBe('');
  });
});

describe('adaptarProductoFicha', () => {
  const ficha = adaptarProductoFicha(PRODUCTO_FICHA, 'es');

  it('aplana las tallas de todos los colorways, ordenadas por position', () => {
    expect(ficha.tallas).toEqual(['34', '36']);
  });

  it('una talla está disponible si lo está en algún color', () => {
    // 36 está agotada en azul (in_stock: false) pero disponible en negro.
    expect(ficha.tallasAgotadas).toEqual([]);
  });

  it('marca agotada la talla que no lo está en ningún color', () => {
    const sinNegro = adaptarProductoFicha({ ...PRODUCTO_FICHA, colorways: [PRODUCTO_FICHA.colorways[0]] }, 'es');
    expect(sinNegro.tallasAgotadas).toEqual(['36']);
  });

  it('junta las imágenes del producto y de los colorways sin duplicar', () => {
    expect(ficha.imagenes).toEqual(['http://localhost:8001/media/a.webp', 'http://localhost:8001/media/b.webp']);
  });

  it('usa la descripción localizada', () => {
    expect(adaptarProductoFicha(PRODUCTO_FICHA, 'en').descripcion).toBe('A description');
  });
});

describe('variantePorColorYTalla', () => {
  const ficha = adaptarProductoFicha(PRODUCTO_FICHA, 'es');

  it('resuelve el UUID de la variante desde el color y la talla de los selectores', () => {
    // Es lo que hace posible el carrito de servidor: POST /cart/ quiere el UUID.
    expect(variantePorColorYTalla(ficha, 'Azul noche', '34')?.id).toBe('v-azu-34');
    expect(variantePorColorYTalla(ficha, 'Negro', '36')?.id).toBe('v-neg-36');
  });

  it('devuelve la variante aunque esté sin stock, con hayStock: false', () => {
    // No existir y estar agotada son cosas distintas: el mensaje al usuario cambia.
    const variante = variantePorColorYTalla(ficha, 'Azul noche', '36');
    expect(variante.id).toBe('v-azu-36');
    expect(variante.hayStock).toBe(false);
    expect(variante.disponibles).toBe(0);
  });

  it('devuelve null si la combinación no existe', () => {
    expect(variantePorColorYTalla(ficha, 'Negro', '34')).toBeNull();
  });

  it('devuelve null sin talla elegida', () => {
    expect(variantePorColorYTalla(ficha, 'Azul noche', null)).toBeNull();
  });

  it('sin color usa el primer colorway', () => {
    expect(variantePorColorYTalla(ficha, null, '34')?.id).toBe('v-azu-34');
  });
});

describe('tallasDeColor', () => {
  const ficha = adaptarProductoFicha(PRODUCTO_FICHA, 'es');

  it('acota las tallas al color elegido', () => {
    expect(tallasDeColor(ficha, 'Negro')).toEqual({ tallas: ['36'], agotadas: [] });
  });

  it('marca las agotadas de ese color concreto', () => {
    expect(tallasDeColor(ficha, 'Azul noche')).toEqual({ tallas: ['34', '36'], agotadas: ['36'] });
  });
});

describe('adaptarPaginaProductos', () => {
  it('traduce count/next a total/hayMas', () => {
    const pagina = { count: 8, next: 'http://.../?page=2', previous: null, results: [PRODUCTO_LISTADO] };
    const adaptada = adaptarPaginaProductos(pagina, 'es');

    expect(adaptada.total).toBe(8);
    expect(adaptada.hayMas).toBe(true);
    expect(adaptada.productos).toHaveLength(1);
  });

  it('la última página no tiene "hayMas"', () => {
    expect(adaptarPaginaProductos({ count: 1, next: null, results: [] }).hayMas).toBe(false);
  });
});

describe('adaptarCarrito', () => {
  const CARRITO = {
    id: 'e51c1d98-5aaf-4078-9c0d-7b507888b912',
    items: [
      {
        id: '4649e16f-e171-4dfd-9813-532b07f8a327',
        variant: '71ce6be4-1f3b-4c26-93bb-588c78bf0c77',
        quantity: 2,
        sku: 'CH-1265-AZU',
        product_name: 'Prueba',
        product_slug: 'prueba-ch-1265',
        color_name: 'Azul noche',
        size_code: '34',
        image: 'http://localhost:8001/media/a.webp',
        unit_price_net: '200.00',
        unit_price_gross: '242.00',
        line_gross: '484.00',
        has_stock: true,
        available: 50,
      },
    ],
    totals: {
      subtotal_net: '400.00',
      shipping_net: '0.00',
      vat_rate: '0.21',
      vat_total: '84.00',
      total_gross: '484.00',
      currency: 'EUR',
    },
    has_stock_issues: false,
  };

  const adaptado = adaptarCarrito(CARRITO);

  it('da a LineaCarrito las props que ya espera', () => {
    const [linea] = adaptado.lineas;
    expect(linea.nombre).toBe('Prueba');
    expect(linea.talla).toBe('34');
    expect(linea.color).toBe('Azul noche');
    expect(linea.cantidad).toBe(2);
    expect(linea.precio).toContain('242,00');
  });

  it('el id de la línea es el del CartItem, no el de la variante', () => {
    // PATCH/DELETE /cart/items/{id}/ quiere el del CartItem: confundirlos da un 404.
    const [linea] = adaptado.lineas;
    expect(linea.id).toBe('4649e16f-e171-4dfd-9813-532b07f8a327');
    expect(linea.variantId).toBe('71ce6be4-1f3b-4c26-93bb-588c78bf0c77');
  });

  it('usa los totales del backend sin recalcular el IVA', () => {
    expect(adaptado.totales.total).toContain('484,00');
    expect(adaptado.totales.iva).toContain('84,00');
  });

  it('suma la cantidad total para el contador del Navbar', () => {
    expect(adaptado.cantidadTotal).toBe(2);
  });

  it('un carrito nuevo (id null) se adapta como vacío sin romper', () => {
    const vacio = adaptarCarrito({ id: null, items: [], totals: { total_gross: '0.00', currency: 'EUR' } });
    expect(vacio.vacio).toBe(true);
    expect(vacio.cantidadTotal).toBe(0);
    expect(vacio.id).toBeNull();
  });

  it('null (backend caído) se adapta como carrito vacío, no lanza', () => {
    expect(adaptarCarrito(null).vacio).toBe(true);
  });

  it('propaga has_stock_issues para poder avisar en la interfaz', () => {
    expect(adaptarCarrito({ ...CARRITO, has_stock_issues: true }).hayProblemasDeStock).toBe(true);
  });

  it('conserva available y has_stock por línea', () => {
    const linea = adaptarLineaCarrito(CARRITO.items[0]);
    expect(linea.disponibles).toBe(50);
    expect(linea.hayStock).toBe(true);
  });
});
