// nombreColeccion.js
//
// Quita el prefijo numérico de temporada de los nombres de colección
// para enseñarlos en pantalla: "26_Opaline" -> "Opaline", "Look 27
// 26_Opaline" -> "Look 27 Opaline" (a petición). Solo para lo que se ve:
// el nombre completo con número sigue siendo el id de la colección
// (filtros, ?coleccion=) y da el slug de la ficha de producto
// (slugify(nombre), ver lib/slugify.js), así que las URLs no cambian.

export function sinNumeroColeccion(texto) {
  return typeof texto === 'string' ? texto.replace(/\b\d+_/g, '') : texto;
}
