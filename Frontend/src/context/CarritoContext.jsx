'use client';

/* ============================================================
   CONTEXTO DE CARRITO — Fely Campo

   SERVIDOR-PRIMERO. El carrito vive en el backend, no en el navegador:
     GET/POST  /api/v1/cart/
     PATCH/DELETE /api/v1/cart/items/{id}/

   localStorage guarda SOLO el `X-Cart-Id` del invitado (ver
   src/lib/api/cartId.js), nunca las líneas. Con sesión iniciada el
   backend ignora esa cabecera y usa el carrito del usuario.

   La unidad es la VARIANTE (producto × color × talla), identificada por
   UUID — no nombre+talla+color. `agregar` recibe ese UUID; la ficha lo
   resuelve con `variantePorColorYTalla` sobre `colorways[].variants[]`.

   Client Component obligatoriamente: depende de localStorage.

   ACTUALIZACIÓN OPTIMISTA con reversión: el sitio navega con <a href>
   normales (nunca next/link, ver Navbar.jsx), así que cada clic es una
   recarga completa y la latencia se nota. Se pinta el cambio al
   instante y se revierte si la API lo rechaza.
   ============================================================ */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { cart } from '@/lib/api/endpoints';
import { adaptarCarrito, carritoVacio } from '@/lib/api/adapters';
import { ApiError } from '@/lib/api/errors';
import { borrarCartId } from '@/lib/api/cartId';

const CarritoContext = createContext(null);

/** Clave del carrito ANTIGUO (líneas completas en el navegador). Ya no se usa. */
export const CLAVE_CARRITO_VIEJO = 'fely-campo-carrito';

/**
 * Descarta el carrito guardado por la versión anterior.
 *
 * **Decidido: descartar con aviso, no migrar.** Aquellas líneas se identificaban por
 * `nombre__talla__color`, y el nombre no identifica un producto de forma fiable: los
 * datos de ejemplo ("Producto de ejemplo 01", "Vestido Aurora") no existen en el catálogo
 * real, así que un intento de migración no casaría casi nada y dejaría al usuario con una
 * cesta a medias sin saber qué falta.
 *
 * @returns {boolean} true si había algo que descartar (para poder avisar una sola vez).
 */
function descartarCarritoViejo() {
  if (typeof window === 'undefined') return false;
  try {
    const guardado = window.localStorage.getItem(CLAVE_CARRITO_VIEJO);
    if (!guardado) return false;
    window.localStorage.removeItem(CLAVE_CARRITO_VIEJO);
    // Solo avisa si de verdad había líneas: una clave con "[]" no merece un mensaje.
    const lineas = JSON.parse(guardado);
    return Array.isArray(lineas) && lineas.length > 0;
  } catch {
    // JSON corrupto o localStorage bloqueado: se intenta limpiar y no se avisa.
    try {
      window.localStorage.removeItem(CLAVE_CARRITO_VIEJO);
    } catch {
      /* nada más que hacer */
    }
    return false;
  }
}

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState(() => carritoVacio());
  const [cargando, setCargando] = useState(true);
  // Error del carrito COMPLETO (no se pudo cargar). Los errores por línea van aparte.
  const [errorGlobal, setErrorGlobal] = useState(null);
  // Errores por línea: { [idLinea]: mensaje }. Se pintan junto a la línea afectada.
  const [erroresLinea, setErroresLinea] = useState({});
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [carritoViejoDescartado, setCarritoViejoDescartado] = useState(false);

  // Evita pisar el estado con la respuesta de una petición que ya no es la última.
  const peticionRef = useRef(0);

  useEffect(() => {
    setCarritoViejoDescartado(descartarCarritoViejo());

    let vigente = true;
    (async () => {
      try {
        const datos = await cart.obtenerCarrito();
        if (vigente) setCarrito(adaptarCarrito(datos));
      } catch (error) {
        // Backend caído: la web NO puede quedarse en blanco. El carrito se queda vacío y
        // se marca el error para poder avisar; el resto del sitio sigue funcionando.
        if (vigente && error instanceof ApiError) setErrorGlobal(error);
        else if (vigente) throw error;
      } finally {
        if (vigente) setCargando(false);
      }
    })();

    return () => {
      vigente = false;
    };
  }, []);

  const limpiarErrorLinea = useCallback((idLinea) => {
    setErroresLinea((actuales) => {
      if (!(idLinea in actuales)) return actuales;
      const { [idLinea]: _, ...resto } = actuales;
      return resto;
    });
  }, []);

  /**
   * Ejecuta una escritura con actualización optimista.
   *
   * @param {object} params
   * @param {(estado: object) => object} params.optimista Estado a pintar al instante.
   * @param {() => Promise<object>} params.peticion Llamada real a la API.
   * @param {string} [params.idLinea] Línea a la que atribuir el error, si lo hay.
   */
  const escribir = useCallback(async ({ optimista, peticion, idLinea }) => {
    const identificador = ++peticionRef.current;
    const anterior = carrito;

    setCarrito(optimista(anterior));
    if (idLinea) limpiarErrorLinea(idLinea);
    setErrorGlobal(null);

    try {
      const datos = await peticion();
      // Descartar respuestas viejas: sin esto, dos clics rápidos pueden dejar en pantalla
      // el resultado del primero.
      if (identificador === peticionRef.current) setCarrito(adaptarCarrito(datos));
      return { ok: true };
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;

      // REVERSIÓN: la API mandó, no el optimismo.
      if (identificador === peticionRef.current) setCarrito(anterior);

      // `firstDetail` trae el motivo real por campo ("no quedan unidades") en vez del
      // genérico "Request failed.".
      const mensaje = error.firstDetail ?? error.message;
      if (idLinea) setErroresLinea((actuales) => ({ ...actuales, [idLinea]: mensaje }));
      else setErrorGlobal(error);

      return { ok: false, error, mensaje };
    }
  }, [carrito, limpiarErrorLinea]);

  /**
   * Añade una variante al carrito.
   *
   * @param {string} variantId UUID de la variante, resuelto con `variantePorColorYTalla`.
   * @param {number} [cantidad=1]
   * @returns {Promise<{ok: boolean, mensaje?: string}>} Nunca lanza: la ficha decide qué
   *   enseñar. Los rechazos habituales son sin stock o cantidad por encima del disponible.
   */
  const agregar = useCallback(async (variantId, cantidad = 1) => {
    if (!variantId) return { ok: false, mensaje: null };

    // Sin línea optimista: no conocemos aún el id que dará el backend. Se marca cargando
    // y se abre el panel solo si la petición sale bien, para no abrir un panel vacío.
    setErrorGlobal(null);
    try {
      const datos = await cart.anadirAlCarrito(variantId, cantidad);
      setCarrito(adaptarCarrito(datos));
      setPanelAbierto(true);
      return { ok: true };
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      return { ok: false, error, mensaje: error.firstDetail ?? error.message };
    }
  }, []);

  /**
   * Cambia la cantidad de una línea.
   * @param {string} idLinea UUID del CartItem (`linea.id`), no el de la variante.
   * @param {number} cantidad
   */
  const actualizarCantidad = useCallback((idLinea, cantidad) => {
    const cantidadValida = Math.max(1, cantidad);
    return escribir({
      idLinea,
      optimista: (estado) => {
        const lineas = estado.lineas.map((linea) =>
          linea.id === idLinea ? { ...linea, cantidad: cantidadValida } : linea
        );
        return {
          ...estado,
          lineas,
          cantidadTotal: lineas.reduce((total, linea) => total + linea.cantidad, 0),
        };
      },
      peticion: () => cart.actualizarCantidad(idLinea, cantidadValida),
    });
  }, [escribir]);

  /**
   * Quita una línea.
   * @param {string} idLinea UUID del CartItem.
   */
  const quitar = useCallback((idLinea) => escribir({
    idLinea,
    optimista: (estado) => {
      const lineas = estado.lineas.filter((linea) => linea.id !== idLinea);
      return {
        ...estado,
        lineas,
        cantidadTotal: lineas.reduce((total, linea) => total + linea.cantidad, 0),
        vacio: lineas.length === 0,
      };
    },
    // DELETE devuelve el carrito recalculado; si respondiera 204, `adaptarCarrito(null)`
    // daría un carrito vacío, así que se recarga para no perder el resto de líneas.
    peticion: async () => (await cart.quitarDelCarrito(idLinea)) ?? (await cart.obtenerCarrito()),
  }), [escribir]);

  /** Recarga el carrito desde el servidor. Para reintentar tras un fallo. */
  const recargar = useCallback(async () => {
    setCargando(true);
    setErrorGlobal(null);
    try {
      setCarrito(adaptarCarrito(await cart.obtenerCarrito()));
    } catch (error) {
      if (error instanceof ApiError) setErrorGlobal(error);
      else throw error;
    } finally {
      setCargando(false);
    }
  }, []);

  /** Tras cerrar sesión: el carrito que quedaba era el del usuario, no el de invitado. */
  const olvidarCarritoLocal = useCallback(() => {
    borrarCartId();
    setCarrito(carritoVacio());
  }, []);

  const cerrarPanel = useCallback(() => setPanelAbierto(false), []);
  const descartarAvisoCarritoViejo = useCallback(() => setCarritoViejoDescartado(false), []);

  const valor = useMemo(() => ({
    // Datos
    lineas: carrito.lineas,
    cantidadTotal: carrito.cantidadTotal,
    totales: carrito.totales,
    moneda: carrito.moneda,
    vacio: carrito.vacio,
    hayProblemasDeStock: carrito.hayProblemasDeStock,

    // Estado
    cargando,
    errorGlobal,
    erroresLinea,
    carritoViejoDescartado,

    // Acciones
    agregar,
    quitar,
    actualizarCantidad,
    recargar,
    olvidarCarritoLocal,
    limpiarErrorLinea,
    descartarAvisoCarritoViejo,

    // Panel lateral
    panelAbierto,
    cerrarPanel,
  }), [
    carrito, cargando, errorGlobal, erroresLinea, carritoViejoDescartado,
    agregar, quitar, actualizarCantidad, recargar, olvidarCarritoLocal,
    limpiarErrorLinea, descartarAvisoCarritoViejo, panelAbierto, cerrarPanel,
  ]);

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

export function useCarrito() {
  const contexto = useContext(CarritoContext);
  if (!contexto) throw new Error('useCarrito debe usarse dentro de <CarritoProvider>.');
  return contexto;
}
