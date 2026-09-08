'use client';

/* ============================================================
   BOLSA (/carrito) — Fely Campo
   Dos columnas en escritorio: productos añadidos a la izquierda (en
   cuadrícula, ver TarjetaCarrito), resumen del pedido a la derecha,
   pegado arriba mientras la columna de productos es más alta que él
   (mismo patrón que la ficha de producto, ver
   tienda/[producto]/page.module.css). Apiladas en mobile: productos
   primero, resumen debajo.

   'use client' en el propio page.js (no un Server Component
   delegando en un componente cliente aparte) porque toda la página
   depende de CarritoContext — no hay parte server-only que aislar
   (a diferencia de tienda/[producto], que sí resuelve el producto por
   slug en el servidor).
   ============================================================ */

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ShoppingBasket, User } from 'lucide-react';
import { Boton } from '@/components/ui';
import { TarjetaCarrito, PanelInfoEnvios } from '@/components/ecommerce';
import { useCarrito } from '@/context/CarritoContext';
import { useMiCuenta } from '@/context/MiCuentaContext';
import { ListadoCargando, ListadoError } from '@/components/layout';
import styles from './page.module.css';

export default function Pagina() {
  const t = useTranslations('carrito');
  const locale = useLocale();
  const {
    lineas,
    cantidadTotal,
    totales,
    quitar,
    actualizarCantidad,
    cargando,
    errorGlobal,
    erroresLinea,
    recargar,
    hayProblemasDeStock,
    carritoViejoDescartado,
    descartarAvisoCarritoViejo,
  } = useCarrito();
  const { abrir: abrirMiCuenta } = useMiCuenta();
  const [panelEnviosAbierto, setPanelEnviosAbierto] = useState(false);

  // Totales REALES del backend, ya con IVA aplicado. El frontend NO recalcula el 21%:
  // `total_gross` es el importe que se cobra y `vat_total` el desglose informativo.
  // Cambiar la talla desde aquí ya no existe: otra talla es OTRA variante, así que sería
  // quitar la línea y añadir la nueva, no editar un campo.

  if (cargando) {
    return (
      <section className="seccion contenedor cart">
        <p className={styles.vacioTexto} role="status">{t('cargando')}</p>
        <ListadoCargando cantidad={2} />
      </section>
    );
  }

  if (errorGlobal) {
    // Backend caído: se explica y se puede reintentar. La web no se queda en blanco.
    return (
      <section className="seccion contenedor cart">
        <ListadoError titulo={t('errorCargar')} mensaje={errorGlobal.message} textoReintentar={t('reintentar')} onReintentar={recargar} />
      </section>
    );
  }

  return (
    <section className="seccion contenedor cart">
      {/* La cesta guardada por la versión anterior se descarta: sus líneas se
          identificaban por nombre+talla+color y eso no resuelve una variante real. */}
      {carritoViejoDescartado && (
        <div className={styles.avisoCarritoViejo} role="status">
          <p>{t('avisoCarritoViejo')}</p>
          <button type="button" onClick={descartarAvisoCarritoViejo} aria-label={t('cerrarAviso')}>×</button>
        </div>
      )}

      {hayProblemasDeStock && (
        <p className={styles.avisoStock} role="alert">{t('problemasStock')}</p>
      )}

      {lineas.length === 0 ? (
        <div className={styles.vacio}>
          <ShoppingBasket className={styles.vacioIcono} strokeWidth={1} />
          <p className={styles.vacioTexto}>{t('vacio')}</p>
          <Boton variante="solido" tamano="m" href={`/${locale}/tienda`}>{t('explorarTienda')}</Boton>
        </div>
      ) : (
        <div className={styles.layout}>
          <div className={styles.cuadricula}>
            {lineas.map((linea) => (
              <TarjetaCarrito
                key={linea.id}
                imagen={linea.imagen}
                nombre={linea.nombre}
                precio={linea.precio}
                talla={linea.talla}
                slug={linea.slug}
                color={linea.color}
                colorHex={linea.colorHex}
                cantidad={linea.cantidad}
                onCantidad={(cantidad) => actualizarCantidad(linea.id, cantidad)}
                onQuitar={() => quitar(linea.id)}
                disponibles={linea.disponibles}
                sinStock={linea.hayStock === false}
                error={erroresLinea[linea.id]}
              />
            ))}
          </div>

          <aside className={styles.resumen}>
            <h2 className={styles.resumenTitulo}>{t('tuPedido')} ({cantidadTotal})</h2>

            <div className={styles.costes}>
              {lineas.map((linea) => (
                <div key={linea.id} className={styles.filaCoste}>
                  <span>{linea.nombre} × {linea.cantidad}</span>
                  {/* `line_gross`, calculado por el backend. */}
                  <span>{linea.totalLinea}</span>
                </div>
              ))}
              <div className={styles.filaCoste}>
                <span>{t('envio')}</span>
                <span>{totales.envioNeto || t('aCalcular')}</span>
              </div>
              <div className={`${styles.filaCoste} ${styles.filaTotal}`}>
                <span>{t('total')}</span>
                <span>{totales.total}</span>
              </div>
              {/* Desglose informativo: el IVA ya va dentro del total. */}
              <div className={styles.filaCoste}>
                <span>{t('iva')}</span>
                <span>{totales.iva}</span>
              </div>
            </div>

            <div className={styles.filaPedir}>
              <Boton variante="solido" tamano="full" href={`/${locale}/checkout`}>{t('iniciarPedido')}</Boton>

              <button type="button" className={styles.loginPrompt} onClick={abrirMiCuenta}>
                <div className={styles.loginPromptGrupo}>
                  <User className={styles.loginPromptIcono} strokeWidth={1.5} />
                  <span className={styles.loginPromptPregunta}>{t('loginPromptPregunta')}</span>
                </div>
                {t('loginPromptCta')}
              </button>
            </div>

            <button type="button" className={styles.infoEnvio} onClick={() => setPanelEnviosAbierto(true)}>
              <span className={styles.infoEnvioSubrayado}>{t('infoEnvioSubrayado')} {t('infoEnvioResto')}</span>
            </button>
          </aside>
        </div>
      )}

      <PanelInfoEnvios abierto={panelEnviosAbierto} onCerrar={() => setPanelEnviosAbierto(false)} />
    </section>
  );
}
