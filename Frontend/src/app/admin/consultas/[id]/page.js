'use client';

import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import { PageHeader, BotonVolver, useToast } from '@/components/admin';
import { Boton } from '@/components/ui';
import { consultasMock, productosMock } from '@/components/admin/mockData';
import styles from './page.module.css';

export default function DetalleConsultaPage({ params }) {
  const { id } = use(params);
  const consultaOriginal = consultasMock.find((c) => c.id === id);

  const { mostrarToast } = useToast();
  const [estado, setEstado] = useState(consultaOriginal?.estado || 'Pendiente');
  const [notas, setNotas] = useState('');
  const [historial, setHistorial] = useState(
    consultaOriginal ? [{ estado: 'Pendiente', fecha: consultaOriginal.fecha }] : []
  );

  if (!consultaOriginal) notFound();

  const productoRelacionado = productosMock.find((p) => p.nombre === consultaOriginal.productoRelacionado);

  function cambiarEstado(nuevo) {
    setEstado(nuevo);
    setHistorial([...historial, { estado: nuevo, fecha: new Date().toISOString().slice(0, 10) }]);
    mostrarToast(`Estado actualizado a "${nuevo}" (demo)`);
  }

  function guardarNotas() {
    mostrarToast('Notas internas guardadas (demo)');
  }

  return (
    <div>
      <BotonVolver href="/admin/consultas" />
      <PageHeader titulo={consultaOriginal.asunto} subtitulo={`${consultaOriginal.tipo} — ${consultaOriginal.cliente.nombre}`} />

      <div className={styles.resumen}>
        <div>
          <p className={styles.resumenLabel}>Cliente</p>
          <p className={styles.resumenValor}>{consultaOriginal.cliente.nombre}</p>
          <p className={styles.resumenValor}>{consultaOriginal.cliente.email}</p>
        </div>
        <div>
          <p className={styles.resumenLabel}>Fecha solicitada</p>
          <p className={styles.resumenValor}>{consultaOriginal.fecha}</p>
        </div>
        <div>
          <p className={styles.resumenLabel}>Producto relacionado</p>
          <p className={styles.resumenValor}>
            {productoRelacionado ? (
              <Boton variante="texto" href={`/admin/productos/${productoRelacionado.id}`}>{productoRelacionado.nombre}</Boton>
            ) : 'Ninguno'}
          </p>
        </div>
      </div>

      <div className={styles.bloque}>
        <p className={styles.bloqueTitulo}>Mensaje original</p>
        <p className={styles.mensaje}>{consultaOriginal.mensaje}</p>
      </div>

      <div className={styles.bloque}>
        <p className={styles.bloqueTitulo}>Historial de estado</p>
        <ul className={styles.historial}>
          {historial.map((h, i) => (
            <li key={i} className={styles.historialFila}>
              <span>{h.fecha}</span>
              <span>{h.estado}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.bloque}>
        <p className={styles.bloqueTitulo}>Notas internas</p>
        <textarea className={styles.notas} value={notas} onChange={(e) => setNotas(e.target.value)} />
        <div>
          <Boton variante="contorno" tamano="s" onClick={guardarNotas}>Guardar notas</Boton>
        </div>
      </div>

      <div className={styles.bloque}>
        <p className={styles.bloqueTitulo}>Acciones</p>
        <div className={styles.accionesFila}>
          <label>
            <span className={styles.etiquetaCampo}>Cambiar estado</span>
            <select className={styles.selectInput} value={estado} onChange={(e) => cambiarEstado(e.target.value)}>
              <option value="Pendiente">Pendiente</option>
              <option value="Contactado">Contactado</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </label>
          <Boton variante="contorno" onClick={() => cambiarEstado('Cerrado')}>Marcar como cerrada</Boton>
        </div>
      </div>
    </div>
  );
}
