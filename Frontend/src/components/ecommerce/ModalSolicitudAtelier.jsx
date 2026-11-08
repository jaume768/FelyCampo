// ModalSolicitudAtelier.jsx

'use client';

/* ============================================================
   SOLICITUD DE INFORMACIÓN — ATELIER — Fely Campo
   Modal (ver ui/Modal.jsx) que abre InfoAtelier.jsx al pulsar
   "Contacta con nosotros" — y también la ficha de Prêt-à-porter
   (FichaProductoAcciones.jsx / GaleriaProductoLightbox.jsx), que antes
   tenía su propio ModalContactoProducto (solo nombre + email, sin
   enviar nada; unificados a petición, mismos datos en todas las
   fichas) — pide nombre, email, teléfono (opcional),
   comentario (opcional) y la casilla de privacidad/términos
   (obligatoria, la misma del formulario de cita), con el producto y el
   color ya elegidos como contexto fijo (no editable aquí, ver
   "resumen" más abajo). Ya no pide talla (quitada a petición
   2026-10-27; con ella se fue también el enlace "Guía de tallas").

   "Enviar solicitud" manda los datos a /api/consulta-vestido (aviso al
   equipo + confirmación a la clienta, ver ese route.js) y, si va bien,
   pasa a la pantalla de confirmación. Además del producto y el color
   se envían la ruta de la ficha (para el enlace del aviso) y si es de
   Novias o Fiesta, sacados de la URL de la página
   (/atelier/novias/… o /atelier/fiesta/…), y el idioma.
   En el admin, estas consultas se ven en /admin/consultas-precio
   ("Consultas de vestidos", mismo shape que consultasPrecioMock).

   "resumen" (foto + nombre + color elegido): mismo diseño que
   .panelProducto de RunwayGaleria.jsx ("Consigue el look"), sin su
   botón "+" flotante (aquí no se añade nada a la cesta, es solo
   contexto de la solicitud) y con el color ya elegido debajo del
   nombre en vez de al lado de la foto.
   Uso:
     <ModalSolicitudAtelier abierto={abierto} onCerrar={...}
       imagen="/img/aurora.jpg" producto="Vestido Aurora" color="Marfil"
       colorHex="#F5F1EE" />
   ============================================================ */

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Modal, Boton, Input } from '../ui';
import { obtenerContacto } from '@/lib/contacto';
import styles from './ModalSolicitudAtelier.module.css';
import { atributosImagen } from '@/lib/imagenes';

// "novias" | "fiesta" | "pretaporter" a partir de la URL de la ficha;
// null si no encaja.
function tipoDesdeRuta(ruta) {
  if (/\/pret-a-porter(\/|$)/.test(ruta)) return 'pretaporter';
  return ruta.match(/\/atelier\/(novias|fiesta)(\/|$)/)?.[1] ?? null;
}

function ModalSolicitudAtelier({ abierto, onCerrar, imagen, producto, color, colorHex }) {
  const t = useTranslations('solicitudAtelier');
  const tCita = useTranslations('pedirCitaAtelier');
  const locale = useLocale();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [comentario, setComentario] = useState('');
  const [aceptaLegal, setAceptaLegal] = useState(false);
  const [avisoDatos, setAvisoDatos] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(false);
  const [enviado, setEnviado] = useState(false);
  // Campo trampa para bots — oculto, una persona nunca lo rellena (ver
  // api/consulta-vestido/route.js).
  const [web, setWeb] = useState('');

  const withLocale = (href) => `/${locale}${href}`;

  const alEnviar = async (evento) => {
    evento.preventDefault();
    if (enviando) return;
    if (!nombre.trim() || !email.trim() || !aceptaLegal) {
      setAvisoDatos(true);
      return;
    }

    setEnviando(true);
    setErrorEnvio(false);
    const ruta = window.location.pathname;
    try {
      const respuesta = await fetch('/api/consulta-vestido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale, tipo: tipoDesdeRuta(ruta), ruta, producto, color, imagen, colorHex, nombre, email, telefono, comentario, aceptaLegal, web,
        }),
      });
      const resultado = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok || !resultado.ok) {
        // 422 = datos no válidos según el servidor (ej. email mal escrito).
        if (respuesta.status === 422) setAvisoDatos(true);
        else setErrorEnvio(true);
        setEnviando(false);
        return;
      }
      setEnviado(true);
    } catch {
      setErrorEnvio(true);
    }
    setEnviando(false);
  };

  return (
    <Modal abierto={abierto} onCerrar={onCerrar}>
      {enviado ? (
        <div className={styles.confirmacion}>
          <h2 className={styles.titulo}>{t('confirmacionTitulo')}</h2>
          <p>{t('confirmacionTexto')}</p>
          <Boton variante="solido" tamano="full" onClick={onCerrar}>{t('cerrar')}</Boton>
        </div>
      ) : (
        <form className={styles.form} onSubmit={alEnviar} noValidate>
          <h2 className={styles.titulo}>{t('titulo')}</h2>
          <p className={styles.subtitulo}>{t('subtitulo')}</p>

          <div className={styles.resumen}>
            {imagen && (
              <img {...atributosImagen(imagen, { sizes: '160px' })} alt="" className={styles.resumenImagen} />
            )}
            <div className={styles.resumenInfo}>
              <p className={styles.resumenNombre}>{producto}</p>
              {color && (
                <p className={styles.resumenColor}>
                  {colorHex && <span className={styles.resumenColorMuestra} style={{ background: colorHex }} />}
                  {color}
                </p>
              )}
            </div>
          </div>

          <div className={styles.trampa} aria-hidden="true">
            <input type="text" name="web" tabIndex={-1} autoComplete="off" value={web} onChange={(evento) => setWeb(evento.target.value)} />
          </div>

          <Input
            etiqueta={t('nombre')}
            nombre="nombre"
            placeholder={t('nombrePlaceholder')}
            valor={nombre}
            onChange={(evento) => { setNombre(evento.target.value); setAvisoDatos(false); }}
          />
          <Input
            etiqueta={t('email')}
            tipo="email"
            nombre="email"
            placeholder={t('emailPlaceholder')}
            valor={email}
            onChange={(evento) => { setEmail(evento.target.value); setAvisoDatos(false); }}
          />
          <Input
            etiqueta={t('telefono')}
            tipo="tel"
            nombre="telefono"
            placeholder={t('telefonoPlaceholder')}
            valor={telefono}
            onChange={(evento) => setTelefono(evento.target.value)}
          />

          <label className={styles.campo}>
            <span className={styles.etiqueta}>{t('comentario')}</span>
            <textarea
              className={styles.textarea}
              value={comentario}
              onChange={(evento) => setComentario(evento.target.value)}
              placeholder={t('comentarioPlaceholder')}
              rows={3}
            />
          </label>

          {/* Mismo texto y enlaces que la casilla del formulario de cita. */}
          <label className={styles.legalFila}>
            <input
              type="checkbox"
              className={styles.legalCheckbox}
              checked={aceptaLegal}
              onChange={(evento) => { setAceptaLegal(evento.target.checked); setAvisoDatos(false); }}
            />
            <span className={styles.legalTexto}>
              {tCita.rich('aceptoLegal', {
                privacidad: (chunks) => (
                  <a href={withLocale('/legal/privacidad')} className={styles.legalEnlace} target="_blank" rel="noopener noreferrer">
                    {chunks}
                  </a>
                ),
                terminos: (chunks) => (
                  <a href={withLocale('/legal/terminos')} className={styles.legalEnlace} target="_blank" rel="noopener noreferrer">
                    {chunks}
                  </a>
                ),
              })}
            </span>
          </label>

          {avisoDatos && <p className={styles.aviso} role="alert">{t('avisoDatos')}</p>}
          {errorEnvio && <p className={styles.aviso} role="alert">{t('errorEnvio', { email: obtenerContacto().email })}</p>}

          <Boton variante="solido" tamano="full" type="submit" desactivado={enviando}>
            {enviando ? t('enviando') : t('enviar')}
          </Boton>
        </form>
      )}
    </Modal>
  );
}

export default ModalSolicitudAtelier;
