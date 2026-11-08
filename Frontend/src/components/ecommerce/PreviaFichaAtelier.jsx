'use client';

/* ============================================================
   VISTA PREVIA DE UN LOOK DE ATELIER (Fiesta, Novias) — Fely Campo
   Con ?previa=fiesta-look o ?previa=novias-look, la ficha del look se
   pinta con el borrador que dejó el admin en este navegador:
   { look, coleccion } (ver lib/previa.js). Se actualiza sola mientras se
   edita. Sin borrador, se vuelve al listado de la sección.
   Lo cargan atelier/fiesta/[producto]/page.js y atelier/novias/[producto]/
   page.js solo cuando hace falta (next/dynamic).
   ============================================================ */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BarraPrevia from '@/components/layout/BarraPrevia';
import { ID_PREVIA_LOOK_FIESTA, lookAProducto } from '@/lib/catalogoFiesta';
import { ID_PREVIA_LOOK_NOVIAS, lookAProductoNovia } from '@/lib/catalogoNovias';
import { sinNumeroColeccion } from '@/lib/nombreColeccion';
import { clavePrevia } from '@/lib/previa';
import FichaAtelierCuerpo from './FichaAtelierCuerpo';

const SECCIONES = {
  fiesta: { idPrevia: ID_PREVIA_LOOK_FIESTA, aProducto: lookAProducto, editor: '/admin/colecciones/fiesta' },
  novias: { idPrevia: ID_PREVIA_LOOK_NOVIAS, aProducto: lookAProductoNovia, editor: '/admin/colecciones/novia' },
};

// "publicados": los looks publicados de la sección (del servidor), para
// los relacionados. "textos": los de la ficha, ya traducidos.
function PreviaFichaAtelier({
  seccion, locale, textos, publicados = [],
}) {
  const router = useRouter();
  const { idPrevia, aProducto, editor } = SECCIONES[seccion];
  const [borrador, setBorrador] = useState(null);
  const [comprobado, setComprobado] = useState(false);

  useEffect(() => {
    const clave = clavePrevia(idPrevia);
    const leer = () => {
      try {
        return JSON.parse(localStorage.getItem(clave) || 'null');
      } catch {
        return null;
      }
    };
    setBorrador(leer());
    setComprobado(true);
    const alCambiar = (evento) => { if (evento.key === clave) setBorrador(leer()); };
    window.addEventListener('storage', alCambiar);
    return () => window.removeEventListener('storage', alCambiar);
  }, [idPrevia]);

  useEffect(() => {
    if (comprobado && !borrador) router.replace(`/${locale}/atelier/${seccion}`);
  }, [comprobado, borrador, router, locale, seccion]);

  if (!borrador?.look || !borrador?.coleccion) return null;

  const { look, coleccion } = borrador;
  const producto = aProducto({ ...look, nombre: look.nombre || 'Look' }, coleccion);
  const descripcion = locale === 'en' && producto.descripcionEn ? producto.descripcionEn : producto.descripcion;
  const relacionados = publicados.filter((otro) => otro.nombre !== producto.nombre).slice(0, 10);

  return (
    <FichaAtelierCuerpo
      producto={producto}
      nombreVisible={sinNumeroColeccion(producto.nombre)}
      descripcion={descripcion}
      relacionados={relacionados}
      seccion={seccion}
      locale={locale}
      textos={textos}
      despues={<BarraPrevia editor={`${editor}?categoria=${coleccion.id}&look=${look.id || 'nuevo'}`} />}
    />
  );
}

export default PreviaFichaAtelier;
