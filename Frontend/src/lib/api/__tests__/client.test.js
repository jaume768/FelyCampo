import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { apiFetch, construirQuery, baseUrl, _resetCsrf } from '../client';
import { ApiError, CODIGOS_ERROR } from '../errors';
import { CLAVE_CART_ID } from '../cartId';

/** Respuesta de fetch mínima y creíble. */
function respuesta(cuerpo, { status = 200, ok = true } = {}) {
  return {
    ok,
    status,
    json: async () => {
      if (cuerpo === undefined) throw new SyntaxError('sin cuerpo');
      return cuerpo;
    },
  };
}

/** localStorage falso: el módulo cartId solo usa get/set/removeItem. */
function localStorageFalso(inicial = {}) {
  const datos = { ...inicial };
  return {
    getItem: (clave) => (clave in datos ? datos[clave] : null),
    setItem: (clave, valor) => {
      datos[clave] = String(valor);
    },
    removeItem: (clave) => {
      delete datos[clave];
    },
    _datos: datos,
  };
}

/** Simula "estamos en el navegador" definiendo window. */
function conNavegador(storage = localStorageFalso()) {
  globalThis.window = { localStorage: storage };
  return storage;
}

describe('baseUrl', () => {
  const entornoOriginal = { ...process.env };

  afterEach(() => {
    process.env = { ...entornoOriginal };
    delete globalThis.window;
  });

  it('en servidor usa API_INTERNAL_URL (la red interna de Docker)', () => {
    delete globalThis.window;
    process.env.API_INTERNAL_URL = 'http://backend:8000';
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8001';
    expect(baseUrl()).toBe('http://backend:8000');
  });

  it('en navegador usa NEXT_PUBLIC_API_URL, nunca la interna', () => {
    conNavegador();
    process.env.API_INTERNAL_URL = 'http://backend:8000';
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8001';
    // http://backend:8000 no lo resuelve ningún navegador: sería un fallo de red.
    expect(baseUrl()).toBe('http://localhost:8001');
  });

  it('quita la barra final para no generar rutas con //', () => {
    delete globalThis.window;
    process.env.API_INTERNAL_URL = 'http://backend:8000/';
    expect(baseUrl()).toBe('http://backend:8000');
  });
});

describe('construirQuery', () => {
  it('omite null, undefined y cadena vacía', () => {
    expect(construirQuery({ a: 1, b: null, c: undefined, d: '' })).toBe('?a=1');
  });

  it('repite la clave en los arrays (lo que espera django-filter)', () => {
    expect(construirQuery({ size: ['36', '38'] })).toBe('?size=36&size=38');
  });

  it('sin params devuelve cadena vacía, no "?"', () => {
    expect(construirQuery()).toBe('');
    expect(construirQuery({})).toBe('');
  });
});

describe('apiFetch — CSRF', () => {
  beforeEach(() => {
    _resetCsrf();
    conNavegador();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8001';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete globalThis.window;
  });

  it('no pide token en una lectura', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuesta({ ok: true }));
    globalThis.fetch = fetchMock;

    await apiFetch('/catalog/products/');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].headers['X-CSRFToken']).toBeUndefined();
  });

  it('pide el token antes de la primera escritura y lo manda como X-CSRFToken', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(respuesta({ csrf_token: 'TOKEN-123' }))
      .mockResolvedValueOnce(respuesta({ id: 'c1' }));
    globalThis.fetch = fetchMock;

    await apiFetch('/cart/', { method: 'POST', body: { variant: 'v1' } });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toContain('/auth/csrf/');
    expect(fetchMock.mock.calls[1][1].headers['X-CSRFToken']).toBe('TOKEN-123');
  });

  it('cachea el token: la segunda escritura no vuelve a pedirlo', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(respuesta({ csrf_token: 'TOKEN-123' }))
      .mockResolvedValue(respuesta({ id: 'c1' }));
    globalThis.fetch = fetchMock;

    await apiFetch('/cart/', { method: 'POST', body: {} });
    await apiFetch('/cart/', { method: 'POST', body: {} });

    const llamadasCsrf = fetchMock.mock.calls.filter(([url]) => url.includes('/auth/csrf/'));
    expect(llamadasCsrf).toHaveLength(1);
  });

  it('no intenta leer la cookie CSRF con document.cookie', async () => {
    // En producción el panel vive en otro subdominio y la cookie no es legible: el token
    // SIEMPRE sale del cuerpo JSON de /auth/csrf/.
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(respuesta({ csrf_token: 'DEL-CUERPO' }))
      .mockResolvedValueOnce(respuesta({}));
    globalThis.fetch = fetchMock;
    globalThis.document = { get cookie() { throw new Error('document.cookie no se toca'); } };

    await expect(apiFetch('/cart/', { method: 'POST', body: {} })).resolves.toBeDefined();
    expect(fetchMock.mock.calls[1][1].headers['X-CSRFToken']).toBe('DEL-CUERPO');

    delete globalThis.document;
  });

  it('siempre manda credentials: include (sesión por cookie)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuesta({}));
    globalThis.fetch = fetchMock;

    await apiFetch('/catalog/products/');

    expect(fetchMock.mock.calls[0][1].credentials).toBe('include');
  });
});

describe('apiFetch — X-Cart-Id', () => {
  beforeEach(() => {
    _resetCsrf();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8001';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete globalThis.window;
  });

  it('manda la cabecera con el id guardado', async () => {
    conNavegador(localStorageFalso({ [CLAVE_CART_ID]: 'CART-42' }));
    const fetchMock = vi.fn().mockResolvedValue(respuesta({ id: 'CART-42', items: [] }));
    globalThis.fetch = fetchMock;

    await apiFetch('/cart/', { conCarrito: true });

    expect(fetchMock.mock.calls[0][1].headers['X-Cart-Id']).toBe('CART-42');
  });

  it('no manda la cabecera si no hay id guardado', async () => {
    conNavegador();
    const fetchMock = vi.fn().mockResolvedValue(respuesta({ id: null, items: [] }));
    globalThis.fetch = fetchMock;

    await apiFetch('/cart/', { conCarrito: true });

    expect(fetchMock.mock.calls[0][1].headers['X-Cart-Id']).toBeUndefined();
  });

  it('persiste el id nuevo que llega en el CUERPO de la respuesta', async () => {
    // El backend NO devuelve el id en una cabecera: viene en el JSON, y nace en el primer
    // POST (el GET devuelve id: null a propósito).
    const storage = conNavegador();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(respuesta({ csrf_token: 'T' }))
      .mockResolvedValueOnce(respuesta({ id: 'CART-NUEVO', items: [] }));
    globalThis.fetch = fetchMock;

    await apiFetch('/cart/', { method: 'POST', body: {}, conCarrito: true });

    expect(storage._datos[CLAVE_CART_ID]).toBe('CART-NUEVO');
  });

  it('no guarda nada cuando el carrito viene con id null', async () => {
    const storage = conNavegador();
    globalThis.fetch = vi.fn().mockResolvedValue(respuesta({ id: null, items: [] }));

    await apiFetch('/cart/', { conCarrito: true });

    expect(storage._datos[CLAVE_CART_ID]).toBeUndefined();
  });

  it('no manda X-Cart-Id si no se pide conCarrito', async () => {
    conNavegador(localStorageFalso({ [CLAVE_CART_ID]: 'CART-42' }));
    const fetchMock = vi.fn().mockResolvedValue(respuesta({}));
    globalThis.fetch = fetchMock;

    await apiFetch('/catalog/products/');

    expect(fetchMock.mock.calls[0][1].headers['X-Cart-Id']).toBeUndefined();
  });

  it('sobrevive a un localStorage que lanza (modo privado)', async () => {
    globalThis.window = {
      localStorage: {
        getItem: () => { throw new Error('bloqueado'); },
        setItem: () => { throw new Error('bloqueado'); },
        removeItem: () => {},
      },
    };
    globalThis.fetch = vi.fn().mockResolvedValue(respuesta({ id: 'X', items: [] }));

    await expect(apiFetch('/cart/', { conCarrito: true })).resolves.toBeDefined();
  });
});

describe('apiFetch — normalización de errores', () => {
  beforeEach(() => {
    _resetCsrf();
    delete globalThis.window;
    process.env.API_INTERNAL_URL = 'http://backend:8000';
  });

  afterEach(() => vi.restoreAllMocks());

  it('traduce {"error":{code,message,details}} a ApiError', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      respuesta(
        { error: { code: 'not_found', message: 'No Product matches the given query.', details: {} } },
        { status: 404, ok: false }
      )
    );

    const error = await apiFetch('/catalog/products/no-existe/').catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe('not_found');
    expect(error.message).toBe('No Product matches the given query.');
    expect(error.status).toBe(404);
    expect(error.isNotFound).toBe(true);
  });

  it('conserva details por campo y expone el primero', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      respuesta(
        {
          error: {
            code: 'invalid',
            message: 'Request failed.',
            details: { variant: ['Clave primaria inválida - objeto no existe.'] },
          },
        },
        { status: 400, ok: false }
      )
    );

    const error = await apiFetch('/cart/', { method: 'POST', body: {} }).catch((e) => e);

    expect(error.details.variant).toEqual(['Clave primaria inválida - objeto no existe.']);
    expect(error.firstDetail).toBe('Clave primaria inválida - objeto no existe.');
    expect(error.isValidationError).toBe(true);
  });

  it('el backend caído da un ApiError de red, no un TypeError suelto', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('fetch failed'));

    const error = await apiFetch('/catalog/products/').catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe(CODIGOS_ERROR.NETWORK);
    expect(error.status).toBe(0);
    expect(error.isNetworkError).toBe(true);
  });

  it('el timeout da code "timeout"', async () => {
    globalThis.fetch = vi.fn().mockImplementation(() => {
      const error = new Error('abortada');
      error.name = 'AbortError';
      return Promise.reject(error);
    });

    const error = await apiFetch('/catalog/products/', { timeoutMs: 5 }).catch((e) => e);

    expect(error.code).toBe(CODIGOS_ERROR.TIMEOUT);
    expect(error.isNetworkError).toBe(true);
  });

  it('una respuesta de error sin JSON válido no revienta el parseo', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(respuesta(undefined, { status: 502, ok: false }));

    const error = await apiFetch('/catalog/products/').catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe(CODIGOS_ERROR.PARSE);
    expect(error.status).toBe(502);
  });

  it('un 204 devuelve null en vez de fallar al parsear', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(respuesta(undefined, { status: 204 }));
    await expect(apiFetch('/cart/items/x/', { method: 'DELETE' })).resolves.toBeNull();
  });
});
