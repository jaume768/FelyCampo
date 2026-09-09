'use client';

/* ============================================================
   CHECKOUT (/checkout) — Fely Campo

   Compra REAL contra POST /api/v1/checkout/: crea el pedido en el
   backend y reserva el stock una hora.

   SIMULACIÓN DE PAGO, no de pedido. Stripe no está configurado todavía
   (`STRIPE_SECRET_KEY` vacía), así que la respuesta trae
   `payment: null` y el pedido queda en "pendiente de pago" — que es lo
   correcto: el pedido solo se da por pagado cuando lo confirma el
   webhook de Stripe. Nada aquí finge un cobro.

   Se compra SIN CUENTA: basta el correo (ver CheckoutSerializer).

   'use client' porque depende del carrito, que vive en localStorage
   vía X-Cart-Id.
   ============================================================ */

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check } from 'lucide-react';

import { Boton, Input } from '@/components/ui';
import { ListadoCargando, ListadoError } from '@/components/layout';
import { useCarrito } from '@/context/CarritoContext';
import { cart } from '@/lib/api/endpoints';
import { adaptarPedido } from '@/lib/api/adapters';
import { ApiError } from '@/lib/api/errors';

import styles from './page.module.css';

/** Campos obligatorios del backend, para no mandar una petición que ya sabemos inválida. */
const OBLIGATORIOS = [
  'email',
  'shipping_recipient',
  'shipping_line1',
  'shipping_postal_code',
  'shipping_city',
  'shipping_province',
];

export default function Checkout() {
  const t = useTranslations('checkout');
  const tCarrito = useTranslations('carrito');
  const locale = useLocale();
  const { lineas, totales, cantidadTotal, cargando, errorGlobal, recargar, vacio, hayProblemasDeStock } = useCarrito();

  const [datos, setDatos] = useState({
    email: '',
    phone: '',
    shipping_recipient: '',
    shipping_line1: '',
    shipping_line2: '',
    shipping_postal_code: '',
    shipping_city: '',
    shipping_province: '',
    customer_note: '',
    invoice_requested: false,
    billing_name: '',
    billing_tax_id: '',
    billing_address: '',
  });
  const [erroresCampo, setErroresCampo] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [pedido, setPedido] = useState(null);

  const cambiar = (campo) => (evento) => {
    const valor = evento.target.type === 'checkbox' ? evento.target.checked : evento.target.value;
    setDatos((actuales) => ({ ...actuales, [campo]: valor }));
    // Limpiar el error de ese campo al tocarlo: mantenerlo mientras el usuario corrige
    // es ruido.
    setErroresCampo((actuales) => {
      if (!(campo in actuales)) return actuales;
      const { [campo]: _, ...resto } = actuales;
      return resto;
    });
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    setErrorGeneral(null);

    const faltan = OBLIGATORIOS.filter((campo) => !String(datos[campo]).trim());
    if (faltan.length) {
      setErroresCampo(Object.fromEntries(faltan.map((campo) => [campo, [t('obligatorio')]])));
      return;
    }
    // Misma regla que valida el backend, comprobada antes para no gastar una petición.
    if (datos.invoice_requested && !datos.billing_tax_id.trim()) {
      setErroresCampo({ billing_tax_id: [t('nifObligatorio')] });
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await cart.iniciarCheckout(datos);
      setPedido({
        ...adaptarPedido(respuesta.order),
        // `payment` null = Stripe sin configurar. Se guarda para poder decirlo en claro
        // en vez de fingir que se ha cobrado.
        pagoDisponible: Boolean(respuesta.payment),
      });
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      if (error.isValidationError && Object.keys(error.details || {}).length) {
        // Campo a campo, con el mensaje del backend, nunca el JSON crudo.
        setErroresCampo(error.details);
      } else if (error.code === 'cart_empty') {
        setErrorGeneral(t('carritoVacio'));
      } else if (error.isNetworkError) {
        setErrorGeneral(t('errorRed'));
      } else {
        setErrorGeneral(error.firstDetail ?? error.message);
      }
    } finally {
      setEnviando(false);
    }
  };

  const errorDe = (campo) => (erroresCampo[campo] ? String(erroresCampo[campo][0] ?? erroresCampo[campo]) : null);

  // --- Pedido creado: confirmación ---
  if (pedido) {
    return (
      <section className="seccion contenedor">
        <div className={styles.confirmacion}>
          <span className={styles.marcaExito} aria-hidden="true"><Check size={22} strokeWidth={1.5} /></span>
          <h1 className={styles.confirmacionTitulo}>{t('confirmadoTitulo')}</h1>
          <p className={styles.referencia}>
            {t('referencia')}
            <strong className={styles.referenciaCodigo}>{pedido.referencia}</strong>
          </p>
          <p className={styles.confirmacionTexto}>{t('confirmadoTexto', { email: pedido.email })}</p>

          {/* Sin pasarela no hay cobro: se dice tal cual en vez de simular un pago. */}
          {!pedido.pagoDisponible && (
            <p className={styles.avisoPago} role="status">{t('sinPasarela')}</p>
          )}

          <div className={styles.resumenPedido}>
            {pedido.lineas.map((linea) => (
              <div key={linea.id} className={styles.filaResumen}>
                <span>{linea.nombre} · {linea.talla} · {linea.color} × {linea.cantidad}</span>
                <span>{linea.totalLinea}</span>
              </div>
            ))}
            <div className={`${styles.filaResumen} ${styles.filaTotal}`}>
              <span>{tCarrito('total')}</span>
              <span className={styles.totalImporte}>{pedido.totales.total}</span>
            </div>
            <p className={styles.notaIva}>{t('ivaIncluido', { iva: pedido.totales.iva })}</p>
          </div>

          <Boton variante="solido" href={`/${locale}/tienda`}>{t('seguirComprando')}</Boton>
        </div>
      </section>
    );
  }

  if (cargando) {
    return (
      <section className="seccion contenedor">
        <ListadoCargando cantidad={2} />
      </section>
    );
  }

  if (errorGlobal) {
    return (
      <section className="seccion contenedor">
        <ListadoError
          titulo={tCarrito('errorCargar')}
          mensaje={errorGlobal.message}
          textoReintentar={tCarrito('reintentar')}
          onReintentar={recargar}
        />
      </section>
    );
  }

  if (vacio) {
    return (
      <section className="seccion contenedor">
        <div className={styles.vacio}>
          <p>{tCarrito('vacio')}</p>
          <Boton variante="solido" href={`/${locale}/tienda`}>{tCarrito('explorarTienda')}</Boton>
        </div>
      </section>
    );
  }

  return (
    <section className="seccion contenedor">
      <h1 className={styles.titulo}>{t('titulo')}</h1>
      <p className={styles.subtitulo}>{t('subtitulo')}</p>

      {hayProblemasDeStock && (
        <p className={styles.avisoStock} role="alert">{tCarrito('problemasStock')}</p>
      )}

      <div className={styles.layout}>
        <form className={styles.form} onSubmit={enviar} noValidate>
          <fieldset className={styles.bloque}>
            <legend className={styles.leyenda}>
              <span className={styles.numeroPaso} aria-hidden="true">1</span>
              {t('contacto')}
            </legend>
            {/* Se compra SIN cuenta: basta el correo. */}
            <Input etiqueta={t('email')} tipo="email" nombre="email" valor={datos.email} onChange={cambiar('email')} error={errorDe('email')} autoComplete="email" />
            <Input etiqueta={t('telefono')} tipo="tel" nombre="phone" valor={datos.phone} onChange={cambiar('phone')} error={errorDe('phone')} autoComplete="tel" />
          </fieldset>

          <fieldset className={styles.bloque}>
            <legend className={styles.leyenda}>
              <span className={styles.numeroPaso} aria-hidden="true">2</span>
              {t('envio')}
            </legend>
            <Input etiqueta={t('destinatario')} nombre="shipping_recipient" valor={datos.shipping_recipient} onChange={cambiar('shipping_recipient')} error={errorDe('shipping_recipient')} autoComplete="name" />
            <Input etiqueta={t('direccion')} nombre="shipping_line1" valor={datos.shipping_line1} onChange={cambiar('shipping_line1')} error={errorDe('shipping_line1')} autoComplete="address-line1" />
            <Input etiqueta={t('direccion2')} nombre="shipping_line2" valor={datos.shipping_line2} onChange={cambiar('shipping_line2')} error={errorDe('shipping_line2')} autoComplete="address-line2" />
            {/* Tres campos cortos en una línea: apilarlos alargaba el formulario sin motivo. */}
            <div className={`${styles.filaCampos} ${styles.filaCamposTres}`}>
              <Input etiqueta={t('codigoPostal')} nombre="shipping_postal_code" valor={datos.shipping_postal_code} onChange={cambiar('shipping_postal_code')} error={errorDe('shipping_postal_code')} autoComplete="postal-code" />
              <Input etiqueta={t('ciudad')} nombre="shipping_city" valor={datos.shipping_city} onChange={cambiar('shipping_city')} error={errorDe('shipping_city')} autoComplete="address-level2" />
              <Input etiqueta={t('provincia')} nombre="shipping_province" valor={datos.shipping_province} onChange={cambiar('shipping_province')} error={errorDe('shipping_province')} autoComplete="address-level1" />
            </div>
            {/* País no editable: solo Península por ahora (ver CheckoutSerializer). */}
            <p className={styles.nota}>{t('soloPeninsula')}</p>
          </fieldset>

          <fieldset className={styles.bloque}>
            <legend className={styles.leyenda}>
              <span className={styles.numeroPaso} aria-hidden="true">3</span>
              {t('factura')}
            </legend>
            <label className={styles.checkbox}>
              <input type="checkbox" checked={datos.invoice_requested} onChange={cambiar('invoice_requested')} />
              {t('quieroFactura')}
            </label>
            {datos.invoice_requested && (
              <div className={styles.camposFactura}>
                <Input etiqueta={t('nombreFiscal')} nombre="billing_name" valor={datos.billing_name} onChange={cambiar('billing_name')} error={errorDe('billing_name')} />
                <Input etiqueta={t('nif')} nombre="billing_tax_id" valor={datos.billing_tax_id} onChange={cambiar('billing_tax_id')} error={errorDe('billing_tax_id')} />
                <Input etiqueta={t('direccionFiscal')} nombre="billing_address" valor={datos.billing_address} onChange={cambiar('billing_address')} error={errorDe('billing_address')} />
              </div>
            )}
          </fieldset>

          {errorGeneral && <p className={styles.errorGeneral} role="alert">{errorGeneral}</p>}

          <Boton variante="solido" tamano="full" type="submit" disabled={enviando}>
            {enviando ? t('procesando') : t('confirmarPedido')}
          </Boton>
          <p className={styles.legal}>{t('avisoReserva')}</p>
        </form>

        <aside className={styles.resumen}>
          <h2 className={styles.resumenTitulo}>
            {tCarrito('tuPedido')}
            <span className={styles.resumenCantidad}>{t('articulos', { cantidad: cantidadTotal })}</span>
          </h2>

          <div className={styles.articulos}>
            {lineas.map((linea) => (
              <div key={linea.id} className={styles.articulo}>
                {linea.imagen
                  ? <img src={linea.imagen} alt="" className={styles.articuloFoto} />
                  : <span className={styles.articuloFoto} />}
                <div className={styles.articuloDatos}>
                  <span className={styles.articuloNombre}>{linea.nombre}</span>
                  <span className={styles.articuloMeta}>
                    {[linea.talla, linea.color].filter(Boolean).join(' · ')}
                    {' · '}
                    {t('unidades', { cantidad: linea.cantidad })}
                  </span>
                </div>
                <span className={styles.articuloPrecio}>{linea.totalLinea}</span>
              </div>
            ))}
          </div>

          <div className={styles.filaResumen}>
            <span>{tCarrito('envio')}</span>
            <span>{totales.envioNeto}</span>
          </div>
          {/* El total, último y grande: es el número que se mira. El IVA va debajo como
              aclaración de que ya está dentro, no como una fila más que sumar. */}
          <div className={`${styles.filaResumen} ${styles.filaTotal}`}>
            <span>{tCarrito('total')}</span>
            <span className={styles.totalImporte}>{totales.total}</span>
          </div>
          <p className={styles.notaIva}>{t('ivaIncluido', { iva: totales.iva })}</p>
        </aside>
      </div>
    </section>
  );
}
