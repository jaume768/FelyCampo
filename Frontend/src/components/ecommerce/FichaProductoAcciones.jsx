// FichaProductoAcciones.jsx

'use client';

/* ============================================================
   ACCIONES DE FICHA DE PRODUCTO — Fely Campo
   Panel interactivo de la ficha de producto (/tienda/[producto]):
   color + talla (SelectorColor/SelectorTalla, ya existentes) y el
   CTA de compra — el resto de la ficha (galería, acordeón, "también
   te puede interesar") vive directamente en page.js porque no
   necesita estado propio. Aparte porque page.js es un Server
   Component (resuelve el producto por slug) y esto sí necesita
   useState — no se puede repartir estado de un Server Component.
   Uso:
     <FichaProductoAcciones nombre="Vestido Aurora" precio="890 €"
       imagen="/img/aurora.jpg" colores={[...]} tallas={[38, 40, 42]} />
   ============================================================ */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SelectorColor, SelectorTalla, Boton, BotonGuardar } from '../ui';
import { useCarrito } from '@/context/CarritoContext';
import { variantePorColorYTalla } from '@/lib/api/adapters';
import GuiaTallas from './GuiaTallas';
import AvisoReposicion from './AvisoReposicion';
import { TALLAS_AGOTADAS_EJEMPLO } from './guiaTallasData';
import styles from './FichaProductoAcciones.module.css';

function FichaProductoAcciones({
  nombre,
  precio,
  imagen,
  colores = [],
  tallas = [],
  // Con datos reales llegan del backend; sin ellas se cae a las de ejemplo para las
  // páginas que aún no están migradas.
  tallasAgotadas,
  colorways = [],
  soloConsulta = false,
  productoId,
}) {
  const t = useTranslations('producto');
  const tGuia = useTranslations('guiaTallas');
  const { agregar } = useCarrito();
  const [color, setColor] = useState(colores[0]?.nombre ?? null);
  const [talla, setTalla] = useState(null);
  const [guiaAbierta, setGuiaAbierta] = useState(false);
  const [avisoTalla, setAvisoTalla] = useState(false);
  // Mensaje del backend cuando rechaza el alta (sin stock, cantidad > disponible).
  const [errorAnadir, setErrorAnadir] = useState(null);
  const [anadiendo, setAnadiendo] = useState(false);

  const faltaTalla = tallas.length > 0 && !talla;

  // Tallas acotadas al color elegido: una talla puede existir en un color y no en otro.
  // Sin `colorways` (páginas con datos de ejemplo) se usan las listas planas de siempre.
  const colorwayActivo = colorways.find((cw) => cw.color?.nombre === color);
  const tallasDelColor = colorwayActivo
    ? [...colorwayActivo.variantes].sort((a, b) => a.posicionTalla - b.posicionTalla).map((v) => v.talla)
    : tallas;
  const agotadasDelColor = colorwayActivo
    ? colorwayActivo.variantes.filter((v) => !v.hayStock).map((v) => v.talla)
    : (tallasAgotadas ?? TALLAS_AGOTADAS_EJEMPLO);

  // La variante concreta (producto × color × talla) que pide POST /cart/. El carrito de
  // servidor no acepta nombre+talla+color: quiere este UUID.
  const variante = variantePorColorYTalla({ colorways }, color, talla);

  const anadirCesta = async () => {
    if (faltaTalla) {
      setAvisoTalla(true);
      return;
    }
    setAvisoTalla(false);
    setErrorAnadir(null);

    // Las piezas de solo consulta (sale_mode "on_request") NO entran en el carrito: van
    // por consulta. El backend también lo rechazaría, pero mejor no ofrecerlo siquiera.
    if (soloConsulta) return;

    if (!variante) {
      // Combinación inexistente: no es lo mismo que estar agotada.
      setErrorAnadir(t('combinacionNoDisponible'));
      return;
    }
    if (!variante.hayStock) {
      setErrorAnadir(t('sinStock'));
      return;
    }

    setAnadiendo(true);
    const resultado = await agregar(variante.id, 1);
    setAnadiendo(false);
    // El mensaje viene del backend (ApiError.firstDetail): dice el motivo real en vez de
    // un genérico mudo.
    if (!resultado.ok) setErrorAnadir(resultado.mensaje ?? t('errorAnadir'));
  };

  return (
    <div className={styles.acciones}>
      {colores.length > 0 && (
        <SelectorColor colores={colores} seleccionado={color} onSelect={setColor} />
      )}

      {tallas.length > 0 && (
        <div className={styles.bloqueTalla}>
          <SelectorTalla
            tallas={tallasDelColor}
            agotadas={agotadasDelColor}
            seleccionada={talla}
            onSelect={(valor) => { setTalla(valor); setAvisoTalla(false); }}
          />
        </div>
      )}

      <div className={styles.bloqueAnadir}>
        <div className={styles.fila}>
          <Boton variante="solido" tamano="full" onClick={anadirCesta} disabled={anadiendo || soloConsulta}>
            {anadiendo ? t('anadiendo') : t('anadirCesta')}
          </Boton>
          <BotonGuardar variante="solido" />
        </div>

        {avisoTalla && <p className={styles.avisoTalla}>{t('avisoTalla')}</p>}

        {/* Talla elegida pero agotada: en vez de un callejón sin salida, se ofrece el
            aviso de reposición (POST catalog/stock-notifications/, sin cuenta).
            Solo si la variante EXISTE: una combinación inexistente no se puede reponer. */}
        {variante && !variante.hayStock && (
          <AvisoReposicion variantId={variante.id} talla={talla} />
        )}
        {/* Error de ESTA acción, junto al botón: el usuario ve qué falló y dónde. */}
        {errorAnadir && <p className={styles.avisoTalla} role="alert">{errorAnadir}</p>}
      </div>

      {tallas.length > 0 && (
        <div className={styles.filaTalla}>
          <Boton variante="texto" onClick={() => setGuiaAbierta(true)}>{tGuia('abrir')}</Boton>
        </div>
      )}

      <GuiaTallas abierto={guiaAbierta} onCerrar={() => setGuiaAbierta(false)} />
    </div>
  );
}

export default FichaProductoAcciones;
