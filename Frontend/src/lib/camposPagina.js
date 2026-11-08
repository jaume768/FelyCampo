// camposPagina.js
//
// Reglas comunes de las páginas editables (inicio, Sobre Fely,
// Talleres). Cada página describe sus campos con una función
// campos<Pagina>(datos) que devuelve una lista de:
//
//   { bloque, nombre, tipo, valor, requerido, minimo, maximo }
//
//   bloque     id del bloque del editor al que pertenece (para marcarlo
//              como "Incompleto").
//   nombre     cómo se nombra en los avisos: "el título del capítulo 1".
//   tipo       'texto'  valor { es, en } (o listas de párrafos)
//              'medio'  valor = ruta de foto o vídeo
//              'linea'  valor = texto sin traducir (un teléfono, una calle)
//              'url'    valor = dirección externa (https://…)
//              'enlace' valor = ruta interna; "rutas" = las permitidas
//              'lista'  valor = array; "minimo" = cuántos como mínimo
//                       y "maximo" = cuántos como máximo (opcional)
//   requerido  si puede quedar vacío (textos y fotos).
//
// Con esa lista, el editor sabe qué falta en cada idioma y qué bloques
// están incompletos, y validarCampos da los errores antes de publicar
// (y servirá igual en el servidor al conectar la base de datos).

import { faltaTexto, textoVacio, urlValida } from './previa';

const IDIOMAS = { es: 'español', en: 'inglés' };

export function campoConProblema(campo) {
  const { tipo, valor, requerido } = campo;
  if (tipo === 'texto') return Object.keys(IDIOMAS).some((idioma) => faltaTexto(valor, idioma, requerido));
  if (tipo === 'medio') return requerido && !valor;
  if (tipo === 'linea') return requerido && textoVacio(valor);
  if (tipo === 'url') return (requerido || !textoVacio(valor)) && !urlValida(valor);
  if (tipo === 'enlace') return !campo.rutas?.includes(valor);
  if (tipo === 'lista') {
    const cuantos = valor?.length || 0;
    return cuantos < (campo.minimo || 0) || (campo.maximo !== undefined && cuantos > campo.maximo);
  }
  return false;
}

// Textos que faltan en un idioma (el numerito rosa del selector).
export function textosQueFaltan(campos, idioma) {
  return campos.filter((campo) => campo.tipo === 'texto' && faltaTexto(campo.valor, idioma, campo.requerido)).length;
}

export function bloqueIncompleto(campos, bloque) {
  return campos.some((campo) => campo.bloque === bloque && campoConProblema(campo));
}

export function validarCampos(campos) {
  const errores = [];
  campos.forEach((campo) => {
    const { tipo, nombre, valor } = campo;
    if (tipo === 'texto') {
      Object.entries(IDIOMAS).forEach(([idioma, lengua]) => {
        if (faltaTexto(valor, idioma, campo.requerido)) errores.push(`Falta ${nombre} en ${lengua}.`);
      });
    } else if (campoConProblema(campo)) {
      if (tipo === 'medio' || tipo === 'linea') errores.push(`Falta ${nombre}.`);
      if (tipo === 'url') errores.push(`Revisa ${nombre}: tiene que ser una dirección completa (https://…).`);
      if (tipo === 'enlace') errores.push(`Elige a qué página lleva ${nombre}.`);
      if (tipo === 'lista' && campo.maximo !== undefined && (valor?.length || 0) > campo.maximo) {
        errores.push(`Sobran fotos en ${nombre}: caben ${campo.maximo} como máximo, quita ${valor.length - campo.maximo}.`);
      } else if (tipo === 'lista') {
        // "mensaje": el aviso propio de esa lista (p. ej. «Elige al menos un color.»).
        errores.push(campo.mensaje || `Añade al menos ${campo.minimo === 1 ? 'una foto' : `${campo.minimo} fotos`} en ${nombre}.`);
      }
    }
  });
  return errores;
}
