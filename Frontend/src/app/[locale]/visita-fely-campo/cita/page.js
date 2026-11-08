'use client';

/* ============================================================
   RESERVAR CITA — ATELIER — Fely Campo. Ruta: /visita-fely-campo/cita
   Página normal (con el Navbar arriba y el fondo blanco del sitio): solo
   el formulario, centrado en la página — antes era una capa a pantalla
   completa por encima del Navbar, con una foto al 50% a la izquierda y
   una X para cerrar (calcada de MiCuentaModal); quitadas a petición.

   Un único formulario pequeño: nombre completo, email y teléfono de
   contacto, atelier (obligatorio, desplegable con los tres — vuelto a
   poner a petición), fecha del evento (obligatoria, solo mes/año en un
   único campo propio, SelectorMesAnio.jsx — no <input type="date">, a petición), mensaje libre
   y la casilla de aceptar privacidad/términos (obligatoria). Código
   postal y ciudad ya no se preguntan — quitados a petición.

   El atelier llega ya elegido si se entra desde el "Pedir cita" de un
   atelier (?ubicacion=<id>, ver ListadoUbicaciones.jsx y
   AtelierDetalle.jsx); desde el Navbar llega vacío. Se lee de
   window.location en un efecto (no useSearchParams, que obligaría a
   envolver la página en <Suspense> para el render estático).

   "Enviar solicitud" manda los datos a /api/cita (email de confirmación
   a la clienta + aviso al equipo del atelier, ver src/app/api/cita/
   route.js) y, si va bien, registra la conversión (src/lib/analitica.js)
   y lleva a la página de confirmación (./confirmacion). Ya no se
   pregunta si la cita es de novia o de invitada — quitado a petición. */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Boton, Input } from '@/components/ui';
import { ATELIERES_CITA, rutaConfirmacionCita } from '@/lib/citaAtelier';
import { registrarConversionCita } from '@/lib/analitica';
import { obtenerContacto } from '@/lib/contacto';
import SelectorMesAnio from './SelectorMesAnio';
import styles from './page.module.css';

// Nombres de mes propios (no hay diccionario de meses en messages/
// {locale}.json todavía): un array fijo por idioma.
const MESES = {
  es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

export default function Pagina() {
  const t = useTranslations('pedirCitaAtelier');
  const locale = useLocale();
  const router = useRouter();
  const meses = MESES[locale] || MESES.es;

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  // "AAAA-MM" — solo mes y año, a petición (ver SelectorMesAnio.jsx).
  const [fechaEvento, setFechaEvento] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [aceptaLegal, setAceptaLegal] = useState(false);
  const [avisoDatos, setAvisoDatos] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(false);
  // Campo trampa para bots — oculto, una persona nunca lo rellena (ver
  // api/cita/route.js).
  const [web, setWeb] = useState('');

  const withLocale = (href) => `/${locale}${href}`;
  const conLimpieza = (setter) => (evento) => { setter(evento.target.value); setAvisoDatos(false); };

  // Atelier ya elegido si se llega desde el "Pedir cita" de un atelier.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('ubicacion');
    if (ATELIERES_CITA.some((atelier) => atelier.id === id)) setUbicacion(id);
  }, []);

  const alEnviar = async (evento) => {
    evento.preventDefault();
    if (enviando) return;
    if (!ubicacion || !fechaEvento || !nombreCompleto.trim() || !email.trim() || !telefono.trim() || !aceptaLegal) {
      setAvisoDatos(true);
      return;
    }

    setEnviando(true);
    setErrorEnvio(false);
    try {
      const respuesta = await fetch('/api/cita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale, ubicacion, fechaEvento, nombreCompleto, email, telefono, mensaje, aceptaLegal, web,
        }),
      });
      const resultado = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok || !resultado.ok) {
        // 422 = datos no válidos según el servidor (ej. fecha pasada).
        if (respuesta.status === 422) setAvisoDatos(true);
        else setErrorEnvio(true);
        setEnviando(false);
        return;
      }
      registrarConversionCita();
      router.push(withLocale(rutaConfirmacionCita()));
    } catch {
      setErrorEnvio(true);
      setEnviando(false);
    }
  };

  return (
    <div className={styles.pagina}>
      <div className={styles.formContenedor}>
        <form className={styles.form} onSubmit={alEnviar} noValidate>
          <div className={styles.cabecera}>
            <h1 className={styles.titulo}>{t('titulo')}</h1>
            <p className={styles.subtitulo}>{t('subtitulo')}</p>
          </div>

          <div className={styles.trampa} aria-hidden="true">
            <input type="text" name="web" tabIndex={-1} autoComplete="off" value={web} onChange={(evento) => setWeb(evento.target.value)} />
          </div>

          {/* "*" delante del placeholder = campo obligatorio (los mismos
              que comprueba alEnviar). */}
          <Input
            etiqueta={t('nombreCompleto')}
            etiquetaOculta
            nombre="nombreCompleto"
            placeholder={`*${t('nombreCompleto')}`}
            valor={nombreCompleto}
            onChange={(evento) => { setNombreCompleto(evento.target.value); setAvisoDatos(false); }}
          />
          <Input
            etiqueta={t('email')}
            etiquetaOculta
            tipo="email"
            nombre="email"
            placeholder={`*${t('email')}`}
            valor={email}
            onChange={(evento) => { setEmail(evento.target.value); setAvisoDatos(false); }}
          />
          <Input
            etiqueta={t('telefono')}
            etiquetaOculta
            tipo="tel"
            nombre="telefono"
            placeholder={`*${t('telefono')}`}
            valor={telefono}
            onChange={(evento) => { setTelefono(evento.target.value); setAvisoDatos(false); }}
          />

          <label className={styles.campo}>
            <span className={styles.etiquetaOculta}>{t('atelier')}</span>
            <select
              className={styles.select}
              name="ubicacion"
              value={ubicacion}
              onChange={conLimpieza(setUbicacion)}
            >
              <option value="">{t('atelierElige')}</option>
              {ATELIERES_CITA.map((atelier) => (
                <option key={atelier.id} value={atelier.id}>{atelier.nombre}</option>
              ))}
            </select>
          </label>

          <SelectorMesAnio
            valor={fechaEvento}
            onChange={(valor) => { setFechaEvento(valor); setAvisoDatos(false); }}
            meses={meses}
            textos={{ placeholder: t('fechaEvento'), anioAnterior: t('anioAnterior'), anioSiguiente: t('anioSiguiente') }}
          />

          <label className={styles.campo}>
            <span className={styles.etiquetaOculta}>{t('mensaje')}</span>
            <textarea
              className={styles.textarea}
              placeholder={t('mensaje')}
              value={mensaje}
              onChange={(evento) => setMensaje(evento.target.value)}
              rows={3}
            />
          </label>

          <label className={styles.legalFila}>
            <input
              type="checkbox"
              className={styles.legalCheckbox}
              checked={aceptaLegal}
              onChange={(evento) => { setAceptaLegal(evento.target.checked); setAvisoDatos(false); }}
            />
            <span className={styles.legalTexto}>
              {t.rich('aceptoLegal', {
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
      </div>
    </div>
  );
}
