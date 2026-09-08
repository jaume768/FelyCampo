'use client';

/* ============================================================
   DETALLE DE KPI — Fely Campo (admin)
   Al que llevan las tarjetas de /admin/metricas: un gráfico de barras
   mensual (año en curso, solo meses con datos — no se inventan meses
   futuros) de la serie que indica `kpi.clave` en `metricasMensualesMock`.
   Trae su propio FiltroBar (Año/Producto, y Mes para los KPIs con
   desglose por producto) — arranca con los valores de la tarjeta desde
   la que se hizo click (`?anio=&mes=&producto=`) pero se puede seguir
   ajustando aquí sin volver a /admin/metricas. Clicar una barra también
   selecciona ese mes, igual que el selector "Mes".
   ============================================================ */

import { Suspense, use, useMemo, useState } from 'react';
import { useSearchParams, notFound } from 'next/navigation';
import {
  PageHeader, BotonVolver, FiltroBar, FiltroSelector,
} from '@/components/admin';
import {
  kpisAnaliticas, metricasMensualesMock, NOMBRES_MES, ANIO_INICIO_METRICAS_MOCK,
} from '@/components/admin/mockData';
import styles from './page.module.css';

const HOY = new Date();
const ANIO_DEFECTO = String(HOY.getFullYear());
const MES_DEFECTO = String(HOY.getMonth() + 1).padStart(2, '0');

const OPCIONES_PRODUCTO = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'pret-a-porter', etiqueta: 'Pret-a-porter' },
  { valor: 'novias', etiqueta: 'Novias' },
  { valor: 'fiesta', etiqueta: 'Fiesta' },
];

const OPCIONES_ANIO = [];
for (let anio = HOY.getFullYear(); anio >= ANIO_INICIO_METRICAS_MOCK; anio -= 1) {
  OPCIONES_ANIO.push({ valor: String(anio), etiqueta: String(anio) });
}

// No usa `toLocaleString('es-ES')`: sin ICU completo en Node el separador
// de miles no se aplica y devuelve "8230" en vez de "8.230" — mismo formato
// a mano ("." cada 3 cifras) que ya usan a mano los strings de `ingresos`
// en el resto de mockData.js.
function conMiles(numero) {
  return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatear(valor, formato) {
  const redondeado = Math.round(valor);
  return formato === 'moneda' ? `${conMiles(redondeado)} €` : conMiles(redondeado);
}

function ventasDe(entrada, tipoProducto) {
  const tipos = tipoProducto === 'todos' ? Object.keys(entrada.porProducto) : [tipoProducto];
  return tipos.reduce((total, t) => total + (entrada.porProducto[t]?.ventas || 0), 0);
}

function pedidosDe(entrada, tipoProducto) {
  const tipos = tipoProducto === 'todos' ? Object.keys(entrada.porProducto) : [tipoProducto];
  return tipos.reduce((total, t) => total + (entrada.porProducto[t]?.pedidos || 0), 0);
}

function valorSerie(entrada, clave, tipoProducto) {
  if (clave === 'clientesNuevos') return entrada.clientesNuevos;
  if (clave === 'ventas') return ventasDe(entrada, tipoProducto);
  if (clave === 'pedidos') return pedidosDe(entrada, tipoProducto);
  const pedidos = pedidosDe(entrada, tipoProducto);
  return pedidos ? ventasDe(entrada, tipoProducto) / pedidos : 0;
}

function DetalleKpiContenido({ id }) {
  const searchParams = useSearchParams();
  const kpi = kpisAnaliticas.find((k) => k.id === id);

  const [anio, setAnio] = useState(searchParams.get('anio') || ANIO_DEFECTO);
  const [mes, setMes] = useState(searchParams.get('mes') || MES_DEFECTO);
  const [tipoProducto, setTipoProducto] = useState(searchParams.get('producto') || 'todos');
  const [mesHover, setMesHover] = useState(null);
  const [vistaTabla, setVistaTabla] = useState(false);

  if (!kpi) notFound();

  const conProducto = kpi.clave !== 'clientesNuevos';
  const entradas = metricasMensualesMock[anio] || [];

  const serie = useMemo(() => entradas.map((entrada) => ({
    mes: entrada.mes,
    valor: valorSerie(entrada, kpi.clave, conProducto ? tipoProducto : 'todos'),
  })), [entradas, kpi.clave, conProducto, tipoProducto]);

  const valorMaximo = Math.max(1, ...serie.map((p) => p.valor));
  const puntoSeleccionado = serie.find((p) => p.mes === mes);
  const mesMostrado = mesHover || (puntoSeleccionado ? mes : null);
  const puntoMostrado = serie.find((p) => p.mes === mesMostrado);

  return (
    <div>
      <BotonVolver href="/admin/metricas" />
      <PageHeader titulo={kpi.etiqueta} subtitulo="Evolución mensual" />

      <FiltroBar>
        <FiltroSelector
          etiqueta="Año"
          valor={anio}
          onChange={(e) => setAnio(e.target.value)}
          opciones={OPCIONES_ANIO}
          compacta
          activo={anio !== ANIO_DEFECTO}
        />
        {conProducto && (
          <FiltroSelector
            etiqueta="Producto"
            valor={tipoProducto}
            onChange={(e) => setTipoProducto(e.target.value)}
            opciones={OPCIONES_PRODUCTO}
            activo={tipoProducto !== 'todos'}
          />
        )}
        <FiltroSelector
          etiqueta="Mes"
          valor={mes}
          onChange={(e) => setMes(e.target.value)}
          opciones={entradas.map((entrada) => ({
            valor: entrada.mes,
            etiqueta: NOMBRES_MES[Number(entrada.mes) - 1],
          }))}
          activo={mes !== MES_DEFECTO}
        />
      </FiltroBar>

      <div className={styles.tarjeta}>
        <div className={styles.cabecera}>
          <div>
            <p className={styles.etiquetaValor}>
              {puntoMostrado ? `${NOMBRES_MES[Number(puntoMostrado.mes) - 1]} ${anio}` : `Sin datos en ${anio}`}
            </p>
            <p className={styles.valorPrincipal}>
              {puntoMostrado ? formatear(puntoMostrado.valor, kpi.formato) : '—'}
            </p>
          </div>
          {kpi.variacion && puntoMostrado?.mes === mes && (
            <p className={`${styles.variacion} ${kpi.variacion.startsWith('-') ? styles.variacionNegativa : ''}`}>
              {kpi.variacion} vs. mes anterior
            </p>
          )}
        </div>

        {serie.length === 0 ? (
          <p className={styles.vacio}>Sin datos para este año.</p>
        ) : (
          <>
            <div className={styles.grafico}>
              <div className={styles.ejeY}>
                <span>{formatear(valorMaximo, kpi.formato)}</span>
                <span>{formatear(valorMaximo / 2, kpi.formato)}</span>
                <span>0</span>
              </div>
              <div className={styles.plano}>
                <div className={styles.zonaBarras}>
                  <div className={`${styles.gridlinea} ${styles.gridlineaArriba}`} />
                  <div className={`${styles.gridlinea} ${styles.gridlineaMedio}`} />
                  {serie.map((punto) => {
                    const activa = punto.mes === mes;
                    const alturaPct = (punto.valor / valorMaximo) * 100;
                    return (
                      <button
                        key={punto.mes}
                        type="button"
                        className={styles.columna}
                        onClick={() => setMes(punto.mes)}
                        onMouseEnter={() => setMesHover(punto.mes)}
                        onMouseLeave={() => setMesHover(null)}
                        onFocus={() => setMesHover(punto.mes)}
                        onBlur={() => setMesHover(null)}
                        aria-pressed={activa}
                        aria-label={`${NOMBRES_MES[Number(punto.mes) - 1]}: ${formatear(punto.valor, kpi.formato)}`}
                      >
                        <span
                          className={`${styles.barra} ${activa ? styles.barraActiva : ''}`}
                          style={{ height: `${alturaPct}%` }}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className={styles.etiquetasMes}>
                  {serie.map((punto) => (
                    <span key={punto.mes} className={styles.etiquetaMes}>
                      {NOMBRES_MES[Number(punto.mes) - 1].slice(0, 3)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button type="button" className={styles.toggleTabla} onClick={() => setVistaTabla((v) => !v)}>
              {vistaTabla ? 'Ocultar tabla' : 'Ver como tabla'}
            </button>

            {vistaTabla && (
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th>{kpi.etiqueta}</th>
                  </tr>
                </thead>
                <tbody>
                  {serie.map((punto) => (
                    <tr key={punto.mes}>
                      <td>{NOMBRES_MES[Number(punto.mes) - 1]}</td>
                      <td>{formatear(punto.valor, kpi.formato)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function DetalleKpiPage({ params }) {
  const { id } = use(params);
  return (
    <Suspense fallback={null}>
      <DetalleKpiContenido id={id} />
    </Suspense>
  );
}
