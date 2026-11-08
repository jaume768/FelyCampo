'use client';

/* ============================================================
   ADMIN · CONTACTO Y REDES — Fely Campo
   /admin/contacto: el email de contacto, el botón flotante de WhatsApp
   y las redes sociales del pie. Un único sitio
   para toda la web, con el editor común (EditorPagina.jsx). Sin vista
   previa: son datos que salen en muchas páginas a la vez (el pie, el botón
   de WhatsApp…); «Ver la página publicada» abre la de inicio.
   Los datos de cada atelier (dirección, teléfonos, WhatsApp) están en su
   página: Atelier Salamanca, Showroom Madrid, Atelier Oviedo.
   Datos y reglas: lib/contacto.js. Ver docs/ADMIN.md.
   ============================================================ */

import Link from 'next/link';
import {
  ID_PAGINA_CONTACTO, REDES_SOCIALES, camposContacto, enlaceWhatsapp, validarExtraContacto,
} from '@/lib/contacto';
import { IDS_SEDES, editorSede, obtenerSede } from '@/lib/ateliers';
import CampoLinea from './CampoLinea';
import EditorPagina from './EditorPagina';
import editorStyles from './EditorPagina.module.css';
import campos from './CamposEditor.module.css';

const BLOQUES = [
  {
    id: 'contacto',
    nombre: 'Email de contacto',
    resumen: 'Avisos de los formularios',
    descripcion: 'El email general de Fely Campo: sale en los avisos de los formularios de cita y de consulta de un vestido («si no se envía, escríbenos a…»).',
    datos: (d) => [d.email],
  },
  {
    id: 'whatsapp',
    nombre: 'Botón de WhatsApp',
    resumen: 'El botón flotante',
    descripcion: 'El botón redondo que se ve abajo a la derecha en todas las páginas. Al pulsarlo se abre WhatsApp con este número y este mensaje ya escrito.',
    datos: (d) => [d.whatsapp, d.mensajeWhatsapp],
  },
  {
    id: 'redes',
    nombre: 'Redes sociales',
    resumen: 'En el pie de página',
    descripcion: 'Los enlaces de la columna «Síguenos» del pie de página (y lo que Google sabe de la marca). Deja vacía la que no uséis y no saldrá.',
    datos: (d) => d.redes,
  },
];

function AdminContacto() {
  return (
    <EditorPagina
      id={ID_PAGINA_CONTACTO}
      titulo="Contacto y redes"
      rutaWeb="/"
      bloques={BLOQUES}
      campos={camposContacto}
      validarExtra={validarExtraContacto}
      conVistaPrevia={false}
      migas="Dónde encontrarnos"
    >
      {(bloque, h) => {
        const linea = (ruta, props) => (
          <CampoLinea valor={h.leer(ruta) || ''} onChange={(valor) => h.cambiar(ruta, valor)} {...props} />
        );
        if (bloque.id === 'contacto') {
          return (
            <div className={editorStyles.columnaTexto}>
              <div className={editorStyles.fichaCampos}>
                {linea(['email'], { etiqueta: 'Email', tipo: 'email', placeholder: 'info@felycampo.com' })}
                <p className={campos.ayuda}>
                  Los datos de cada atelier (dirección, teléfonos, horario) se cambian en su página:{' '}
                  {IDS_SEDES.map((id, indice) => (
                    <span key={id}>
                      {indice > 0 && ' · '}
                      <Link href={editorSede(id)} className="enlace-texto">{obtenerSede(id).contacto.nombre}</Link>
                    </span>
                  ))}
                  .
                </p>
              </div>
            </div>
          );
        }
        if (bloque.id === 'whatsapp') {
          const { whatsapp, mensajeWhatsapp } = h.borrador;
          return (
            <div className={editorStyles.columnaTexto}>
              <div className={editorStyles.fichaCampos}>
                {linea(['whatsapp'], {
                  etiqueta: 'Número de WhatsApp', placeholder: '+34 659 00 62 57', ayuda: 'Con el prefijo del país (+34…). Tiene que ser un número con WhatsApp.',
                })}
                {h.texto(['mensajeWhatsapp'], {
                  etiqueta: 'Mensaje ya escrito', multilinea: true, filas: 3, largoRecomendado: 120, ayuda: 'Lo que aparece escrito al abrirse la conversación; la persona puede cambiarlo antes de enviarlo.',
                })}
                {whatsapp && (
                  <a
                    href={enlaceWhatsapp(whatsapp, mensajeWhatsapp?.[h.idioma] || mensajeWhatsapp?.es)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="enlace-texto"
                  >
                    Probar el botón (abre WhatsApp en otra pestaña)
                  </a>
                )}
              </div>
            </div>
          );
        }
        return (
          <div className={editorStyles.columnaTexto}>
            <div className={editorStyles.fichaCampos}>
              {REDES_SOCIALES.map(({ clave, nombre, ejemplo }) => (
                <div key={clave}>
                  {h.url(['redes', clave], { etiqueta: nombre, opcional: true, ayuda: `Por ejemplo: ${ejemplo}` })}
                </div>
              ))}
            </div>
          </div>
        );
      }}
    </EditorPagina>
  );
}

export default AdminContacto;
