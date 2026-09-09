'use client';

/**
 * Avisa a Next de que el catálogo ha cambiado, para que la web pública lo enseñe ya.
 *
 * Las páginas de tienda se sirven con ISR: sin este aviso, publicar un producto tardaba
 * hasta cinco minutos en verse y parecía que hacía falta recargar sin caché a mano.
 *
 * Va al propio Next (`/api/revalidar`), no a Django: el caché que hay que tirar es el de
 * Next. Mismo origen, así que viaja la cookie de sesión y el route handler comprueba
 * contra Django que quien llama es staff.
 *
 * **Nunca lanza.** Que no se pueda refrescar el caché no puede tumbar un guardado que ya
 * ha ido bien; como mucho el cambio tarda lo que diga el `revalidate`.
 *
 * @returns {Promise<boolean>} Si el caché se ha tirado de verdad.
 */
export async function revalidarCatalogo() {
  if (typeof window === 'undefined') return false;
  try {
    const respuesta = await fetch('/api/revalidar', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag: 'catalogo' }),
    });
    return respuesta.ok;
  } catch {
    return false;
  }
}
