// BlogCampana.jsx

/* ============================================================
   HISTORIA DE CAMPAÑA — Fely Campo
   Plantilla editorial reutilizable para /blog/[entrada] cuando
   "entrada.tipo" es "campana" (ver ../../app/[locale]/blog/blog.js y
   [entrada]/page.js) — alterna imagen a pantalla casi completa con
   texto narrativo, estilo "lookbook" de campaña (ref. la petición
   original: página larga tipo producto/historia). Mismos tokens que
   el resto del sitio (global.css) más dos añadidos solo para esta
   plantilla: --font-editorial (serif, solo el copy narrativo — el
   resto del sitio sigue en --font-base) y --font-weight-extrabold
   (los enlaces "SHOP HERE"). Radio 0 en todo, como en el resto del
   sistema — ninguna imagen ni botón de aquí lleva border-radius.

   Sin JSX/TS: este proyecto es Next.js + JS + CSS Modules, no
   Astro/Tailwind/TypeScript (ver package.json) — incorporar esos tres
   sería una decisión de arquitectura mayor y no lo que pide "usa mis
   tokens, mis diseños, el mismo minimalismo de antes". Los tipos de
   props que pedías en TypeScript van aquí como JSDoc @typedef, con el
   mismo detalle — se comprueban igual en el editor (VS Code) sin
   añadir un compilador nuevo al proyecto.

   100% data-driven: "creditos" + "bloques" (array ordenado, cada uno
   tipado por su "tipo": "split" | "hero" | "texto-sobre-imagen" |
   "texto-centrado") vienen de blog.js — el mismo componente sirve
   para cualquier historia de campaña futura sin tocar este archivo.

   ---------- Tipos (JSDoc) ----------

   @typedef {Object} CreditoPersona
   @property {{es: string, en: string}} rol - "Fotógrafo/a", "Ayudante", "Maquillaje", "Modelo"...
   @property {string} nombre

   @typedef {Object} CreditoMeta
   @property {{es: string, en: string}} etiqueta - "Look", "Temporada", "Localización"...
   @property {string} valor

   @typedef {Object} Creditos
   @property {CreditoPersona[]} equipo - columna izquierda del overlay
   @property {CreditoMeta[]} meta - columna derecha del overlay
   @property {{es: string, en: string}} pie - caption bajo las dos columnas
   @property {string} productoHref - a qué producto enlaza esa caption

   @typedef {Object} BloqueSplit - "Two-up split": producto centrado + CTA a la izquierda, imagen a sangre a la derecha
   @property {'split'} tipo
   @property {string} imagenProducto
   @property {string} altProducto
   @property {string} ctaHref
   @property {string} imagen
   @property {string} alt

   @typedef {Object} BloqueHero - imagen ancha a sangre, proporción fija (~1.5:1)
   @property {'hero'} tipo
   @property {string} imagen
   @property {string} alt

   @typedef {Object} BloqueTextoSobreImagen - imagen a la izquierda, panel de texto superpuesto a la derecha + imagen secundaria debajo
   @property {'texto-sobre-imagen'} tipo
   @property {string} imagen
   @property {string} alt
   @property {{es: string[], en: string[]}} texto - un párrafo por elemento
   @property {string} ctaHref
   @property {string} [imagenSecundaria]
   @property {string} [altSecundaria]

   @typedef {Object} BloqueTextoCentrado - columna centrada y estrecha, copy + botón
   @property {'texto-centrado'} tipo
   @property {{es: string[], en: string[]}} texto
   @property {string} ctaHref

   @typedef {BloqueSplit | BloqueHero | BloqueTextoSobreImagen | BloqueTextoCentrado} Bloque

   ---------- Uso ----------
   Ver la entrada "campana-fw27-la-coleccion" en blog.js para una
   instancia completa; en [entrada]/page.js:
     <BlogCampana
       creditos={entrada.campana.creditos}
       bloques={entrada.campana.bloques}
       locale={locale}
       ctaTexto={t('shopHere')}
       volverHref={`/${locale}/blog`}
       volverTexto={t('volver')}
     />
   ============================================================ */

import styles from './BlogCampana.module.css';
import { atributosImagen } from '@/lib/imagenes';

function CreditosOverlay({ creditos, locale }) {
  if (!creditos) return null;

  return (
    <div className={styles.creditos}>
      <div className={styles.creditosColumnas}>
        <ul className={styles.creditosLista}>
          {creditos.equipo.map((persona) => (
            <li key={persona.rol[locale]}>
              <span className={styles.creditosRol}>{persona.rol[locale]}</span> {persona.nombre}
            </li>
          ))}
        </ul>
        <ul className={styles.creditosLista}>
          {creditos.meta.map((dato) => (
            <li key={dato.etiqueta[locale]}>
              <span className={styles.creditosRol}>{dato.etiqueta[locale]}</span> {dato.valor}
            </li>
          ))}
        </ul>
      </div>
      <a href={creditos.productoHref} className={styles.creditosPie}>
        {creditos.pie[locale]}
      </a>
    </div>
  );
}

function BloqueSplit({ bloque, locale, ctaTexto }) {
  return (
    <div className={styles.split}>
      <div className={styles.splitProducto}>
        <img {...atributosImagen(bloque.imagenProducto, { sizes: '(max-width: 768px) 100vw, 70vw' })} alt={bloque.altProducto} className={styles.splitImagenProducto} />
        <a href={bloque.ctaHref} className={styles.shopHere}>
          {ctaTexto}
        </a>
      </div>
      <div className={styles.splitImagen}>
        <img {...atributosImagen(bloque.imagen, { sizes: '(max-width: 768px) 100vw, 70vw' })} alt={bloque.alt} className={styles.imagenCover} />
      </div>
    </div>
  );
}

function BloqueHero({ bloque }) {
  return (
    <div className={styles.hero}>
      <img {...atributosImagen(bloque.imagen, { sizes: '(max-width: 768px) 100vw, 70vw' })} alt={bloque.alt} className={styles.heroImagen} />
    </div>
  );
}

function BloqueTextoSobreImagen({ bloque, locale, ctaTexto }) {
  return (
    <div className={styles.textoSobreImagen}>
      <div className={styles.tsiImagen}>
        <img {...atributosImagen(bloque.imagen, { sizes: '(max-width: 768px) 100vw, 70vw' })} alt={bloque.alt} className={styles.imagenCover} />
      </div>
      <div className={styles.tsiColumna}>
        <div className={styles.tsiPanel}>
          {bloque.texto[locale].map((parrafo, indice) => (
            <p key={indice}>{parrafo}</p>
          ))}
          <a href={bloque.ctaHref} className={styles.shopHere}>
            {ctaTexto}
          </a>
        </div>
        {bloque.imagenSecundaria && (
          <img {...atributosImagen(bloque.imagenSecundaria, { sizes: '(max-width: 768px) 100vw, 70vw' })} alt={bloque.altSecundaria} className={styles.tsiImagenSecundaria} />
        )}
      </div>
    </div>
  );
}

function BloqueTextoCentrado({ bloque, locale, ctaTexto }) {
  return (
    <div className={styles.textoCentrado}>
      <div className={styles.tcColumna}>
        {bloque.texto[locale].map((parrafo, indice) => (
          <p key={indice}>{parrafo}</p>
        ))}
        <a href={bloque.ctaHref} className={styles.shopHere}>
          {ctaTexto}
        </a>
      </div>
    </div>
  );
}

/**
 * @param {{ creditos?: Creditos, bloques: Bloque[], locale: 'es'|'en', ctaTexto: string, volverHref: string, volverTexto: string }} props
 */
function BlogCampana({ creditos, bloques, locale, ctaTexto, volverHref, volverTexto }) {
  return (
    <div className={styles.pagina}>
      {/* Mismo tratamiento fijo + mix-blend-mode que .creditos (legible
          sobre cualquier imagen) — plantilla a pantalla completa, sin
          cabecera de página que traiga su propio enlace de vuelta. */}
      <a href={volverHref} className={styles.volver}>
        {volverTexto}
      </a>

      <CreditosOverlay creditos={creditos} locale={locale} />

      {bloques.map((bloque, indice) => {
        switch (bloque.tipo) {
          case 'split':
            return <BloqueSplit key={indice} bloque={bloque} locale={locale} ctaTexto={ctaTexto} />;
          case 'hero':
            return <BloqueHero key={indice} bloque={bloque} />;
          case 'texto-sobre-imagen':
            return <BloqueTextoSobreImagen key={indice} bloque={bloque} locale={locale} ctaTexto={ctaTexto} />;
          case 'texto-centrado':
            return <BloqueTextoCentrado key={indice} bloque={bloque} locale={locale} ctaTexto={ctaTexto} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

export default BlogCampana;
