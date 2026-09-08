'use client';

/* ============================================================
   PEDIDO — ficha. DATOS REALES: /api/v1/admin/orders/{id}/.

   El cambio de estado va SIEMPRE contra la API
   (POST .../status/), nunca sobre estado local: el backend valida qué
   transiciones son legales, ajusta el stock comprometido y deja rastro
   en el historial. Si respondiera que no, el panel tiene que enterarse.

   Los OCHO estados reales. La línea de tiempo pinta solo la secuencia
   normal (pendiente → pagado → preparación → enviado → entregado);
   cancelado y los reembolsos NO son un paso más, son una salida, y se
   marcan cortando la línea donde se quedó.
   ============================================================ */

import { use, useCallback, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';

import {
  PageHeader, TablaAdmin, BotonVolver, EstadoTimeline, EstadoPedidoBadge, useToast,
} from '@/components/admin';
import { Boton } from '@/components/ui';
import {
  obtenerPedido, adaptarPedidoAdmin, cambiarEstadoPedido, historialPedido,
  anadirNotaPedido, notasPedido,
  ESTADOS_PEDIDO, SECUENCIA_ESTADOS, ESTADOS_DE_CIERRE, ESTADOS_MANUALES, admiteCambioManual,
} from '@/lib/api/adminOrders';
import { ApiError } from '@/lib/api/errors';
import styles from './page.module.css';

const ETIQUETAS_SECUENCIA = SECUENCIA_ESTADOS.map((s) => ESTADOS_PEDIDO[s].etiqueta);

function fechaLegible(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function DetallePedidoPage({ params }) {
  const { id } = use(params);
  const { mostrarToast } = useToast();

  const [pedido, setPedido] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [notas, setNotas] = useState([]);
  const [notaNueva, setNotaNueva] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [noEncontrado, setNoEncontrado] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await obtenerPedido(id);
      setPedido(adaptarPedidoAdmin(datos));
      // Historial y notas son secundarios: si fallan, la ficha se ve igual.
      const [h, n] = await Promise.allSettled([historialPedido(id), notasPedido(id)]);
      if (h.status === 'fulfilled') setHistorial(h.value || []);
      if (n.status === 'fulfilled') setNotas(n.value || []);
    } catch (fallo) {
      if (!(fallo instanceof ApiError)) throw fallo;
      if (fallo.isNotFound) setNoEncontrado(true);
      else setError(fallo);
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (noEncontrado) notFound();

  async function cambiarEstado(nuevo) {
    setGuardando(true);
    try {
      const datos = await cambiarEstadoPedido(id, nuevo);
      setPedido(adaptarPedidoAdmin(datos));
      setHistorial(await historialPedido(id).catch(() => historial));
      mostrarToast(`Estado actualizado a "${ESTADOS_PEDIDO[nuevo].etiqueta}"`);
    } catch (fallo) {
      if (!(fallo instanceof ApiError)) throw fallo;
      // El backend rechaza las transiciones que no tienen sentido: su motivo es el útil.
      mostrarToast(`No se ha podido cambiar: ${fallo.firstDetail ?? fallo.message}`);
    } finally {
      setGuardando(false);
    }
  }

  async function guardarNota() {
    if (!notaNueva.trim()) return;
    setGuardando(true);
    try {
      await anadirNotaPedido(id, notaNueva.trim());
      setNotas(await notasPedido(id));
      setNotaNueva('');
      mostrarToast('Nota guardada');
    } catch (fallo) {
      if (!(fallo instanceof ApiError)) throw fallo;
      mostrarToast(`No se ha guardado: ${fallo.firstDetail ?? fallo.message}`);
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <div>
        <BotonVolver href="/admin/pedidos" />
        <p className={styles.estado} role="status">Cargando pedido…</p>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div>
        <BotonVolver href="/admin/pedidos" />
        <p className={styles.estado} role="alert">
          {error?.isNetworkError ? 'No hemos podido conectar con el servidor.' : error?.message}
        </p>
        <Boton variante="contorno" onClick={cargar}>Reintentar</Boton>
      </div>
    );
  }

  const indiceSecuencia = SECUENCIA_ESTADOS.indexOf(pedido.status);
  const cerrado = ESTADOS_DE_CIERRE.includes(pedido.status);
  // Un pedido cancelado se quedó donde estuviera; sin dato mejor, se marca al principio.
  const activo = cerrado ? Math.max(0, indiceSecuencia) : indiceSecuencia;
  const puedeCambiarEstado = admiteCambioManual(pedido.status);

  return (
    <div>
      <div className={styles.cabeceraSuperior}>
        <BotonVolver href="/admin/pedidos" />
        {/* Solo el tramo que el backend deja tocar a mano: preparación → enviado →
            entregado, y únicamente si el pedido está pagado. `paid` lo confirma Stripe,
            y los reembolsos salen del flujo de devoluciones. Ofrecer los ocho botones
            sería ofrecer cinco que siempre devuelven 409. */}
        {puedeCambiarEstado ? (
          <div className={styles.estadoSelector}>
            {ESTADOS_MANUALES.map((valor) => {
              const cfg = ESTADOS_PEDIDO[valor];
              const activoBoton = pedido.status === valor;
              return (
                <button
                  key={valor}
                  type="button"
                  className={`${styles.estadoBoton} ${styles[cfg.tono] || ''} ${activoBoton ? styles.estadoBotonActivo : ''}`}
                  aria-pressed={activoBoton}
                  disabled={guardando || activoBoton}
                  onClick={() => cambiarEstado(valor)}
                >
                  {cfg.etiqueta}
                </button>
              );
            })}
          </div>
        ) : (
          <p className={styles.estadoBloqueado}>
            {pedido.status === 'pending_payment'
              ? 'Pendiente de pago: el estado se desbloquea cuando Stripe confirme el cobro.'
              : `Pedido ${pedido.estadoEtiqueta.toLowerCase()}: su estado ya no se cambia a mano.`}
          </p>
        )}
      </div>

      <PageHeader
        titulo={`Pedido ${pedido.referencia}`}
        subtitulo={`${pedido.cliente}${pedido.esInvitado ? ' · compra sin cuenta' : ''}`}
      >
        <EstadoPedidoBadge status={pedido.status} />
      </PageHeader>

      {pedido.conRetraso && (
        <p className={styles.avisoRetraso} role="status">
          Este pedido lleva demasiado tiempo en su estado actual.
        </p>
      )}

      <EstadoTimeline
        pasos={ETIQUETAS_SECUENCIA}
        activo={activo}
        interrumpido={cerrado ? `Pedido ${pedido.estadoEtiqueta.toLowerCase()}.` : undefined}
      />

      <TablaAdmin
        columnas={[
          { clave: 'nombre', etiqueta: 'Artículo', render: (l) => l.nombre },
          { clave: 'sku', etiqueta: 'SKU', render: (l) => l.sku },
          { clave: 'talla', etiqueta: 'Talla', render: (l) => l.talla },
          { clave: 'color', etiqueta: 'Color', render: (l) => l.color },
          { clave: 'cantidad', etiqueta: 'Uds.', render: (l) => l.cantidad },
          { clave: 'precio', etiqueta: 'Precio', render: (l) => l.precio },
          { clave: 'total', etiqueta: 'Total', render: (l) => l.total },
        ]}
        filas={pedido.lineas}
      />

      <div className={styles.totales}>
        <p><span>Subtotal (sin IVA)</span><span>{pedido.totales.subtotalNeto}</span></p>
        <p><span>Envío (sin IVA)</span><span>{pedido.totales.envioNeto}</span></p>
        <p><span>IVA</span><span>{pedido.totales.iva}</span></p>
        {/* Calculado por el backend: aquí no se recalcula nada. */}
        <p className={styles.totalFinal}><span>Total</span><span>{pedido.totales.total}</span></p>
      </div>

      <section className={styles.bloque}>
        <h2 className={styles.bloqueTitulo}>Envío</h2>
        <p className={styles.direccion}>
          {pedido.envio.destinatario}<br />
          {pedido.envio.linea1}{pedido.envio.linea2 ? `, ${pedido.envio.linea2}` : ''}<br />
          {pedido.envio.codigoPostal} {pedido.envio.ciudad} ({pedido.envio.provincia})<br />
          {pedido.email} · {pedido.telefono || 'sin teléfono'}
        </p>
        {pedido.seguimiento ? (
          <p className={styles.seguimiento}>
            {pedido.seguimiento.transportista}: {pedido.seguimiento.codigo}
            {pedido.seguimiento.url && (
              <> · <a href={pedido.seguimiento.url} target="_blank" rel="noopener noreferrer">seguimiento</a></>
            )}
          </p>
        ) : (
          <p className={styles.seguimiento}>Sin código de seguimiento.</p>
        )}
      </section>

      {pedido.notaCliente && (
        <section className={styles.bloque}>
          <h2 className={styles.bloqueTitulo}>Nota del cliente</h2>
          <p>{pedido.notaCliente}</p>
        </section>
      )}

      <section className={styles.bloque}>
        <h2 className={styles.bloqueTitulo}>Notas internas</h2>
        {notas.length === 0 && <p className={styles.estado}>Todavía no hay notas.</p>}
        <ul className={styles.notas}>
          {notas.map((n) => (
            <li key={n.id}>
              <span className={styles.notaMeta}>{fechaLegible(n.created_at)} · {n.author_email ?? 'Equipo'}</span>
              <p>{n.body}</p>
            </li>
          ))}
        </ul>
        <textarea
          className={styles.notasInput}
          value={notaNueva}
          onChange={(e) => setNotaNueva(e.target.value)}
          placeholder="Añadir una nota interna…"
          rows={3}
        />
        <Boton variante="contorno" onClick={guardarNota} desactivado={guardando || !notaNueva.trim()}>
          {guardando ? 'Guardando…' : 'Añadir nota'}
        </Boton>
      </section>

      <section className={styles.bloque}>
        <h2 className={styles.bloqueTitulo}>Historial de estados</h2>
        {historial.length === 0 && <p className={styles.estado}>Sin cambios registrados.</p>}
        <ul className={styles.historial}>
          {historial.map((h) => (
            <li key={h.id}>
              <span className={styles.notaMeta}>{fechaLegible(h.created_at)}</span>
              {' '}
              {ESTADOS_PEDIDO[h.from_status]?.etiqueta ?? h.from_status ?? '—'}
              {' → '}
              {ESTADOS_PEDIDO[h.to_status]?.etiqueta ?? h.to_status}
              {h.staff_note && <span className={styles.notaMeta}> · {h.staff_note}</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
