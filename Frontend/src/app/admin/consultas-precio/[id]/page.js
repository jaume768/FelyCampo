'use client';

/* ============================================================
   CONSULTA DE VESTIDO — detalle, como un folio A4 (y así se imprime
   con "Imprimir"), igual que la ficha de una cita: mismo diseño (usa
   los estilos de consultas/[id]/page.module.css) y mismas acciones.
   Todos los datos que la clienta envió desde el modal "Solicita
   información" (ver ModalSolicitudAtelier.jsx): vestido con su foto,
   color y enlace a la ficha, contacto, comentario, idioma y privacidad;
   más estado (botones, los mismos que Citas), historial y notas
   internas del equipo.
   Datos de EJEMPLO (consultasPrecioMock): cambiar estado y guardar
   notas solo muestran el aviso "(demo)" hasta que haya base de datos.
   ============================================================ */

import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import { Printer } from 'lucide-react';
import { BotonVolver, OrigenProductoBadge, useToast } from '@/components/admin';
import { Boton } from '@/components/ui';
import { consultasPrecioMock, ESTADOS_CITA } from '@/components/admin/mockData';
import { fechaHora, nombreIdioma } from '../../consultas/citasFormato';
import styles from '../../consultas/[id]/page.module.css';
import propios from './page.module.css';

function Dato({ etiqueta, children }) {
  return (
    <div className={styles.dato}>
      <p className={styles.datoEtiqueta}>{etiqueta}</p>
      <div className={styles.datoValor}>{children}</div>
    </div>
  );
}

export default function DetalleConsultaVestidoPage({ params }) {
  const { id } = use(params);
  const consulta = consultasPrecioMock.find((c) => c.id === id);

  const { mostrarToast } = useToast();
  const [estado, setEstado] = useState(consulta?.estado || 'Pendiente');
  const [notas, setNotas] = useState('');
  const [historial, setHistorial] = useState(
    consulta ? [{ estado: 'Pendiente', fecha: fechaHora(consulta.recibida) }] : []
  );

  if (!consulta) notFound();

  function cambiarEstado(nuevo) {
    if (nuevo === estado) return;
    setEstado(nuevo);
    const ahora = new Date();
    const fecha = fechaHora(`${ahora.toISOString().slice(0, 10)}T${ahora.toTimeString().slice(0, 5)}`);
    setHistorial([...historial, { estado: nuevo, fecha }]);
    mostrarToast(`Estado actualizado a "${nuevo}" (demo)`);
  }

  function guardarNotas() {
    mostrarToast('Notas internas guardadas (demo)');
  }

  const asuntoRespuesta = encodeURIComponent(`${consulta.producto} — Fely Campo`);
  const telefonoEnlace = consulta.telefono && `tel:${consulta.telefono.replace(/\s/g, '')}`;

  return (
    <div>
      <div className={styles.barra}>
        <BotonVolver href="/admin/consultas-precio" />
        <div className={styles.barraAcciones}>
          <Boton variante="contorno" href={`mailto:${consulta.email}?subject=${asuntoRespuesta}`}>Responder por email</Boton>
          {telefonoEnlace && <Boton variante="contorno" href={telefonoEnlace}>Llamar</Boton>}
          <Boton onClick={() => window.print()}>
            <span className={styles.botonIcono}><Printer size={16} strokeWidth={1.5} aria-hidden="true" />Imprimir</span>
          </Boton>
        </div>
      </div>

      <div className={styles.mesa}>
        <article className={styles.folio}>
          <header className={styles.cabecera}>
            <img src="/img/logo/fely-campo-logo.webp" alt="Fely Campo" className={styles.logo} />
            <div className={styles.cabeceraTexto}>
              <p className={styles.tipoDocumento}>Consulta de vestido</p>
              <p className={styles.recibida}>Recibida el {fechaHora(consulta.recibida)}</p>
            </div>
          </header>

          <h1 className={styles.nombre}>{consulta.nombre}</h1>

          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Vestido</h2>
            <div className={propios.vestido}>
              {consulta.imagen && <img src={consulta.imagen} alt="" className={propios.vestidoImagen} />}
              <div className={propios.vestidoInfo}>
                <OrigenProductoBadge tipo={consulta.tipo} />
                <p className={propios.vestidoNombre}>{consulta.producto}</p>
                <p className={propios.vestidoColor}>
                  {consulta.colorHex && <span className={propios.colorPunto} style={{ background: consulta.colorHex }} aria-hidden="true" />}
                  {consulta.color || 'Sin color elegido'}
                </p>
                {consulta.ruta && (
                  <a href={consulta.ruta} target="_blank" rel="noopener noreferrer" className={propios.vestidoEnlace}>
                    felycampo.com{consulta.ruta}
                  </a>
                )}
              </div>
            </div>
          </section>

          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Datos de la clienta</h2>
            <div className={styles.datos}>
              <Dato etiqueta="Email"><a href={`mailto:${consulta.email}`}>{consulta.email}</a></Dato>
              <Dato etiqueta="Teléfono">
                {telefonoEnlace ? <a href={telefonoEnlace}>{consulta.telefono}</a> : 'No lo ha dejado'}
              </Dato>
              <Dato etiqueta="Idioma">{nombreIdioma(consulta.locale)}</Dato>
              <Dato etiqueta="Privacidad y términos">{consulta.aceptaLegal ? 'Aceptados' : 'No aceptados'}</Dato>
            </div>
          </section>

          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Comentario</h2>
            <p className={styles.mensaje}>{consulta.mensaje || 'Sin comentario.'}</p>
          </section>

          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Gestión</h2>
            <div className={styles.estadoBloque}>
              <p className={styles.datoEtiqueta}>Estado</p>
              {/* Un clic = cambio de estado (queda en el historial). */}
              <div className={`${styles.estados} ${styles.soloPantalla}`} role="group" aria-label="Estado de la consulta">
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
              <span className={`${styles.datoValor} ${styles.soloImpresion}`}>{estado}</span>
            </div>
          </section>

          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Historial de estado</h2>
            <ul className={styles.historial}>
              {historial.map((h, i) => (
                <li key={i} className={styles.historialFila}>
                  <span>{h.fecha}</span>
                  <span>{h.estado}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Notas internas</h2>
            <div className={styles.soloPantalla}>
              <textarea className={styles.notas} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Solo las ve el equipo — disponibilidad, presupuesto, llamadas…" />
              <Boton variante="contorno" tamano="s" onClick={guardarNotas}>Guardar notas</Boton>
            </div>
            <p className={`${styles.notasImpresas} ${styles.soloImpresion}`}>{notas || 'Sin notas.'}</p>
          </section>
        </article>
      </div>
    </div>
  );
}
