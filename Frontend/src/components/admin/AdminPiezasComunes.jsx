'use client';

/* ============================================================
   ADMIN · MENÚ, PEDIR CITA Y NEWSLETTER — Fely Campo
   /admin/paginas/piezas-comunes: lo que sale en muchas páginas a la vez
   — las fotos del menú de la web, la banda «Pedir cita» (antes del pie),
   las tarjetas «Atelier … & Showroom» y la ventana de la newsletter —
   con el editor común (EditorPagina.jsx). Sin vista previa: salen en
   todas las páginas; «Ver la página publicada» abre la de inicio.
   Datos y reglas: lib/piezasComunes.js. Ver docs/ADMIN.md.
   ============================================================ */

import Link from 'next/link';
import {
  DESPLEGABLES_MENU, ID_PAGINA_PIEZAS, camposPiezasComunes,
} from '@/lib/piezasComunes';
import {
  IDS_SEDES, editorSede, esVideoSede, obtenerSede,
} from '@/lib/ateliers';
import EditorPagina from './EditorPagina';
import editorStyles from './EditorPagina.module.css';
import campos from './CamposEditor.module.css';
import styles from './AdminPiezasComunes.module.css';

const BLOQUES = [
  {
    id: 'menu',
    nombre: 'Fotos del menú',
    resumen: 'Los desplegables de arriba',
    descripcion: 'Al abrir cada apartado del menú de la web se ve su «Foto grande»; al pasar el ratón por un enlace, la de ese enlace. En el móvil, la foto grande sale encima de los enlaces, y la «Foto de entrada» antes de abrir ninguno.',
    datos: (d) => d.menu,
  },
  {
    id: 'pedirCita',
    nombre: 'Banda «Pedir cita»',
    resumen: 'Antes del pie de página',
    descripcion: 'La foto a todo el ancho con el título y el botón que lleva al formulario de cita. Sale al final de casi todas las páginas.',
    datos: (d) => d.pedirCita,
  },
  {
    id: 'ateliersCita',
    nombre: 'Tarjetas de los ateliers',
    resumen: 'Atelier … & Showroom',
    descripcion: 'Las tres tarjetas (Salamanca, Madrid, Oviedo) que salen encima de la banda «Pedir cita» en las páginas de los ateliers y de las colecciones.',
    datos: (d) => d.ateliersCita,
  },
  {
    id: 'newsletter',
    nombre: 'Ventana de la newsletter',
    resumen: 'Suscripción',
    descripcion: 'La ventana que se abre al pulsar «Newsletter» en el pie de página: foto a la izquierda, título y texto a la derecha.',
    datos: (d) => d.newsletter,
  },
];

// La portada de un atelier, si es una foto (un vídeo no vale para la tarjeta).
function fotoPortadaSede(id) {
  const { src } = obtenerSede(id).heroMedio;
  return esVideoSede(src) ? '' : src;
}

// Las fotos de las tarjetas: vacías = la portada de su atelier; obligatorias
// solo si esa portada es un vídeo (como en Madrid).
function camposConAteliers(datos) {
  return [
    ...camposPiezasComunes(datos),
    ...IDS_SEDES.map((id) => ({
      bloque: 'ateliersCita',
      nombre: `la foto de la tarjeta de ${obtenerSede(id).contacto.nombre}`,
      tipo: 'medio',
      valor: datos.ateliersCita[id],
      requerido: !fotoPortadaSede(id),
    })),
  ];
}

function AdminPiezasComunes() {
  return (
    <EditorPagina
      id={ID_PAGINA_PIEZAS}
      titulo="Menú, Pedir cita y newsletter"
      rutaWeb="/"
      bloques={BLOQUES}
      campos={camposConAteliers}
      conVistaPrevia={false}
    >
      {(bloque, h) => {
        if (bloque.id === 'menu') {
          return (
            <div className={styles.grupos}>
              {DESPLEGABLES_MENU.map(({ id, nombre, enlaces }) => (
                <section key={id} className={styles.grupo}>
                  <h3 className={editorStyles.grupoTitulo}>{nombre}</h3>
                  <div className={styles.rejilla}>
                    {h.medio(['menu', id, 'portada'], { etiqueta: 'Foto grande', proporcion: '16 / 9' })}
                    {enlaces.map(([clave, texto]) => (
                      <div key={clave}>
                        {h.medio(['menu', id, clave], { etiqueta: texto, proporcion: '3 / 4' })}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
              <section className={styles.grupo}>
                <h3 className={editorStyles.grupoTitulo}>Menú del móvil</h3>
                <div className={styles.rejilla}>
                  {h.medio(['menu', 'movil'], { etiqueta: 'Foto de entrada', proporcion: '16 / 9' })}
                </div>
              </section>
            </div>
          );
        }
        if (bloque.id === 'pedirCita') {
          return (
            <div className={editorStyles.medioYCampos}>
              <div className={editorStyles.fichaCampos}>
                {h.medio(['pedirCita', 'imagen'], { etiqueta: 'Foto de fondo', detalle: 'A todo el ancho', proporcion: '16 / 9' })}
              </div>
              <div className={editorStyles.fichaCampos}>
                {h.texto(['pedirCita', 'titulo'], {
                  etiqueta: 'Título',
                  largoRecomendado: 60,
                  ayuda: 'Si lleva un punto (o una coma), lo que va detrás pasa a la segunda línea.',
                })}
                {h.texto(['pedirCita', 'boton'], { etiqueta: 'Botón', largoRecomendado: 25 })}
              </div>
            </div>
          );
        }
        if (bloque.id === 'ateliersCita') {
          return (
            <div className={editorStyles.fichaCampos}>
              <div className={styles.rejillaAteliers}>
                {IDS_SEDES.map((id) => {
                  const portada = fotoPortadaSede(id);
                  return (
                    <div key={id}>
                      {h.medio(['ateliersCita', id], {
                        etiqueta: obtenerSede(id).contacto.nombre,
                        proporcion: '3 / 4',
                        opcional: Boolean(portada),
                        heredado: portada ? { src: portada, de: 'su página de atelier' } : undefined,
                      })}
                    </div>
                  );
                })}
              </div>
              <p className={campos.ayuda}>
                Si dejas una sin foto propia, sale la de portada de ese atelier
                {' '}(Madrid necesita la suya, porque su portada es un vídeo). La portada se cambia en
                {' '}
                {IDS_SEDES.map((id, indice) => (
                  <span key={id}>
                    {indice > 0 && ' · '}
                    <Link href={editorSede(id)} className="enlace-texto">{obtenerSede(id).contacto.nombre}</Link>
                  </span>
                ))}
                .
              </p>
              <div className={editorStyles.columnaTexto}>
                {h.texto(['ateliersCita', 'boton'], { etiqueta: 'Botón de las tarjetas', largoRecomendado: 25 })}
              </div>
            </div>
          );
        }
        return (
          <div className={editorStyles.medioYCampos}>
            <div className={editorStyles.fichaCampos}>
              {h.medio(['newsletter', 'imagen'], { etiqueta: 'Foto', proporcion: '3 / 4' })}
            </div>
            <div className={editorStyles.fichaCampos}>
              {h.texto(['newsletter', 'titulo'], { etiqueta: 'Título', largoRecomendado: 40 })}
              {h.texto(['newsletter', 'subtitulo'], {
                etiqueta: 'Texto', multilinea: true, filas: 4, largoRecomendado: 180,
              })}
            </div>
          </div>
        );
      }}
    </EditorPagina>
  );
}

export default AdminPiezasComunes;
