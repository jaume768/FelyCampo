'use client';

/* ============================================================
   CABECERA DE PÁGINA, con vista previa — Fely Campo
   Para las páginas que son sobre todo un listado (Blog & Podcast,
   Vosotras, Runway, Visítanos, Puntos de venta): su cabecera y sus textos
   de entrada salen de lib/cabeceras.js y se editan en el admin.
     <CabeceraPagina id="blog" publicado={obtenerCabecera('blog')}>
       <HeroCabecera className={…} />
       …el resto de la página (puede leer useCabecera('blog'))…
     </CabeceraPagina>
   Con ?previa=cabecera-<id> desde el admin pinta el borrador (usePrevia)
   y la barra de vista previa; si no, lo publicado.
   ============================================================ */

import { createContext, useContext } from 'react';
import { useLocale } from 'next-intl';
import { idPaginaCabecera, obtenerCabecera, PAGINAS_CABECERA } from '@/lib/cabeceras';
import { textoEn } from '@/lib/previa';
import BarraPrevia from './BarraPrevia';
import HeroPagina from './HeroPagina';
import ProductHero from './ProductHero';
import usePrevia from './usePrevia';

const CabeceraContext = createContext(null);

export function CabeceraPagina({ id, publicado, children }) {
  const { datos, enPrevia } = usePrevia(idPaginaCabecera(id), publicado);
  return (
    <CabeceraContext.Provider value={{ id, datos }}>
      {children}
      {enPrevia && <BarraPrevia editor={PAGINAS_CABECERA[id].editor} />}
    </CabeceraContext.Provider>
  );
}

// Los datos de una cabecera: los de la página (con su vista previa) si se
// está dentro de ella; si no, lo publicado (p. ej. el mapa de Puntos de
// venta al final de Visítanos).
export function useCabecera(id) {
  const contexto = useContext(CabeceraContext);
  return contexto?.id === id ? contexto.datos : obtenerCabecera(id);
}

// Un texto de la cabecera en el idioma de la página.
export function useTextoCabecera(id) {
  const datos = useCabecera(id);
  const locale = useLocale();
  return (ruta) => textoEn(ruta.split('.').reduce((nodo, clave) => nodo?.[clave], datos), locale);
}

// La foto con el título y el subtítulo. "producto": el formato de las
// páginas de catálogo (ProductHero); si no, HeroPagina.
export function HeroCabecera({ producto = false, className, alt }) {
  const { id, datos } = useContext(CabeceraContext);
  const texto = useTextoCabecera(id);
  const Hero = producto ? ProductHero : HeroPagina;
  return (
    <Hero
      imagen={datos.imagen}
      alt={alt ?? (producto ? '' : texto('titulo'))}
      titulo={texto('titulo')}
      subtitulo={texto('subtitulo')}
      className={className}
    />
  );
}

export default CabeceraPagina;
