import { describe, it, expect } from 'vitest';

import {
  ESTADOS_PEDIDO, SECUENCIA_ESTADOS, ESTADOS_DE_CIERRE, ESTADOS_MANUALES,
  admiteCambioManual, estadoPedido, adaptarPedidoAdmin, filtrosPedidosAdmin,
} from '../adminOrders';
import { adaptarVarianteStock, nivelStock, adaptarUbicacion } from '../adminStock';

describe('los ocho estados reales de Order.status', () => {
  it('están los ocho, ni más ni menos', () => {
    expect(Object.keys(ESTADOS_PEDIDO)).toHaveLength(8);
  });

  it('incluye los reembolsos, que antes no tenían sitio en la interfaz', () => {
    expect(ESTADOS_PEDIDO.refunded.etiqueta).toBe('Reembolsado');
    expect(ESTADOS_PEDIDO.partially_refunded.etiqueta).toBe('Reembolsado parcialmente');
  });

  it('NO existe un "pago fallido": un pago que no llega deja el pedido pendiente', () => {
    const etiquetas = Object.values(ESTADOS_PEDIDO).map((e) => e.etiqueta.toLowerCase());
    expect(etiquetas.some((e) => e.includes('fallido'))).toBe(false);
  });

  it('la secuencia no incluye los estados de cierre: son una salida, no un paso', () => {
    for (const cierre of ESTADOS_DE_CIERRE) {
      expect(SECUENCIA_ESTADOS).not.toContain(cierre);
    }
  });

  it('un status desconocido no revienta', () => {
    expect(estadoPedido('inventado').etiqueta).toBe('inventado');
    expect(estadoPedido(undefined).etiqueta).toBe('—');
  });
});

describe('qué se puede cambiar a mano', () => {
  it('solo preparación, enviado y entregado', () => {
    // MANUALLY_SETTABLE_STATUSES en apps/orders/services.py.
    expect(ESTADOS_MANUALES).toEqual(['processing', 'shipped', 'delivered']);
  });

  it('un pedido pendiente de pago NO admite cambio manual', () => {
    // Comprobado contra la API: devuelve 409 invalid_status_target — lo confirma Stripe.
    expect(admiteCambioManual('pending_payment')).toBe(false);
  });

  it('un pedido pagado sí, y también los del propio tramo', () => {
    expect(admiteCambioManual('paid')).toBe(true);
    expect(admiteCambioManual('shipped')).toBe(true);
  });

  it('cancelado y reembolsado ya no se tocan a mano', () => {
    expect(admiteCambioManual('cancelled')).toBe(false);
    expect(admiteCambioManual('refunded')).toBe(false);
  });
});

describe('adaptarPedidoAdmin', () => {
  const PEDIDO = {
    id: 'o1',
    reference: 'FC-001006',
    number: 1006,
    created_at: '2026-09-08T10:00:00Z',
    status: 'cancelled',
    email: 'cliente@ejemplo.com',
    shipping_recipient: 'Cliente Prueba',
    user: null,
    is_paid: false,
    is_delayed: true,
    currency: 'EUR',
    subtotal_net: '200.00',
    shipping_net: '0.00',
    vat_total: '42.00',
    total_gross: '242.00',
    lines: [{ id: 'l1', product_name: 'Prueba', sku: 'CH-1', size_code: '34', color_name: 'Azul', quantity: 2, unit_price_gross: '121.00', line_gross: '242.00' }],
  };

  const p = adaptarPedidoAdmin(PEDIDO);

  it('marca la compra sin cuenta como invitado, que es un caso normal', () => {
    expect(p.esInvitado).toBe(true);
  });

  it('traduce el estado y lo reconoce como cierre', () => {
    expect(p.estadoEtiqueta).toBe('Cancelado');
    expect(p.esDeCierre).toBe(true);
  });

  it('usa los totales del backend sin recalcular el IVA', () => {
    expect(p.totales.total).toContain('242,00');
    expect(p.totales.iva).toContain('42,00');
  });

  it('el retraso lo dice el backend, no se recalcula por fecha', () => {
    expect(p.conRetraso).toBe(true);
  });
});

describe('filtrosPedidosAdmin', () => {
  it('pagina en servidor y no manda "Todos" como filtro', () => {
    expect(filtrosPedidosAdmin({ status: 'Todos' })).toEqual({ page: 1, page_size: 20 });
  });

  it('pasa búsqueda y estado', () => {
    expect(filtrosPedidosAdmin({ busqueda: 'FC-1', status: 'shipped' })).toEqual({
      page: 1, page_size: 20, search: 'FC-1', status: 'shipped',
    });
  });
});

describe('stock', () => {
  const VARIANTE = {
    id: 'v1',
    colorway_detail: { id: 'cw1', sku: 'CH-210-NEG', color_name: 'Negro', product_id: 'p1', product_name: 'Chaqueta Duna' },
    size_detail: { id: 's1', code: '34', position: 0 },
    stock: 10,
    reserved: 3,
    available: 7,
    in_stock: true,
    is_active: true,
    levels: [
      { location_id: 'loc1', location_name: 'Almacén principal', location_kind: 'warehouse', is_sellable: true, is_active: true, quantity: 10 },
    ],
  };

  const v = adaptarVarianteStock(VARIANTE);

  it('distingue físico, reservado y disponible', () => {
    // Confundirlos es el error clásico: lo vendible es `available`, no `stock`.
    expect(v.fisico).toBe(10);
    expect(v.reservado).toBe(3);
    expect(v.disponible).toBe(7);
  });

  it('lee el colorway aplanado que devuelve este endpoint', () => {
    expect(v.producto).toBe('Chaqueta Duna');
    expect(v.color).toBe('Negro');
    expect(v.sku).toBe('CH-210-NEG');
  });

  it('el desglose por ubicación se identifica por la ubicación, no por un id propio', () => {
    expect(v.ubicaciones[0].ubicacionId).toBe('loc1');
    expect(v.ubicaciones[0].vendible).toBe(true);
  });

  it('el semáforo mira lo disponible, no lo físico', () => {
    expect(nivelStock(0)).toBe('agotado');
    expect(nivelStock(3)).toBe('bajo');
    expect(nivelStock(7)).toBe('ok');
  });

  it('adapta la ubicación', () => {
    const l = adaptarUbicacion({ id: 'l1', code: 'ALM01', name: 'Almacén principal', kind: 'warehouse', is_sellable: true, is_active: true, position: 1 });
    expect(l.nombre).toBe('Almacén principal');
    expect(l.vendible).toBe(true);
  });
});
