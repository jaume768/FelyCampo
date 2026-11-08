'use client';

/* ============================================================
   ADMIN · PÁGINA DE PRÊT-À-PORTER (portada y descripción) — Fely Campo
   La pestaña «Página de la web» de Prêt-à-porter: el carrusel de fotos de
   la portada de /pret-a-porter y la descripción bajo el título, con el
   editor común (EditorPagina.jsx). Los productos están en la otra pestaña.
   Datos y reglas: lib/atelierEditorial.js. Ver docs/ADMIN.md.
   ============================================================ */

import { ID_PAGINA_PRET_A_PORTER, camposEditorialPretAPorter } from '@/lib/atelierEditorial';
import EditorPagina from './EditorPagina';
import editorStyles from './EditorPagina.module.css';

const BLOQUES = [
  {
    id: 'portada',
    nombre: 'Portada',
    resumen: 'El carrusel de fotos',
    descripcion: 'Las fotos de pasarela que pasan solas, sin parar, en la portada. Salen en este orden; arrastra para cambiarlo. Mejor recortes sin fondo (PNG o WebP transparente), como las de ahora.',
    datos: (d) => d.portada,
  },
  {
    id: 'descripcion',
    nombre: 'Descripción',
    resumen: 'Bajo el título',
    descripcion: 'El texto que presenta las prendas, bajo el título «Prêt-à-porter» y antes de los productos.',
    datos: (d) => d.descripcion,
  },
];

// "pestanas": las pestañas de la sección (Página | Productos), arriba.
function AdminPaginaPretAPorter({ pestanas }) {
  return (
    <EditorPagina
      id={ID_PAGINA_PRET_A_PORTER}
      titulo="Página de Prêt-à-porter"
      rutaWeb="/pret-a-porter"
      bloques={BLOQUES}
      campos={camposEditorialPretAPorter}
      migas="Prêt-à-porter"
      encabezado={pestanas}
    >
      {(bloque, h) => {
        if (bloque.id === 'portada') return h.galeria(['portada'], { columnas: 6, textoAnadir: 'Añadir fotos' });
        return (
          <div className={editorStyles.columnaTexto}>
            {h.texto(['descripcion'], { etiqueta: 'Texto', parrafos: true, filas: 5 })}
          </div>
        );
      }}
    </EditorPagina>
  );
}

export default AdminPaginaPretAPorter;
