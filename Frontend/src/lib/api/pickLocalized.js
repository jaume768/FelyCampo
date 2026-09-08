/**
 * Elige el campo traducido según el locale.
 *
 * El backend guarda la traducción en un campo hermano con sufijo `_en`: `name`/`name_en`,
 * `description`/`description_en`. El castellano es el idioma base y siempre está relleno;
 * `*_en` suele venir vacío (`""`) mientras no se traduzca.
 *
 * **Ningún componente debe leer `campo_en` a mano.** Si aparece un `producto.name_en`
 * suelto en un componente, es un error: pasa por aquí.
 *
 * @param {Record<string, any>|null|undefined} objeto Objeto de la API.
 * @param {string} campo Nombre del campo base, sin sufijo (`"name"`).
 * @param {string} [locale='es'] Locale de next-intl (`useLocale()` / el `params.locale`).
 * @returns {string} El valor traducido, con respaldo en el base. Nunca `undefined`.
 *
 * @example
 * pickLocalized(producto, 'name', 'en')  // producto.name_en, o producto.name si está vacío
 */
export function pickLocalized(objeto, campo, locale = 'es') {
  if (!objeto || typeof objeto !== 'object') return '';

  const base = objeto[campo];

  // El castellano es el idioma base: no tiene campo con sufijo.
  if (locale === 'es') return base ?? '';

  const traducido = objeto[`${campo}_en`];

  // Respaldo deliberado al castellano: es mejor enseñar el nombre sin traducir que un
  // hueco vacío. `""` cuenta como "sin traducir", no como traducción a cadena vacía.
  if (traducido === null || traducido === undefined || traducido === '') return base ?? '';

  return traducido;
}

/**
 * Varios campos de golpe, para no repetir `pickLocalized(x, ..., locale)` en cada línea.
 *
 * @param {Record<string, any>|null|undefined} objeto
 * @param {string[]} campos
 * @param {string} [locale='es']
 * @returns {Record<string, string>}
 *
 * @example
 * const { name, description } = pickLocalizedFields(producto, ['name', 'description'], locale);
 */
export function pickLocalizedFields(objeto, campos, locale = 'es') {
  return Object.fromEntries(campos.map((campo) => [campo, pickLocalized(objeto, campo, locale)]));
}

export default pickLocalized;
