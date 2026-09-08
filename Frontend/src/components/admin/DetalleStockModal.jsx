'use client';

/* ============================================================
   DETALLE DE STOCK — Fely Campo (admin)

   Desglose por ubicación de una variante, ajuste e historial.

   EL MOTIVO ES OBLIGATORIO. No es una validación de cortesía: el
   backend crea un `StockMovement` con él, y ese es el único rastro de
   por qué cambió el inventario. Sin motivo no se puede mover stock.

   Dos formas de ajustar, y no son intercambiables:
     · «Sumar/restar» manda un `delta` RELATIVO — para recibir mercancía
       o corregir. No pisa un cambio simultáneo de otra persona.
     · «Fijar cantidad» manda el total ABSOLUTO — para un recuento
       físico, donde lo que se sabe es cuántas hay, no la diferencia.
   ============================================================ */

import { useCallback, useEffect, useState } from 'react';

import { Boton, Input } from '@/components/ui';
import ModalOverlay from './ModalOverlay';
import {
  ajustarStock, fijarStock, listarMovimientos, adaptarMovimiento, MOTIVOS_AJUSTE,
} from '@/lib/api/adminStock';
import { ApiError } from '@/lib/api/errors';
import styles from './DetalleStockModal.module.css';

function fechaLegible(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
}

/**
 * @param {object} props
 * @param {object|null} props.variante Fila adaptada; `null` = cerrado.
 * @param {object[]} props.ubicaciones
 * @param {() => void} props.onCerrar
 * @param {() => void} props.onGuardado
 */
function DetalleStockModal({ variante, ubicaciones = [], onCerrar, onGuardado }) {
  const [modo, setModo] = useState('ajustar');
  const [ubicacionId, setUbicacionId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState(MOTIVOS_AJUSTE[0].etiqueta);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const cargarHistorial = useCallback(async (id) => {
    setCargandoHistorial(true);
    try {
      const pag = await listarMovimientos({ variant: id, page_size: 20 });
      setMovimientos((pag.results || []).map(adaptarMovimiento));
    } catch {
      // El historial es secundario: si falla, el ajuste sigue funcionando.
      setMovimientos([]);
    } finally {
      setCargandoHistorial(false);
    }
  }, []);

  useEffect(() => {
    if (!variante) return;
    setError(null);
    setCantidad('');
    setUbicacionId(variante.ubicaciones?.[0]?.ubicacionId || ubicaciones[0]?.id || '');
    cargarHistorial(variante.id);
  }, [variante, ubicaciones, cargarHistorial]);

  if (!variante) return null;

  const numero = Number(cantidad);
  const cantidadValida = cantidad !== '' && Number.isFinite(numero) && (modo === 'ajustar' ? numero !== 0 : numero >= 0);
  const puedeGuardar = Boolean(ubicacionId && motivo.trim()) && cantidadValida && !guardando;

  async function guardar() {
    if (!puedeGuardar) return;
    setGuardando(true);
    setError(null);
    try {
      if (modo === 'ajustar') {
        await ajustarStock(variante.id, { location: ubicacionId, delta: numero, reason: motivo.trim() });
      } else {
        await fijarStock(variante.id, { location: ubicacionId, quantity: numero, reason: motivo.trim() });
      }
      onGuardado?.();
      onCerrar?.();
    } catch (fallo) {
      if (!(fallo instanceof ApiError)) throw fallo;
      // Ej.: dejar el stock por debajo de lo ya reservado, que el backend impide.
      setError(fallo.firstDetail ?? fallo.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <ModalOverlay abierto onCerrar={onCerrar}>
      <div className={styles.contenido}>
        <h2 className={styles.titulo}>{variante.producto}</h2>
        <p className={styles.subtitulo}>
          {variante.sku} · {variante.color} · talla {variante.talla}
        </p>

        <div className={styles.cifras}>
          <span><strong>{variante.fisico}</strong> físico</span>
          <span><strong>{variante.reservado}</strong> reservado</span>
          <span><strong>{variante.disponible}</strong> disponible</span>
        </div>

        <section className={styles.bloque}>
          <h3 className={styles.bloqueTitulo}>Por ubicación</h3>
          {variante.ubicaciones.length === 0 ? (
            <p className={styles.vacio}>Sin niveles registrados.</p>
          ) : (
            <ul className={styles.ubicaciones}>
              {variante.ubicaciones.map((u) => (
                <li key={u.id}>
                  <span>
                    {u.ubicacion}
                    {!u.vendible && <span className={styles.noVendible}>no vendible</span>}
                  </span>
                  <strong>{u.cantidad}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.bloque}>
          <h3 className={styles.bloqueTitulo}>Ajustar</h3>

          <div className={styles.modos}>
            <button
              type="button"
              className={`${styles.modoBoton} ${modo === 'ajustar' ? styles.modoActivo : ''}`}
              aria-pressed={modo === 'ajustar'}
              onClick={() => setModo('ajustar')}
            >
              Sumar / restar
            </button>
            <button
              type="button"
              className={`${styles.modoBoton} ${modo === 'fijar' ? styles.modoActivo : ''}`}
              aria-pressed={modo === 'fijar'}
              onClick={() => setModo('fijar')}
            >
              Fijar cantidad
            </button>
          </div>

          <label className={styles.campo}>
            <span className={styles.etiqueta}>Ubicación</span>
            <select className={styles.select} value={ubicacionId} onChange={(e) => setUbicacionId(e.target.value)}>
              {ubicaciones.map((u) => (
                <option key={u.id} value={u.id}>{u.nombre}{u.vendible ? '' : ' (no vendible)'}</option>
              ))}
            </select>
          </label>

          <Input
            etiqueta={modo === 'ajustar' ? 'Unidades (+ suma, − resta)' : 'Cantidad final'}
            tipo="number"
            valor={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            placeholder={modo === 'ajustar' ? '+10' : '25'}
          />

          {/* Obligatorio: el backend lo guarda en el StockMovement. */}
          <label className={styles.campo}>
            <span className={styles.etiqueta}>Motivo *</span>
            <select className={styles.select} value={motivo} onChange={(e) => setMotivo(e.target.value)}>
              {MOTIVOS_AJUSTE.map((m) => (
                <option key={m.valor} value={m.etiqueta}>{m.etiqueta}</option>
              ))}
            </select>
          </label>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <div className={styles.acciones}>
            <Boton variante="contorno" onClick={onCerrar}>Cancelar</Boton>
            <Boton variante="solido" onClick={guardar} desactivado={!puedeGuardar}>
              {guardando ? 'Guardando…' : 'Guardar ajuste'}
            </Boton>
          </div>
        </section>

        <section className={styles.bloque}>
          <h3 className={styles.bloqueTitulo}>Historial</h3>
          {cargandoHistorial && <p className={styles.vacio} role="status">Cargando…</p>}
          {!cargandoHistorial && movimientos.length === 0 && (
            <p className={styles.vacio}>Todavía no hay movimientos registrados.</p>
          )}
          <ul className={styles.historial}>
            {movimientos.map((m) => (
              <li key={m.id}>
                <span className={styles.meta}>{fechaLegible(m.fecha)} · {m.ubicacion} · {m.quien}</span>
                <span className={m.delta >= 0 ? styles.deltaMas : styles.deltaMenos}>
                  {m.delta >= 0 ? `+${m.delta}` : m.delta}
                </span>
                <span className={styles.motivo}>{m.motivo}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </ModalOverlay>
  );
}

export default DetalleStockModal;
