/**
 * Casos límite del carrito de servidor.
 *
 * Se prueban contra la capa de API y los adapters (no montando React): es donde vive la
 * lógica que puede romperse en silencio. Cada caso corresponde a uno de los que tienen
 * que quedar cubiertos: sin stock, cantidad por encima del disponible, fusión al iniciar
 * sesión, backend caído, y pieza de solo consulta.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { apiFetch, _resetCsrf } from '../client';
import { ApiError } from '../errors';
import { CLAVE_CART_ID } from '../cartId';
import { adaptarCarrito } from '../adapters/cart';
import { adaptarProductoFicha, variantePorColorYTalla } from '../adapters/product';

function respuesta(cuerpo, { status = 200, ok = true } = {}) {
  return { ok, status, json: async () => cuerpo };
}

function localStorageFalso(inicial = {}) {
  const datos = { ...inicial };
  return {
    getItem: (c) => (c in datos ? datos[c] : null),
    setItem: (c, v) => { datos[c] = String(v); },
    removeItem: (c) => { delete datos[c]; },
    _datos: datos,
  };
}

function conNavegador(storage = localStorageFalso()) {
  globalThis.window = { localStorage: storage };
  return storage;
}

/** Respuesta de error del backend, con su shape uniforme. */
function errorBackend(code, message, details = {}, status = 400) {
  return respuesta({ error: { code, message, details } }, { status, ok: false });
}

const PRODUCTO = {
  id: 'p1',
  slug: 'vestido-aria-ve-120',
  name: 'Vestido Aria',
  name_en: '',
  sale_mode: 'in_stock',
  price_gross: '350.90',
  effective_price_gross: '350.90',
  is_on_sale: false,
  in_stock: true,
  colors: [],
  colorways: [
    {
      id: 'cw1',
      sku: 'VE-120-NEG',
      color: { id: 'c1', code: 'NEG', name: 'Negro', name_en: '', hex_value: '#111' },
      images: [],
      variants: [
        { id: 'v-neg-36', size: { id: 's36', code: '36', position: 1 }, available: 2, in_stock: true },
        { id: 'v-neg-38', size: { id: 's38', code: '38', position: 2 }, available: 0, in_stock: false },
      ],
    },
  ],
  images: [],
  categories: [],
};

describe('resolver la variante antes de añadir', () => {
  const ficha = adaptarProductoFicha(PRODUCTO, 'es');

  it('la talla agotada existe pero se marca sin stock', () => {
    // Distinguirlo importa: el mensaje al usuario no es el mismo que "no existe".
    const variante = variantePorColorYTalla(ficha, 'Negro', '38');
    expect(variante.id).toBe('v-neg-38');
    expect(variante.hayStock).toBe(false);
    expect(variante.disponibles).toBe(0);
  });

  it('una combinación inexistente devuelve null', () => {
    expect(variantePorColorYTalla(ficha, 'Negro', '44')).toBeNull();
  });

  it('expone cuántas unidades quedan, para poder topar la cantidad', () => {
    expect(variantePorColorYTalla(ficha, 'Negro', '36').disponibles).toBe(2);
  });
});

describe('pieza de solo consulta (sale_mode: on_request)', () => {
  it('se marca soloConsulta y no tiene precio', () => {
    // No entra al carrito: va por consulta. La ficha no debe ofrecer el botón siquiera.
    const ficha = adaptarProductoFicha({ ...PRODUCTO, sale_mode: 'on_request', enquiry_only: true }, 'es');
    expect(ficha.soloConsulta).toBe(true);
    expect(ficha.precio).toBe('');
    expect(ficha.ocultarPrecio).toBe(true);
  });
});

describe('añadir al carrito — casos límite', () => {
  beforeEach(() => {
    _resetCsrf();
    conNavegador();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8001';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete globalThis.window;
  });

  it('variante sin stock: mensaje claro del backend, no un 500 mudo', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(respuesta({ csrf_token: 'T' }))
      .mockResolvedValueOnce(
        errorBackend('invalid', 'Request failed.', { variant: ['No quedan unidades disponibles.'] })
      );

    const error = await apiFetch('/cart/', {
      method: 'POST',
      body: { variant: 'v-neg-38', quantity: 1 },
      conCarrito: true,
    }).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.isValidationError).toBe(true);
    // Lo que se le enseña al usuario es el motivo real, no "Request failed.".
    expect(error.firstDetail).toBe('No quedan unidades disponibles.');
    expect(error.status).toBe(400);
  });

  it('cantidad por encima del stock: el backend lo rechaza con el tope', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(respuesta({ csrf_token: 'T' }))
      .mockResolvedValueOnce(
        errorBackend('invalid', 'Request failed.', { quantity: ['Solo quedan 2 unidades.'] })
      );

    const error = await apiFetch('/cart/', {
      method: 'POST',
      body: { variant: 'v-neg-36', quantity: 5 },
      conCarrito: true,
    }).catch((e) => e);

    expect(error.firstDetail).toBe('Solo quedan 2 unidades.');
  });

  it('backend caído: ApiError de red, la web no puede quedarse en blanco', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('fetch failed'));

    const error = await apiFetch('/cart/', { conCarrito: true }).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.isNetworkError).toBe(true);
    // El contexto adapta null a carrito vacío: el resto del sitio sigue en pie.
    expect(adaptarCarrito(null).vacio).toBe(true);
    expect(adaptarCarrito(null).cantidadTotal).toBe(0);
  });

  it('el primer POST devuelve el id y se persiste para las siguientes peticiones', async () => {
    // El GET no crea carrito (devuelve id: null): el id nace en el primer POST y llega en
    // el CUERPO, no en una cabecera.
    const storage = conNavegador();
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(respuesta({ csrf_token: 'T' }))
      .mockResolvedValueOnce(respuesta({ id: 'CARRITO-1', items: [], totals: { currency: 'EUR' } }));

    await apiFetch('/cart/', { method: 'POST', body: {}, conCarrito: true });

    expect(storage._datos[CLAVE_CART_ID]).toBe('CARRITO-1');
  });
});

describe('carrito con líneas que perdieron stock', () => {
  const CARRITO_CON_PROBLEMA = {
    id: 'c1',
    items: [
      {
        id: 'item-1',
        variant: 'v-neg-36',
        quantity: 3,
        sku: 'VE-120-NEG',
        product_name: 'Vestido Aria',
        product_slug: 'vestido-aria-ve-120',
        color_name: 'Negro',
        size_code: '36',
        image: null,
        unit_price_net: '290.00',
        unit_price_gross: '350.90',
        line_gross: '1052.70',
        has_stock: false,
        available: 2,
      },
    ],
    totals: {
      subtotal_net: '870.00',
      shipping_net: '0.00',
      vat_rate: '0.21',
      vat_total: '182.70',
      total_gross: '1052.70',
      currency: 'EUR',
    },
    has_stock_issues: true,
  };

  const adaptado = adaptarCarrito(CARRITO_CON_PROBLEMA);

  it('propaga has_stock_issues para avisar antes del checkout', () => {
    expect(adaptado.hayProblemasDeStock).toBe(true);
  });

  it('la línea sabe que no hay stock y cuántas quedan', () => {
    expect(adaptado.lineas[0].hayStock).toBe(false);
    expect(adaptado.lineas[0].disponibles).toBe(2);
  });

  it('los totales salen del backend, sin recalcular el IVA', () => {
    // 870 neto + 21% = 1052.70. Si el frontend lo recalculara, cualquier redondeo propio
    // divergiría del importe que se cobra.
    expect(adaptado.totales.total).toContain('1052,70');
    expect(adaptado.totales.iva).toContain('182,70');
  });
});

describe('fusión del carrito de invitado al iniciar sesión', () => {
  beforeEach(() => {
    _resetCsrf();
    conNavegador(localStorageFalso({ [CLAVE_CART_ID]: 'CARRITO-INVITADO' }));
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8001';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete globalThis.window;
  });

  it('el login manda el cart_id para que el backend fusione', async () => {
    // La fusión la hace el BACKEND (_adopt_guest_cart -> merge_carts en
    // apps/orders/services.py): suma cantidades sin pasarse del stock y descarta lo
    // agotado. El frontend solo tiene que mandar el id; no fusiona nada por su cuenta.
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(respuesta({ csrf_token: 'T' }))
      .mockResolvedValueOnce(respuesta({ id: 'u1', email: 'a@b.c' }));
    globalThis.fetch = fetchMock;

    const { iniciarSesion } = await import('../auth');
    await iniciarSesion({ email: 'a@b.c', password: 'x' }, 'CARRITO-INVITADO');

    const [, opciones] = fetchMock.mock.calls[1];
    expect(JSON.parse(opciones.body).cart_id).toBe('CARRITO-INVITADO');
    // Y además va la cabecera, que es la otra vía que acepta el backend.
    expect(opciones.headers['X-Cart-Id']).toBe('CARRITO-INVITADO');
  });
});

describe('checkout — pedido creado sin pasarela', () => {
  const RESPUESTA = {
    order: {
      id: 'o1',
      reference: 'FC-001006',
      created_at: '2026-09-08T20:00:00Z',
      email: 'cliente@ejemplo.com',
      phone: '600000000',
      shipping_recipient: 'Cliente Prueba',
      shipping_line1: 'Calle Falsa 123',
      shipping_line2: '',
      shipping_postal_code: '28001',
      shipping_city: 'Madrid',
      shipping_province: 'Madrid',
      shipping_country: 'ES',
      subtotal_net: '200.00',
      shipping_net: '0.00',
      vat_rate: '0.21',
      vat_total: '42.00',
      total_gross: '242.00',
      currency: 'EUR',
      is_paid: false,
      paid_at: null,
      can_be_returned: false,
      invoice_requested: false,
      customer_note: '',
      access_token: 'secreto-del-comprador',
      lines: [
        {
          id: 'l1',
          product_name: 'Prueba',
          sku: 'CH-1265-AZU',
          size_code: '34',
          color_name: 'Azul noche',
          image: null,
          quantity: 1,
          unit_price_gross: '242.00',
          line_gross: '242.00',
        },
      ],
    },
    // Stripe sin configurar: el pedido se crea igual y el stock queda reservado.
    payment: null,
  };

  it('adapta el pedido con la referencia y los totales del backend', async () => {
    const { adaptarPedido } = await import('../adapters/order');
    const pedido = adaptarPedido(RESPUESTA.order);

    expect(pedido.referencia).toBe('FC-001006');
    expect(pedido.totales.total).toContain('242,00');
    expect(pedido.totales.iva).toContain('42,00');
    expect(pedido.lineas).toHaveLength(1);
    expect(pedido.lineas[0].talla).toBe('34');
  });

  it('el pedido NO se da por pagado al crearlo', async () => {
    // Eso lo confirma el webhook de Stripe. Con `payment: null` se queda pendiente,
    // que es lo correcto: nada aquí finge un cobro.
    const { adaptarPedido } = await import('../adapters/order');
    expect(adaptarPedido(RESPUESTA.order).pagado).toBe(false);
    expect(RESPUESTA.payment).toBeNull();
  });

  it('conserva el access_token, que es el secreto de seguimiento del comprador', async () => {
    const { adaptarPedido } = await import('../adapters/order');
    expect(adaptarPedido(RESPUESTA.order).tokenAcceso).toBe('secreto-del-comprador');
  });

  it('el checkout con carrito vacío da un ApiError con code cart_empty', async () => {
    _resetCsrf();
    conNavegador();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8001';
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(respuesta({ csrf_token: 'T' }))
      .mockResolvedValueOnce(errorBackend('cart_empty', 'El carrito está vacío.', {}, 409));

    const error = await apiFetch('/checkout/', { method: 'POST', body: {}, conCarrito: true }).catch((e) => e);

    expect(error.code).toBe('cart_empty');
    delete globalThis.window;
  });
});
