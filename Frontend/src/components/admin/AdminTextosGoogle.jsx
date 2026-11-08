'use client';

/* ============================================================
   ADMIN · TEXTOS DE GOOGLE — Fely Campo
   /admin/paginas/textos-google: el título y la descripción con que sale
   cada página fija en Google (y al compartirla en WhatsApp o redes), y el
   título principal oculto de las que no tienen uno visible. Con el editor
   común (EditorPagina.jsx): un bloque por grupo de páginas y, en cada
   página, cómo se vería el resultado en Google. Sin vista previa de la
   web: estos textos no se ven en la página.
   Las fichas de producto, las categorías, las colecciones de Runway y los
   artículos del blog generan los suyos solos a partir de sus datos.
   Datos y reglas: lib/seoTextos.js. Ver docs/ADMIN.md.
   ============================================================ */

import {
  GRUPOS_SEO, ID_PAGINA_SEO, LARGO_DESCRIPCION, LARGO_TITULO, camposSeo, validarExtraSeo,
} from '@/lib/seoTextos';
import EditorPagina from './EditorPagina';
import editorStyles from './EditorPagina.module.css';
import styles from './AdminTextosGoogle.module.css';

const DESCRIPCIONES = {
  inicio: 'La portada y las páginas de «Sobre Fely». Los artículos del blog generan los suyos solos con su título y su entradilla.',
  atelier: 'La entrada a Atelier, los tres ateliers, Vosotras y las páginas de las colecciones. Cada vestido, cada categoría y cada colección de Runway generan los suyos solos.',
  pretaporter: 'La tienda y sus categorías. Cada prenda genera los suyos sola con su nombre y su descripción.',
  donde: 'Visítanos, el formulario de cita y el mapa de puntos de venta.',
  legal: 'Aviso legal, privacidad, cookies y términos.',
};

const BLOQUES = GRUPOS_SEO.map(({ id, nombre, paginas }) => ({
  id,
  nombre,
  resumen: `${paginas.length} páginas`,
  descripcion: DESCRIPCIONES[id],
  datos: (d) => paginas.map(([ruta]) => d[ruta]),
}));

// Cómo se ve en los resultados de Google (aproximado: Google corta por
// ancho, no por letras, y a veces cambia la descripción por otro trozo).
function ResultadoGoogle({ ruta, idioma, textos }) {
  const migas = ['felycampo.com', idioma, ...ruta.split('/').filter(Boolean)].join(' › ');
  return (
    <div className={styles.google} aria-label="Así se vería en Google">
      <p className={styles.googleEtiqueta}>Así se vería en Google</p>
      <div className={styles.googleSitio}>
        <span className={styles.googleIcono} aria-hidden="true">F</span>
        <span>
          <span className={styles.googleNombre}>Fely Campo</span>
          <span className={styles.googleUrl}>{migas}</span>
        </span>
      </div>
      <p className={styles.googleTitulo}>{textos.title?.[idioma] || 'Sin título'}</p>
      <p className={styles.googleDescripcion}>{textos.description?.[idioma] || 'Sin descripción'}</p>
    </div>
  );
}

function AdminTextosGoogle() {
  return (
    <EditorPagina
      id={ID_PAGINA_SEO}
      titulo="Textos de Google"
      rutaWeb="/"
      bloques={BLOQUES}
      campos={camposSeo}
      validarExtra={validarExtraSeo}
      conVistaPrevia={false}
    >
      {(bloque, h) => {
        const { paginas } = GRUPOS_SEO.find((grupo) => grupo.id === bloque.id);
        return (
          <div className={styles.paginas}>
            {paginas.map(([ruta, nombre], indice) => {
              const textos = h.borrador[ruta];
              // La ayuda, solo en la primera página del bloque (no 28 veces).
              const ayuda = (texto) => (indice === 0 ? texto : undefined);
              return (
                <section key={ruta} className={styles.pagina}>
                  <div className={styles.paginaCabecera}>
                    <h3 className={styles.paginaNombre}>{nombre}</h3>
                    <a href={`/${h.idioma}${ruta === '/' ? '' : ruta}`} target="_blank" rel="noopener noreferrer" className="enlace-texto">
                      Ver la página
                    </a>
                  </div>
                  <div className={styles.paginaCuerpo}>
                    <div className={editorStyles.fichaCampos}>
                      {h.texto([ruta, 'title'], {
                        etiqueta: 'Título',
                        largoRecomendado: LARGO_TITULO,
                        ayuda: ayuda('La línea azul del resultado y el nombre de la pestaña. Lo importante primero y «| Fely Campo» al final.'),
                      })}
                      {h.texto([ruta, 'description'], {
                        etiqueta: 'Descripción',
                        multilinea: true,
                        filas: 3,
                        largoRecomendado: LARGO_DESCRIPCION,
                        ayuda: ayuda('Las dos líneas debajo del título: qué hay en la página y una invitación a entrar.'),
                      })}
                      {textos.h1 && h.texto([ruta, 'h1'], {
                        etiqueta: 'Título principal (oculto)',
                        largoRecomendado: 90,
                        ayuda: 'No se ve en la página (empieza con una foto), pero Google y los lectores de pantalla lo leen como su título.',
                      })}
                    </div>
                    <ResultadoGoogle ruta={ruta} idioma={h.idioma} textos={textos} />
                  </div>
                </section>
              );
            })}
          </div>
        );
      }}
    </EditorPagina>
  );
}

export default AdminTextosGoogle;
