'use client';

/* ============================================================
   VISTA PREVIA DE UN PRODUCTO DE PRÊT-À-PORTER — Fely Campo
   Con ?previa=pret-a-porter-producto, la ficha se pinta con el borrador
   que dejó el admin en este navegador (lib/previa.js). Se actualiza sola
   mientras se edita. Sin borrador, se vuelve a /pret-a-porter.
   Lo carga page.js solo cuando hace falta (next/dynamic).
   ============================================================ */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BarraPrevia from '@/components/layout/BarraPrevia';
import { EDITOR_PRET_A_PORTER, ID_PREVIA_PRODUCTO, productoParaWeb } from '@/lib/pretAPorter';
import { clavePrevia } from '@/lib/previa';
import FichaTiendaCuerpo from './FichaTiendaCuerpo';

function PreviaFichaTienda({
  locale, textos, publicados = [], hrefSeguirExplorando,
}) {
  const router = useRouter();
  const [borrador, setBorrador] = useState(null);
  const [comprobado, setComprobado] = useState(false);

  useEffect(() => {
    const clave = clavePrevia(ID_PREVIA_PRODUCTO);
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
  }, []);

  useEffect(() => {
    if (comprobado && !borrador) router.replace(`/${locale}/pret-a-porter`);
  }, [comprobado, borrador, router, locale]);

  if (!borrador) return null;

  const producto = productoParaWeb({ ...borrador, nombre: borrador.nombre || 'Producto' });
  const descripcion = locale === 'en' && producto.descripcionEn ? producto.descripcionEn : producto.descripcion;
  const relacionados = publicados.filter((otro) => otro.nombre !== producto.nombre).slice(0, 10);

  return (
    <FichaTiendaCuerpo
      producto={producto}
      descripcion={descripcion}
      locale={locale}
      relacionados={relacionados}
      textos={textos}
      hrefSeguirExplorando={hrefSeguirExplorando}
      despues={<BarraPrevia editor={`${EDITOR_PRET_A_PORTER}?producto=${borrador.id || 'nuevo'}`} />}
    />
  );
}

export default PreviaFichaTienda;
