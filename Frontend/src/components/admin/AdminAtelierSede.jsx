'use client';

/* ============================================================
   ADMIN · UN ATELIER (Salamanca, Madrid, Oviedo) — Fely Campo
   /admin/ateliers/<id>: la página /atelier-fiesta/<id> y los datos de
   contacto de la sede, con el editor común (EditorPagina.jsx: vista
   previa en vivo, Español | English y «Guardar y publicar»). Bloques, en
   el orden de la web:
     · Portada: foto o vídeo (en vídeo: otro para móvil y la imagen
       mientras carga, opcionales)
     · Presentación: el texto bajo la portada
     · Foto o vídeo grande (una foto vertical puede verse entera)
     · Cada sección: foto, título y texto. Se añaden, se mueven (subir /
       bajar) y se quitan; en la web alternan de lado solas.
     · Fotos del final: fotos y vídeos, reordenables (hasta 10)
     · Dirección y contacto: también salen en Visítanos (con sus fotos)
       y en la cita
   La portada lleva además el nombre de la ciudad y lo que va antes
   («Atelier», «Atelier & Showroom»).
   Datos y reglas: lib/ateliers.js. Ver docs/ADMIN.md.
   ============================================================ */

import {
  MAXIMO_FOTOS_FINAL, MAXIMO_FOTOS_TARJETA, OPCIONALES_SEDE, camposSede, esVideoSede, idPaginaSede, nuevaSeccion, rutaWebSede,
} from '@/lib/ateliers';
import CampoLinea from './CampoLinea';
import ControlesLista, { BotonAnadir } from './ControlesLista';
import EditorPagina from './EditorPagina';
import { usePagina } from './Paginas';
import editorStyles from './EditorPagina.module.css';
import segmentos from './AdminVosotras.module.css';
import campos from './CamposEditor.module.css';
import styles from './AdminColeccionesAtelier.module.css';
import controles from './ControlesLista.module.css';

// Los bloques salen del borrador: al añadir o quitar una sección, el
// índice de la izquierda cambia al momento.
function bloquesEditor(datos) {
  return [
    {
      id: 'portada', nombre: 'Portada', resumen: 'Ciudad y foto o vídeo', descripcion: 'La foto (o el vídeo) a todo el ancho con la que se abre la página, con el nombre de la ciudad encima.', datos: (d) => [d.nombreCiudad, d.etiqueta, d.heroMedio],
    },
    {
      id: 'descripcion', nombre: 'Presentación', resumen: 'El texto de entrada', descripcion: 'El texto que presenta el atelier, bajo la portada.', datos: (d) => d.descripcion,
    },
    {
      id: 'medio', nombre: 'Foto o vídeo grande', resumen: 'Bajo la presentación', descripcion: 'La foto (o el vídeo) grande que va justo debajo del texto de presentación.', datos: (d) => d.medioSuperior,
    },
    ...datos.secciones.map((seccion, indice) => ({
      id: seccion.id,
      nombre: `Sección ${indice + 1}`,
      resumen: seccion.titulo.es || 'Nueva',
      descripcion: `Foto con su título y su texto. La foto va ${indice % 2 === 0 ? 'a la izquierda' : 'a la derecha'} del texto (alternan solas: si mueves una sección, cambia de lado).`,
      datos: (d) => d.secciones.find((otra) => otra.id === seccion.id),
    })),
    // Sin secciones: un bloque para poder añadir la primera.
    ...(datos.secciones.length === 0 ? [{
      id: 'sin-secciones', nombre: 'Secciones', resumen: 'Ninguna', descripcion: 'Bloques de foto con su título y su texto, bajo la foto grande.', datos: (d) => d.secciones,
    }] : []),
    {
      id: 'galeria', nombre: 'Fotos del final', resumen: 'Fotos y vídeos', descripcion: `Las fotos (y vídeos) que cierran la página, en este orden; arrastra para cambiarlo. Hasta 5 van en una fila; con más (hasta ${MAXIMO_FOTOS_FINAL}), se colocan en filas. En el móvil pasan de lado.`, datos: (d) => d.imagenesTira,
    },
    {
      id: 'contacto', nombre: 'Dirección y contacto', resumen: 'También en Visítanos', descripcion: 'La dirección, los teléfonos y el horario. Salen en esta página, en la tarjeta de la sede en «Visítanos» y en el formulario de pedir cita.', datos: (d) => d.contacto,
    },
  ];
}

// Botones de elegir una opción (Foto | Vídeo…), como en el resto del panel.
function Segmentado({
  etiqueta, opciones, valor, onChange,
}) {
  return (
    <div>
      <p className={campos.etiqueta}>{etiqueta}</p>
      <div className={segmentos.segmentado} role="radiogroup" aria-label={etiqueta}>
        {opciones.map(([clave, texto]) => (
          <button
            key={String(clave)}
            type="button"
            role="radio"
            aria-checked={valor === clave}
            className={`${segmentos.segmento} ${valor === clave ? segmentos.segmentoActivo : ''}`}
            onClick={() => onChange(clave)}
          >
            {texto}
          </button>
        ))}
      </div>
    </div>
  );
}

const FOTO_O_VIDEO = [['imagen', 'Foto'], ['video', 'Vídeo']];

function Portada({ h }) {
  const medio = h.borrador.heroMedio;
  const esVideo = medio.tipo === 'video';
  return (
    <>
      <div className={`${editorStyles.dosColumnas} ${styles.filaCiudad}`}>
        {h.texto(['etiqueta'], {
          etiqueta: 'Lo que va antes de la ciudad', largoRecomendado: 20, ayuda: 'Por ejemplo «Atelier» o «Atelier & Showroom».',
        })}
        {h.texto(['nombreCiudad'], {
          etiqueta: 'Ciudad', largoRecomendado: 15, ayuda: 'El nombre grande de la portada. Sale también en las tarjetas «Atelier … & Showroom».',
        })}
      </div>
      <div className={styles.filaCiudad}>
        {h.texto(['subtitulo'], { etiqueta: 'Frase bajo la ciudad', largoRecomendado: 50 })}
      </div>
      <div className={editorStyles.medioYCampos}>
      {h.medio(['heroMedio', 'src'], {
        etiqueta: esVideo ? 'Vídeo' : 'Foto', tipo: medio.tipo, detalle: 'Horizontal', proporcion: '16 / 9', orientacion: 'horizontal',
      })}
      <div className={editorStyles.fichaCampos}>
        <Segmentado
          etiqueta="Foto o vídeo"
          opciones={FOTO_O_VIDEO}
          valor={medio.tipo}
          onChange={(tipo) => {
            if (tipo === medio.tipo) return;
            h.cambiar(['heroMedio'], (actual) => ({
              ...actual, tipo, src: '', srcMovil: '', poster: '',
            }));
          }}
        />
        {esVideo && (
          <>
            {h.medio(['heroMedio', 'srcMovil'], {
              etiqueta: 'Vídeo para el móvil', tipo: 'video', detalle: 'Vertical', proporcion: '9 / 16', opcional: true, vacio: 'Si no pones ninguno, en el móvil sale el mismo vídeo.',
            })}
            {h.medio(['heroMedio', 'poster'], {
              etiqueta: 'Imagen mientras carga el vídeo', detalle: 'Horizontal', proporcion: '16 / 9', opcional: true,
            })}
          </>
        )}
        <Segmentado
          etiqueta="Encuadre en la pantalla"
          opciones={[['', 'Centrado'], ['arriba', 'Pegado arriba']]}
          valor={medio.encuadre || ''}
          onChange={(encuadre) => h.cambiar(['heroMedio', 'encuadre'], encuadre)}
        />
        <p className={campos.ayuda}>«Pegado arriba» evita que se corten las cabezas si la foto o el vídeo tienen gente cerca del borde de arriba.</p>
      </div>
      </div>
    </>
  );
}

function MedioGrande({ h }) {
  const medio = h.borrador.medioSuperior;
  const esVideo = medio.tipo === 'video';
  return (
    <div className={editorStyles.medioYCampos}>
      {h.medio(['medioSuperior', 'src'], {
        etiqueta: esVideo ? 'Vídeo' : 'Foto', tipo: medio.tipo, detalle: medio.ajustarAlto ? 'Vertical, entera' : 'Horizontal', proporcion: medio.ajustarAlto ? '3 / 4' : '16 / 9',
      })}
      <div className={editorStyles.fichaCampos}>
        <Segmentado
          etiqueta="Foto o vídeo"
          opciones={FOTO_O_VIDEO}
          valor={medio.tipo}
          onChange={(tipo) => {
            if (tipo === medio.tipo) return;
            h.cambiar(['medioSuperior'], (actual) => ({
              ...actual, tipo, src: '', ajustarAlto: false,
            }));
          }}
        />
        {!esVideo && (
          <>
            <Segmentado
              etiqueta="Cómo se ve la foto"
              opciones={[[false, 'A lo ancho (recortada)'], [true, 'Entera']]}
              valor={Boolean(medio.ajustarAlto)}
              onChange={(ajustarAlto) => h.cambiar(['medioSuperior', 'ajustarAlto'], ajustarAlto)}
            />
            <p className={campos.ayuda}>Para una foto vertical, elige «Entera»: se ve completa, sin recortar, a lo alto de la pantalla.</p>
          </>
        )}
      </div>
    </div>
  );
}

const SECCION = { uno: 'una sección', este: 'esta sección' };

function Seccion({ h, id }) {
  const indice = h.borrador.secciones.findIndex((otra) => otra.id === id);
  if (indice < 0) return null;
  const ruta = (...resto) => ['secciones', indice, ...resto];
  return (
    <>
    <div className={styles.bloqueEditorial}>
      <div>
        {h.medio(ruta('imagen'), { etiqueta: 'Foto', detalle: 'Vertical', proporcion: '3 / 4' })}
      </div>
      <div className={`${editorStyles.fichaCampos} ${styles.columnaTextos}`}>
        {h.texto(ruta('titulo'), { etiqueta: 'Título', largoRecomendado: 35 })}
        {h.texto(ruta('texto'), { etiqueta: 'Texto', parrafos: true, filas: 8 })}
      </div>
    </div>
    <ControlesLista
      h={h}
      ruta={['secciones']}
      indice={indice}
      crear={nuevaSeccion}
      elemento={SECCION}
      nombre={h.borrador.secciones[indice].titulo.es || `la sección ${indice + 1}`}
    />
    </>
  );
}

function Contacto({ h }) {
  const { contacto } = h.borrador;
  const linea = (ruta, props) => (
    <CampoLinea valor={h.leer(['contacto', ...ruta]) || ''} onChange={(valor) => h.cambiar(['contacto', ...ruta], valor)} {...props} />
  );
  return (
    <div className={editorStyles.columnaTexto}>
      <div className={editorStyles.fichaCampos}>
        {linea(['nombre'], { etiqueta: 'Nombre de la sede', ayuda: 'Es el título de su tarjeta en «Visítanos». Sale igual en los dos idiomas.' })}
        <div className={editorStyles.dosColumnas}>
          {linea(['direccion', 0], { etiqueta: 'Calle y número', placeholder: 'C/ Laguna Negra 17-19' })}
          {linea(['direccion', 1], { etiqueta: 'Código postal y ciudad', placeholder: '37008 Salamanca' })}
        </div>
        <div className={editorStyles.dosColumnas}>
          {linea(['telefonos', 0], { etiqueta: 'Teléfono', placeholder: '+34 923 19 00 53', ayuda: 'Con el prefijo +34, para poder llamar desde el móvil.' })}
          <CampoLinea
            etiqueta="Segundo teléfono (móvil)"
            opcional
            valor={contacto.telefonos[1] || ''}
            placeholder="+34 659 00 62 57"
            onChange={(valor) => h.cambiar(['contacto', 'telefonos'], (actual) => [actual[0] || '', valor])}
          />
        </div>
        {linea(['whatsapp'], { etiqueta: 'WhatsApp', placeholder: '+34 659 00 62 57', ayuda: 'El número al que se escribe desde el botón de WhatsApp.' })}
        {h.texto(['contacto', 'horario'], {
          etiqueta: 'Horario', opcional: true, largoRecomendado: 50, ayuda: 'Si lo dejas vacío, sale «Showroom con cita previa».',
        })}
        {h.texto(['contacto', 'descripcion'], {
          etiqueta: 'Texto de su tarjeta en «Visítanos»', multilinea: true, filas: 4, ayuda: 'Una o dos frases sobre lo que hay en la sede.',
        })}
        <div>
          <p className={campos.etiqueta}>Fotos de su tarjeta en «Visítanos»</p>
          <p className={campos.ayuda}>
            La primera es la que se ve al entrar; las demás pasan al poner el ratón encima. Hasta {MAXIMO_FOTOS_TARJETA}.
          </p>
          {h.galeria(['contacto', 'fotos'], { maximo: MAXIMO_FOTOS_TARJETA, textoAnadir: 'Añadir fotos' })}
        </div>
      </div>
    </div>
  );
}

function AdminAtelierSede({ id }) {
  const idPagina = idPaginaSede(id);
  const { publicado } = usePagina(idPagina);
  const nombre = publicado.contacto.nombre;

  return (
    <EditorPagina
      id={idPagina}
      titulo={nombre}
      rutaWeb={rutaWebSede(id)}
      bloques={bloquesEditor}
      campos={camposSede}
      opcionales={OPCIONALES_SEDE}
      migas="Ateliers"
    >
      {(bloque, h) => {
        if (bloque.id === 'portada') return <Portada h={h} />;
        if (bloque.id === 'descripcion') {
          return (
            <div className={editorStyles.columnaTexto}>
              {h.texto(['descripcion'], {
                etiqueta: 'Texto', parrafos: true, filas: 6, ayuda: 'Deja una línea en blanco entre frase y frase para que salgan por separado.',
              })}
            </div>
          );
        }
        if (bloque.id === 'medio') {
          return (
            <>
              <MedioGrande h={h} />
              {h.borrador.secciones.length > 0 && (
                <div className={controles.controles}>
                  <BotonAnadir h={h} ruta={['secciones']} crear={nuevaSeccion} posicion={0}>Añadir una sección justo debajo</BotonAnadir>
                </div>
              )}
            </>
          );
        }
        if (bloque.id === 'galeria') {
          return h.galeria(['imagenesTira'], {
            permitirVideo: true, esVideo: esVideoSede, columnas: 5, maximo: MAXIMO_FOTOS_FINAL, textoAnadir: 'Añadir fotos o vídeos',
          });
        }
        if (bloque.id === 'contacto') return <Contacto h={h} />;
        if (bloque.id === 'sin-secciones') {
          return <BotonAnadir h={h} ruta={['secciones']} crear={nuevaSeccion} posicion={0}>Añadir una sección</BotonAnadir>;
        }
        return <Seccion h={h} id={bloque.id} />;
      }}
    </EditorPagina>
  );
}

export default AdminAtelierSede;
