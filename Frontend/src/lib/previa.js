// previa.js
//
// Vista previa de las páginas editables desde el admin (como en
// WordPress): el editor guarda el borrador en localStorage con
// clavePrevia(id) y abre la página con ?previa=<id>. La página lo pinta
// con usePrevia (components/layout/usePrevia.js) y una barra de aviso.
// Los visitantes nunca lo ven: sin el parámetro y sin el borrador en su
// propio navegador, se ve lo publicado.

export const PARAMETRO_PREVIA = 'previa';

export function clavePrevia(id) {
  return `fc_previa_${id}`;
}

// Rellena lo que falte en un borrador con lo publicado, para que la vista
// previa no salga rota (un campo obligatorio vacío, o un borrador antiguo
// sin algún campo). "opcionales": rutas ("hero.imagen.movil") que pueden
// quedar vacías a propósito. Las listas (fotos, párrafos) se respetan tal
// cual: si se quitó una foto, no vuelve. Las listas de bloques con "id"
// (capítulos, talleres) se completan bloque a bloque.
export function completarCon(borrador, base, opcionales = [], ruta = '') {
  if (Array.isArray(base)) {
    if (!Array.isArray(borrador)) return base;
    return borrador.map((elemento, indice) => {
      const original = base.find((otro) => otro?.id !== undefined && otro.id === elemento?.id);
      return original ? completarCon(elemento, original, opcionales, `${ruta}.${indice}`) : elemento;
    });
  }
  if (base === null || typeof base !== 'object') {
    if (borrador === undefined || borrador === null) return base;
    if (borrador === '' && !opcionales.includes(ruta)) return base;
    return borrador;
  }
  const resultado = {};
  Object.keys(base).forEach((clave) => {
    resultado[clave] = completarCon(borrador?.[clave], base[clave], opcionales, ruta ? `${ruta}.${clave}` : clave);
  });
  return resultado;
}

// ¿Falta un texto { es, en } en un idioma? Los obligatorios faltan si
// están vacíos; los opcionales, solo si el otro idioma sí lo tiene (una
// cita en español sin su traducción). Vale para textos y para listas de
// párrafos.
export function textoVacio(valor) {
  if (Array.isArray(valor)) return !valor.join('').trim();
  return !String(valor || '').trim();
}

export function faltaTexto(valor, idioma, requerido) {
  const otro = idioma === 'es' ? 'en' : 'es';
  if (!textoVacio(valor?.[idioma])) return false;
  return requerido || !textoVacio(valor?.[otro]);
}

// Párrafos de un texto en un idioma, sin los vacíos (el editor separa
// párrafos con una línea en blanco y puede dejar alguno vacío al escribir).
export function parrafosEn(valor, locale) {
  const lista = valor?.[locale]?.length ? valor[locale] : valor?.es || [];
  return lista.map((parrafo) => parrafo.trim()).filter(Boolean);
}

export function textoEn(valor, locale) {
  if (!valor) return '';
  if (typeof valor === 'string') return valor;
  return (valor[locale] || valor.es || '').trim();
}

export const urlValida = (url) => /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(String(url || '').trim());
