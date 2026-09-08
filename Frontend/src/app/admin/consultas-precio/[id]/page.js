'use client';

import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import {
  PageHeader, TablaAdmin, BotonVolver, OrigenProductoBadge, useToast,
} from '@/components/admin';
import { Boton } from '@/components/ui';
import {
  consultasPrecioMock, productosMock, clientesMock, coloresMock,
} from '@/components/admin/mockData';
import { CONFIG_ESTADO_CONTACTO } from '@/components/admin/EstadoContactoBadge';
import styles from './page.module.css';

const ESTADOS_CONTACTO_ORDEN = ['Pendiente', 'Contactado'];

function colorHex(nombre) {
  return coloresMock.find((c) => c.nombre.es === nombre)?.hex || '';
}

export default function DetalleConsultaPrecioPage({ params }) {
  const { id } = use(params);
  const consultaOriginal = consultasPrecioMock.find((c) => c.id === id);

  const { mostrarToast } = useToast();
  const [estado, setEstado] = useState(consultaOriginal?.estado || 'Pendiente');
  const [notas, setNotas] = useState(consultaOriginal?.notasInternas || '');

  if (!consultaOriginal) notFound();

  const productoRelacionado = productosMock.find((p) => p.nombre === consultaOriginal.producto);
  const cliente = consultaOriginal.clienteId ? clientesMock.find((c) => c.id === consultaOriginal.clienteId) : null;

  function cambiarEstado(nuevo) {
    setEstado(nuevo);
    mostrarToast(`Estado actualizado a "${CONFIG_ESTADO_CONTACTO[nuevo === 'Pendiente' ? 'pendiente' : 'contactado'].etiqueta}" (demo)`);
  }

  function guardarNotas() {
    mostrarToast('Notas internas guardadas (demo)');
  }

  return (
    <div>
      <div className={styles.cabeceraSuperior}>
        <BotonVolver href="/admin/consultas-precio" />
        <div className={styles.estadoSelector}>
          {ESTADOS_CONTACTO_ORDEN.map((valor) => {
            const clase = valor === 'Pendiente' ? 'pendiente' : 'contactado';
            const etiqueta = valor === 'Pendiente' ? 'Pendiente de contactar' : 'Contactado';
            const activo = estado === valor;
            return (
              <button
                key={valor}
                type="button"
                className={`${styles.estadoBoton} ${styles[clase]} ${activo ? styles.estadoBotonActivo : ''}`}
                aria-pressed={activo}
                onClick={() => cambiarEstado(valor)}
              >
                {etiqueta}
              </button>
            );
          })}
        </div>
      </div>
      <PageHeader titulo={consultaOriginal.producto} subtitulo={`Consulta de precio — ${consultaOriginal.nombre}`} />

      <div className={styles.resumen}>
        <div>
          <p className={styles.resumenLabel}>Contacto</p>
          <p className={styles.resumenValor}>{consultaOriginal.nombre}</p>
          <p className={styles.resumenValor}>{consultaOriginal.email}</p>
          <p className={styles.resumenValor}>{consultaOriginal.telefono}</p>
        </div>
        <div>
          <p className={styles.resumenLabel}>Fecha</p>
          <p className={styles.resumenValor}>{consultaOriginal.fecha}</p>
        </div>
        <div>
          <p className={styles.resumenLabel}>Cliente registrado</p>
          <p className={styles.resumenValor}>
            {cliente ? (
              <Boton variante="texto" href={`/admin/clientes/${cliente.id}`}>Ver ficha de {cliente.nombre}</Boton>
            ) : 'No — visitante sin cuenta'}
          </p>
        </div>
      </div>

      <div className={styles.bloque}>
        <p className={styles.bloqueTitulo}>Producto de interés</p>
        <TablaAdmin
          columnas={[
            {
              clave: 'imagen',
              etiqueta: '',
              render: () => (productoRelacionado?.imagen
                ? <img src={productoRelacionado.imagen} alt="" className={styles.itemImagen} />
                : <span className={styles.itemImagen} />),
            },
            {
              clave: 'producto',
              etiqueta: 'Producto',
              render: () => (
                <div>
                  <div className={styles.origenFila}><OrigenProductoBadge producto={consultaOriginal.producto} /></div>
                  {consultaOriginal.producto}
                </div>
              ),
            },
            {
              clave: 'color',
              etiqueta: 'Color',
              render: () => (consultaOriginal.color ? (
                <span className={styles.colorFila}>
                  {colorHex(consultaOriginal.color) && <span className={styles.colorPunto} style={{ background: colorHex(consultaOriginal.color) }} aria-hidden="true" />}
                  {consultaOriginal.color}
                </span>
              ) : '—'),
            },
          ]}
          filas={[consultaOriginal]}
          claveFila={() => consultaOriginal.id}
          hrefFila={() => (productoRelacionado ? `/admin/productos/${productoRelacionado.id}` : undefined)}
        />
      </div>

      {consultaOriginal.mensaje && (
        <div className={styles.bloque}>
          <p className={styles.bloqueTitulo}>Mensaje</p>
          <p className={styles.mensaje}>{consultaOriginal.mensaje}</p>
        </div>
      )}

      <div className={styles.bloque}>
        <p className={styles.bloqueTitulo}>Notas internas</p>
        <p className={styles.etiquetaCampo}>Visibles solo para el equipo — seguimiento de llamadas, disponibilidad, etc.</p>
        <textarea className={styles.notas} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Ej. Enviado presupuesto por email, pendiente de respuesta." />
        <div>
          <Boton variante="contorno" tamano="s" onClick={guardarNotas}>Guardar notas</Boton>
        </div>
      </div>
    </div>
  );
}
