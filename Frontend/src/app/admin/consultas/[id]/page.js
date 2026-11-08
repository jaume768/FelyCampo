'use client';

/* ============================================================
   CITA — detalle. Arriba, fuera del documento, lo que se hace con la
   cita: volver, contactar (copiar el email o el teléfono, escribir por
   WhatsApp), imprimir y la gestión (estado y atelier asignado). Debajo,
   la solicitud presentada como un folio A4 (y así se imprime con
   «Imprimir»: el menú, la barra y los controles se ocultan en
   impresión, ver layout.module.css y page.module.css), con los mismos
   datos que envía el formulario de cita de la web
   (/visita-fely-campo/cita → /api/cita): nombre, email, teléfono,
   atelier elegido, fecha del evento (mes y año), mensaje, idioma y
   privacidad; más el historial de estado y las notas internas.
   La cita empieza asignada al atelier que eligió la clienta; se puede
   pasar a otro atelier o a una boutique (puntoCercano.js).
   De la base de datos: cambiar estado/asignación y guardar notas se
   guarda al momento (antes, datos de ejemplo de citasMock).
   notas solo muestran el aviso "(demo)" hasta que haya base de datos.
   Sin «Responder por email» ni «Llamar»: los enlaces mailto:/tel: solo
   hacen algo si el ordenador tiene un programa de correo o de llamadas
   configurado; copiar y WhatsApp (WhatsApp Web) funcionan siempre.
   ============================================================ */

import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import { Copy, MessageCircle, Printer } from 'lucide-react';
import { BotonVolver, useToast } from '@/components/admin';
import { Boton } from '@/components/ui';
import { ESTADOS_CITA } from '@/components/admin/mockData';
import { useSolicitud } from '@/components/admin/useBandeja';
import { enlaceWhatsapp } from '@/lib/contacto';
import {
  fechaHora, mesAnio, nombreAtelier, nombreIdioma,
} from '../citasFormato';
import {
  ateliersPropios, boutiquesPorPais, puntoDeSede, puntoPorId,
} from '../puntoCercano';
import styles from './page.module.css';

function Dato({ etiqueta, children }) {
  return (
    <div className={styles.dato}>
      <p className={styles.datoEtiqueta}>{etiqueta}</p>
      <div className={styles.datoValor}>{children}</div>
    </div>
  );
}

export default function DetalleCitaPage({ params }) {
  const { id } = use(params);
  // De la base de datos (lib/solicitudesAdmin.js). Cada cambio se guarda al
  // momento; el historial lo escribe el servidor, con su fecha.
  const { item: cita, cargando, error, guardar } = useSolicitud('citas', id);

  const { mostrarToast } = useToast();
  const [notas, setNotas] = useState(null); // null = sin tocar: las guardadas

  if (cargando) return <p role="status" style={{ padding: 32 }}>Cargando…</p>;
  if (error === 'no-existe') notFound();
  if (error || !cita) return <p role="alert" style={{ padding: 32 }}>No se ha podido cargar la cita: {error}</p>;

  const estado = cita.estado;
  const historial = cita.historial;
  const textoNotas = notas ?? cita.notas ?? '';
  // En la base de datos empieza asignada al atelier elegido (su id de sede:
  // "salamanca"); el selector trabaja con ids de punto de venta.
  const asignado = (cita.asignado && puntoPorId(cita.asignado) ? cita.asignado : puntoDeSede(cita.asignado || cita.ubicacion)?.id) || '';

  async function cambiar(cambios, aviso) {
    try {
      await guardar(cambios);
      mostrarToast(aviso);
    } catch (e) {
      mostrarToast(`No se ha podido guardar: ${e.message}`, 6000);
    }
  }

  function cambiarEstado(nuevo) {
    if (nuevo === estado) return;
    cambiar({ estado: nuevo }, `Estado actualizado a "${nuevo}"`);
  }

  function cambiarAsignado(nuevoId) {
    const punto = puntoPorId(nuevoId);
    cambiar({ asignado: nuevoId }, punto ? `Asignada a ${punto.nombre}` : 'Sin asignar');
  }

  async function copiar(texto, que) {
    try {
      await navigator.clipboard.writeText(texto);
      mostrarToast(`${que} copiado: ${texto}`);
    } catch {
      mostrarToast(`No se ha podido copiar. ${que}: ${texto}`);
    }
  }

  const saludo = cita.locale === 'en'
    ? `Hello ${cita.nombre.split(' ')[0]}, this is Fely Campo about your appointment request.`
    : `Hola ${cita.nombre.split(' ')[0]}, te escribimos de Fely Campo por tu solicitud de cita.`;
  const puntoAsignado = puntoPorId(asignado);

  return (
    <div>
      {/* ---------- Arriba, fuera del documento: acciones y gestión ---------- */}
      <div className={styles.panel}>
        <div className={styles.barra}>
          <BotonVolver href="/admin/consultas" />
          <div className={styles.barraAcciones}>
            <Boton variante="contorno" onClick={() => copiar(cita.email, 'Email')}>
              <span className={styles.botonIcono}><Copy size={16} strokeWidth={1.5} aria-hidden="true" />Copiar email</span>
            </Boton>
            <Boton variante="contorno" onClick={() => copiar(cita.telefono, 'Teléfono')}>
              <span className={styles.botonIcono}><Copy size={16} strokeWidth={1.5} aria-hidden="true" />Copiar teléfono</span>
            </Boton>
            <Boton variante="contorno" href={enlaceWhatsapp(cita.telefono, saludo)} nuevaPestana>
              <span className={styles.botonIcono}><MessageCircle size={16} strokeWidth={1.5} aria-hidden="true" />Escribir por WhatsApp</span>
            </Boton>
            <Boton onClick={() => window.print()}>
              <span className={styles.botonIcono}><Printer size={16} strokeWidth={1.5} aria-hidden="true" />Imprimir</span>
            </Boton>
          </div>
        </div>

        <section className={styles.gestion} aria-label="Gestión de la cita">
          <div className={styles.gestionCampo}>
            <p className={styles.datoEtiqueta}>Estado</p>
            {/* Un clic = cambio de estado (queda en el historial). */}
            <div className={styles.estados} role="group" aria-label="Estado de la cita">
              {ESTADOS_CITA.map((opcion) => (
                <button
                  key={opcion}
                  type="button"
                  className={`${styles.estadoBoton} ${estado === opcion ? styles.estadoActivo : ''}`}
                  aria-pressed={estado === opcion}
                  onClick={() => cambiarEstado(opcion)}
                >
                  {opcion}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.gestionCampo}>
            <label htmlFor="cita-asignado" className={styles.datoEtiqueta}>Atelier asignado</label>
            <select id="cita-asignado" className={styles.selectInput} value={asignado} onChange={(e) => cambiarAsignado(e.target.value)}>
              <option value="">Sin asignar</option>
              <optgroup label="Ateliers Fely Campo">
                {ateliersPropios().map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </optgroup>
              {boutiquesPorPais().map(([pais, boutiques]) => (
                <optgroup key={pais} label={`Boutiques · ${pais}`}>
                  {boutiques.map((p) => <option key={p.id} value={p.id}>{p.nombre} — {p.direccion.at(-1)}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
        </section>
      </div>

      {/* ---------- El documento ---------- */}
      <div className={styles.mesa}>
        <article className={styles.folio}>
          <header className={styles.cabecera}>
            <img src="/img/logo/fely-campo-logo.webp" alt="Fely Campo" className={styles.logo} />
            <div className={styles.cabeceraTexto}>
              <p className={styles.tipoDocumento}>Solicitud de cita</p>
              <p className={styles.recibida}>Recibida el {fechaHora(cita.recibida)}</p>
            </div>
          </header>

          <h1 className={styles.nombre}>{cita.nombre}</h1>

          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Datos de la clienta</h2>
            <div className={styles.datos}>
              <Dato etiqueta="Email">{cita.email}</Dato>
              <Dato etiqueta="Teléfono">{cita.telefono}</Dato>
              <Dato etiqueta="Atelier elegido">{nombreAtelier(cita.ubicacion)}</Dato>
              <Dato etiqueta="Fecha del evento">{mesAnio(cita.fechaEvento)}</Dato>
              <Dato etiqueta="Idioma">{nombreIdioma(cita.locale)}</Dato>
              <Dato etiqueta="Privacidad y términos">{cita.aceptaLegal ? 'Aceptados' : 'No aceptados'}</Dato>
            </div>
          </section>

          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Mensaje</h2>
            <p className={styles.mensaje}>{cita.mensaje || 'Sin mensaje.'}</p>
          </section>

          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Gestión</h2>
            <div className={styles.datos}>
              <Dato etiqueta="Estado">{estado}</Dato>
              <Dato etiqueta="Atelier asignado">{puntoAsignado ? puntoAsignado.nombre : 'Sin asignar'}</Dato>
            </div>
          </section>

          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Historial de estado</h2>
            <ul className={styles.historial}>
              {historial.map((h, i) => (
                <li key={i} className={styles.historialFila}>
                  <span>{fechaHora(h.fecha)}</span>
                  <span>{h.estado}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Notas internas</h2>
            <div className={styles.soloPantalla}>
              <textarea className={styles.notas} value={textoNotas} onChange={(e) => setNotas(e.target.value)} placeholder="Solo las ve el equipo" />
              <Boton variante="contorno" tamano="s" onClick={() => cambiar({ notas: textoNotas }, 'Notas internas guardadas')}>Guardar notas</Boton>
            </div>
            <p className={`${styles.notasImpresas} ${styles.soloImpresion}`}>{textoNotas || 'Sin notas.'}</p>
          </section>
        </article>
      </div>
    </div>
  );
}
