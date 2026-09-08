// ModalSolicitudAtelier.jsx

'use client';

/* ============================================================
   SOLICITUD DE INFORMACIÓN — ATELIER — Fely Campo
   Modal (ver ui/Modal.jsx) que abre InfoAtelier.jsx al pulsar
   "Contacta con nosotros" — pide talla + datos de contacto +
   comentario opcional, con el producto y el color ya elegidos como
   contexto fijo (no editable aquí, ver "resumen" más abajo).
   CONECTADO a POST /api/v1/catalog/enquiries/. Ojo con lo que ese
   endpoint hace y lo que NO hace: envía un correo al equipo comercial
   y **no guarda ninguna fila en base de datos** (decisión tomada: por
   ahora solo correo). Es decir, no existe un listado de consultas que
   consultar después — /admin/consultas del panel sigue con datos de
   ejemplo. Ver docs/CONTRATO.md, C-12.
   Límite de ritmo estricto (`enquiry`, 5/hora, porque dispara correos):
   un 429 es un caso a contemplar, no un fallo del código.
   "resumen" (foto + nombre + color elegido): mismo diseño que
   .panelProducto de RunwayGaleria.jsx ("Consigue el look"), sin su
   botón "+" flotante (aquí no se añade nada a la cesta, es solo
   contexto de la solicitud) y con el color ya elegido debajo del
   nombre en vez de al lado de la foto.
   "tallas" (por defecto TALLAS_DISPONIBLES, ver guiaTallasData.js): la
   talla se pide siempre, no solo si el producto trae el prop — misma
   escala (36 a 64) que el resto del sitio. Al final de ese mismo
   campo, "Guía de tallas" abre GuiaTallas.jsx — mismo mecanismo que
   .filaTalla en FichaProductoAcciones.jsx (Tienda), aquí dentro del
   propio campo de Talla en vez de en una fila aparte.
   Uso:
     <ModalSolicitudAtelier abierto={abierto} onCerrar={...}
       imagen="/img/aurora.jpg" producto="Vestido Aurora" color="Marfil"
       colorHex="#F5F1EE" />
   ============================================================ */

import { useState } from 'react';
import { catalog } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/errors';
import { useTranslations } from 'next-intl';
import { Modal, Boton, SelectorTalla, Input } from '../ui';
import { TALLAS_DISPONIBLES } from './guiaTallasData';
import GuiaTallas from './GuiaTallas';
import styles from './ModalSolicitudAtelier.module.css';

function ModalSolicitudAtelier({ abierto, onCerrar, imagen, producto, productoSlug, color, colorHex, tallas = TALLAS_DISPONIBLES }) {
  const t = useTranslations('solicitudAtelier');
  const tGuia = useTranslations('guiaTallas');
  const [talla, setTalla] = useState(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [comentario, setComentario] = useState('');
  const [avisoTalla, setAvisoTalla] = useState(false);
  const [avisoDatos, setAvisoDatos] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  // Errores del backend por campo, no el JSON crudo.
  const [erroresCampo, setErroresCampo] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [guiaAbierta, setGuiaAbierta] = useState(false);

  const alEnviar = async (evento) => {
    evento.preventDefault();
    if (!talla) {
      setAvisoTalla(true);
      return;
    }
    if (!nombre.trim() || !email.trim()) {
      setAvisoDatos(true);
      return;
    }
    setAvisoDatos(false);
    setErroresCampo({});
    setErrorGeneral(null);

    // El backend identifica el producto por SLUG aquí (SlugRelatedField), no por UUID.
    if (!productoSlug) {
      setErrorGeneral(t('errorEnvio'));
      return;
    }

    setEnviando(true);
    try {
      // OJO: este endpoint es fire-and-forget — envía un correo y NO guarda fila en base
      // de datos (decidido: por ahora solo correo). No hay listado que consultar después.
      // Límite de ritmo estricto (`enquiry`, 5/hora): el 429 es un caso normal, no un bug.
      await catalog.enviarConsultaProducto({
        product: productoSlug,
        name: nombre.trim(),
        email: email.trim(),
        phone: telefono.trim(),
        message: [comentario.trim(), `Talla: ${talla}`, color ? `Color: ${color}` : null]
          .filter(Boolean)
          .join('\n'),
      });
      setEnviado(true);
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      // Validación campo a campo, traducida donde la tenemos; el detalle del backend
      // cuando es más específico que nuestro texto genérico.
      if (error.isValidationError && Object.keys(error.details || {}).length) {
        setErroresCampo(error.details);
      } else if (error.status === 429) {
        setErrorGeneral(t('errorDemasiadas'));
      } else if (error.isNetworkError) {
        setErrorGeneral(t('errorRed'));
      } else {
        setErrorGeneral(error.firstDetail ?? t('errorEnvio'));
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <Modal abierto={abierto} onCerrar={onCerrar}>
        {enviado ? (
          <div className={styles.confirmacion}>
            <h2 className={styles.titulo}>{t('confirmacionTitulo')}</h2>
            <p>{t('confirmacionTexto')}</p>
            <Boton variante="solido" tamano="full" onClick={onCerrar}>{t('cerrar')}</Boton>
          </div>
        ) : (
          <form className={styles.form} onSubmit={alEnviar}>
            <h2 className={styles.titulo}>{t('titulo')}</h2>
            <p className={styles.subtitulo}>{t('subtitulo')}</p>

            <div className={styles.resumen}>
              {imagen && (
                <img src={imagen} alt="" className={styles.resumenImagen} />
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

            <div className={styles.campo}>
              <span className={styles.etiqueta}>{t('talla')}</span>
              {/* Sin tallas agotadas: el atelier trabaja a medida, no contra stock —
                  aquí se pide la talla como referencia, no como disponibilidad. */}
              <SelectorTalla
                tallas={tallas}
                agotadas={[]}
                seleccionada={talla}
                onSelect={(valor) => { setTalla(valor); setAvisoTalla(false); }}
              />
              {avisoTalla && <p className={styles.aviso}>{t('avisoTalla')}</p>}
              <div className={styles.filaTalla}>
                <Boton variante="texto" onClick={() => setGuiaAbierta(true)}>{tGuia('abrir')}</Boton>
              </div>
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

            {avisoDatos && <p className={styles.aviso}>{t('avisoDatos')}</p>}
            {/* Errores del backend campo a campo, no el JSON crudo. */}
            {Object.entries(erroresCampo).map(([campo, mensajes]) => (
              <p key={campo} className={styles.aviso} role="alert">
                {Array.isArray(mensajes) ? mensajes[0] : String(mensajes)}
              </p>
            ))}
            {errorGeneral && <p className={styles.aviso} role="alert">{errorGeneral}</p>}

            <Boton variante="solido" tamano="full" type="submit" disabled={enviando}>{enviando ? t('enviando') : t('enviar')}</Boton>
          </form>
        )}
      </Modal>

      <GuiaTallas abierto={guiaAbierta} onCerrar={() => setGuiaAbierta(false)} />
    </>
  );
}

export default ModalSolicitudAtelier;
