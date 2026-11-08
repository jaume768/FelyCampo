'use client';

/* ============================================================
   ADMIN · PÁGINA DE INICIO — Fely Campo
   /admin/landing, sobre el editor común (EditorPagina.jsx). Bloques, en
   el orden de la web:
     1. Portada: foto (ordenador + móvil), vídeo (ordenador + móvil),
        frase y botón (con su enlace)
     2. Bloque Atelier: Novias | Fiesta (foto, título, botón, enlace)
     3. Descubre a Fely (foto, título, cita, botón, enlace)
   Datos y reglas: lib/landing.js. Ver docs/ADMIN.md.
   ============================================================ */

import {
  LARGO_RECOMENDADO, LIMITES_VIDEO, OPCIONALES_LANDING, PARAMETRO_PREVIA_LANDING, camposLanding,
} from '@/lib/landing';
import EditorPagina from './EditorPagina';
import styles from './EditorPagina.module.css';

const BLOQUES = [
  {
    id: 'portada',
    nombre: 'Portada',
    resumen: 'Foto, vídeo, frase y botón',
    descripcion: 'Foto y vídeo a pantalla completa, con una frase y un botón encima.',
    datos: (d) => d.hero,
  },
  {
    id: 'atelier',
    nombre: 'Bloque Atelier',
    resumen: 'Novias | Fiesta',
    descripcion: 'Dos fotos, una junto a otra, debajo de la portada. Es también la página «Atelier» (/atelier) entera: lo que cambies aquí sale en las dos.',
    datos: (d) => d.atelier,
  },
  {
    id: 'descubre',
    nombre: 'Descubre a Fely',
    resumen: 'Foto, cita y botón',
    descripcion: 'Foto de Fely con su cita.',
    datos: (d) => d.descubre,
  },
];

function Portada({ h }) {
  return (
    <>
      {/* Una diapositiva debajo de la otra, en el orden del carrusel. */}
      <div className={styles.diapositiva}>
        <p className={styles.grupoTitulo}>Diapositiva 1 · Foto</p>
        <div className={styles.diapositivaMedios}>
          {h.medio(['hero', 'imagen', 'escritorio'], { etiqueta: 'Ordenador', detalle: 'Horizontal', proporcion: '16 / 9' })}
          {h.medio(['hero', 'imagen', 'movil'], {
            etiqueta: 'Móvil',
            detalle: 'Vertical',
            proporcion: '9 / 16',
            opcional: true,
            heredado: { src: h.borrador.hero.imagen.escritorio, de: 'ordenador' },
          })}
        </div>
      </div>

      <div className={styles.division} />

      <div className={styles.diapositiva}>
        <p className={styles.grupoTitulo}>Diapositiva 2 · Vídeo</p>
        <div className={styles.diapositivaMedios}>
          {h.medio(['hero', 'video'], {
            etiqueta: 'Ordenador',
            detalle: 'Horizontal · MP4',
            tipo: 'video',
            proporcion: '16 / 9',
            orientacion: 'horizontal',
            limite: { ...LIMITES_VIDEO.ordenador, duracionAviso: LIMITES_VIDEO.duracionAviso },
          })}
          {h.medio(['hero', 'videoMovil'], {
            etiqueta: 'Móvil',
            detalle: 'Vertical · MP4',
            tipo: 'video',
            proporcion: '9 / 16',
            opcional: true,
            heredado: { src: h.borrador.hero.video, de: 'ordenador' },
            orientacion: 'vertical',
            limite: { ...LIMITES_VIDEO.movil, duracionAviso: LIMITES_VIDEO.duracionAviso },
          })}
        </div>
      </div>

      <div className={styles.division} />

      <p className={styles.grupoTitulo}>Texto sobre la portada</p>
      <div className={styles.portadaTextos}>
        {h.texto(['hero', 'texto'], { etiqueta: 'Frase', largoRecomendado: LARGO_RECOMENDADO.frase })}
        {h.texto(['hero', 'boton'], { etiqueta: 'Texto del botón', largoRecomendado: LARGO_RECOMENDADO.boton })}
        {h.enlace(['hero', 'enlace'], 'Enlace del botón')}
      </div>
    </>
  );
}

function Atelier({ h }) {
  return (
    <div className={styles.atelier}>
      {[['novias', 'Izquierda'], ['fiesta', 'Derecha']].map(([clave, lado]) => (
        <div key={clave} className={styles.ficha}>
          <p className={styles.grupoTitulo}>{lado}</p>
          <div className={styles.fichaCuerpo}>
            {h.medio(['atelier', clave, 'imagen'], { etiqueta: 'Foto', detalle: 'Vertical', proporcion: '3 / 4' })}
            <div className={styles.fichaCampos}>
              {h.texto(['atelier', clave, 'titulo'], { etiqueta: 'Título', largoRecomendado: LARGO_RECOMENDADO.titulo })}
              {h.texto(['atelier', clave, 'boton'], { etiqueta: 'Texto del botón', largoRecomendado: LARGO_RECOMENDADO.boton })}
              {h.enlace(['atelier', clave, 'enlace'])}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Descubre({ h }) {
  return (
    <div className={styles.descubre}>
      {h.medio(['descubre', 'imagen'], { etiqueta: 'Foto', detalle: 'Vertical', proporcion: '4 / 5' })}
      <div className={styles.fichaCampos}>
        {h.texto(['descubre', 'titulo'], { etiqueta: 'Título', largoRecomendado: LARGO_RECOMENDADO.titulo })}
        {h.texto(['descubre', 'cita'], {
          etiqueta: 'Cita',
          multilinea: true,
          largoRecomendado: LARGO_RECOMENDADO.cita,
          ayuda: 'Lo que escribas entre *asteriscos* saldrá en cursiva.',
        })}
        {h.texto(['descubre', 'boton'], { etiqueta: 'Texto del botón', largoRecomendado: LARGO_RECOMENDADO.boton })}
        {h.enlace(['descubre', 'enlace'])}
      </div>
    </div>
  );
}

const CONTENIDO = { portada: Portada, atelier: Atelier, descubre: Descubre };

function AdminLanding() {
  return (
    <EditorPagina
      id={PARAMETRO_PREVIA_LANDING}
      titulo="Página de inicio / Home"
      rutaWeb="/"
      bloques={BLOQUES}
      campos={camposLanding}
      opcionales={OPCIONALES_LANDING}
    >
      {(bloque, h) => {
        const Contenido = CONTENIDO[bloque.id];
        return <Contenido h={h} />;
      }}
    </EditorPagina>
  );
}

export default AdminLanding;
