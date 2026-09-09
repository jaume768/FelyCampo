'use client';

/**
 * Contadores del sidebar: cuántas cosas están esperando a alguien.
 *
 * Eran números FIJOS escritos en el propio menú (`nuevos: 3`, `nuevos: 2`): salía un 3
 * junto a «Pedidos» con un solo pedido en la base de datos. Un contador que miente es
 * peor que no tener contador — se aprende a ignorarlo, y el día que hay algo de verdad
 * tampoco se mira.
 *
 * «Pendiente» es lo que exige una acción del equipo, no todo lo que existe: un pedido
 * pagado o en preparación (todavía sin enviar) y una consulta de precio sin responder.
 * Los enviados y entregados no cuentan: ya no hay nada que hacer con ellos.
 */

import { useCallback, useEffect, useState } from 'react';

import { listarPedidos } from '@/lib/api/adminOrders';
import { ApiError } from '@/lib/api/errors';

/** Estados de pedido que siguen esperando algo del equipo. */
const ESTADOS_PENDIENTES = ['paid', 'processing'];

/** Cada cuánto se refresca, en ms. El sidebar está siempre en pantalla. */
const INTERVALO_MS = 60_000;

export function useAvisosAdmin() {
  const [pedidosPendientes, setPedidosPendientes] = useState(null);

  const cargar = useCallback(async () => {
    try {
      // `page_size: 1` porque solo interesa `count`: no hace falta traerse los pedidos
      // para contarlos.
      const paginas = await Promise.all(
        ESTADOS_PENDIENTES.map((status) => listarPedidos({ status, page_size: 1 }))
      );
      setPedidosPendientes(paginas.reduce((total, p) => total + (p?.count ?? 0), 0));
    } catch (error) {
      // Sin sesión de staff todavía, o backend caído: no se enseña contador. Un fallo
      // aquí no puede tumbar el menú.
      if (!(error instanceof ApiError)) throw error;
      setPedidosPendientes(null);
    }
  }, []);

  useEffect(() => {
    cargar();
    const temporizador = setInterval(cargar, INTERVALO_MS);
    return () => clearInterval(temporizador);
  }, [cargar]);

  return { pedidosPendientes, recargar: cargar };
}
