/**
 * Renderiza de verdad el formulario de producto.
 *
 * POR QUÉ EXISTE: ni `npm run build` ni los tests unitarios cazan los errores de
 * EJECUCIÓN de un componente cliente que solo se monta al pulsar algo.
 *
 * Abrir «Añadir producto» reventaba con «Cannot access 'tipo' before initialization» —un
 * hook leía una variable declarada más abajo—, y aun así el build salía en verde y los
 * 114 tests pasaban. Solo se veía en el navegador, como «This page couldn't load».
 *
 * Con un render real, ese fallo sale aquí.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';

import FormularioProducto from '../FormularioProducto';
import { ToastProvider } from '../Toast';
import { CategoriasProvider } from '../Categorias';

// Los hooks piden a la API al montar: aquí no se toca la red.
beforeEach(() => {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: { getSetCookie: () => [] },
    json: async () => ({ results: [], count: 0 }),
  });
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
  usePathname: () => '/admin/productos',
  useSearchParams: () => new URLSearchParams(),
  notFound: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => Object.assign((clave) => clave, { rich: (clave) => clave }),
  useLocale: () => 'es',
}));

/** El formulario necesita los dos providers del panel para montarse. */
function montar(props = {}) {
  return renderToString(
    <CategoriasProvider>
      <ToastProvider>
        <FormularioProducto onGuardado={() => {}} {...props} />
      </ToastProvider>
    </CategoriasProvider>
  );
}

describe('el formulario de producto se monta sin reventar', () => {
  it('alta desde cero, sin tipo preseleccionado', () => {
    expect(() => montar()).not.toThrow();
  });

  it('con el tipo fijado por la ruta (/admin/productos/pret-a-porter)', () => {
    expect(() => montar({ tipoInicial: 'pret-a-porter' })).not.toThrow();
  });

  it('en atelier, donde las familias se filtran distinto', () => {
    expect(() => montar({ tipoInicial: 'atelier' })).not.toThrow();
  });

  it('editando un producto existente', () => {
    expect(() => montar({
      productoExistente: {
        id: 'p1',
        nombre: 'Vestido Aria',
        tipo: 'pret-a-porter',
        estado: 'Activo',
        precio: '290.00',
        imagenes: [],
        tallas: [],
        colorIds: [],
      },
    })).not.toThrow();
  });
});
