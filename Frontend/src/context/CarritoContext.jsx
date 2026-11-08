'use client';

/* ============================================================
   CONTEXTO DE CARRITO — Fely Campo
   Estado del carrito compartido por toda la app (Navbar, ficha de
   producto, página /carrito) — sin backend real todavía, vive solo en
   memoria del cliente y se pierde al recargar, igual que el resto de
   "datos de ejemplo" del proyecto (productosEjemplo.js). Monta en
   src/app/[locale]/layout.js, envolviendo Navbar + main + Footer —
   único ancestro común entre el Navbar (contador, panel) y cualquier
   página de producto (que añade líneas).

   Cada línea se identifica por nombre+talla+color (ver idLinea):
   añadir el mismo producto con la misma combinación solo sube la
   cantidad, no duplica la fila.
   ============================================================ */

import { createContext, useContext, useEffect, useState } from 'react';
import { parsearPrecio } from '@/lib/precio';
import { tiendaProductos } from '@/components/layout/tiendaProductos';
import { TALLAS_DISPONIBLES } from '@/components/ecommerce/guiaTallasData';

const CarritoContext = createContext(null);
const CLAVE_STORAGE = 'fely-campo-carrito';

function idLinea({ nombre, talla, color }) {
  return [nombre, talla, color].filter(Boolean).join('__');
}

// PLACEHOLDER a propósito, mismo criterio que WISHLIST_EJEMPLO en
// wishlist/page.js: sin backend real que traiga un carrito ya empezado
// para una clienta que vuelve, así que la primera vez que se visita el
// sitio (CLAVE_STORAGE todavía no existe en localStorage, ver más abajo)
// se siembra con un par de líneas del catálogo real de
// tiendaProductos.js, para poder ver /carrito con contenido de verdad
// sin tener que añadir nada a mano primero. Solo pasa esa PRIMERA vez:
// en cuanto hay algo guardado (aunque sea un carrito vacío de verdad,
// tras quitarlas todas), esta siembra no vuelve a aplicarse — a
// diferencia de la wishlist, aquí sí hay estado real (persistencia +
// añadir/quitar de verdad), así que no puede repetirse en cada visita
// o pisaría lo que la clienta haya hecho de verdad.
//
// DESACTIVADO (2026-11-08): sin tienda online, /carrito ya no existe y el
// panel del carrito va oculto en el Navbar de todas las páginas, así que la
// siembra solo hacía descargar estas fotos (~700 KB) en cada visita. Se
// deja la función por si vuelve la tienda.
const SEMBRAR_EJEMPLO = false;

function lineasEjemplo() {
  if (!SEMBRAR_EJEMPLO) return [];
  const buscar = (nombre) => tiendaProductos.find((producto) => producto.nombre === nombre);
  const falda = buscar('Falda Basilea');
  const vestido = buscar('Vestido Largo Chicago');
  const chaqueta = buscar('Chaqueta Aranjuez');

  return [falda, vestido, chaqueta].filter(Boolean).map((producto, indice) => ({
    id: idLinea({ nombre: producto.nombre, talla: producto.tallasDisponibles[0], color: producto.colores[0]?.nombre }),
    nombre: producto.nombre,
    precio: producto.precio,
    imagen: producto.imagen,
    talla: producto.tallasDisponibles[0],
    color: producto.colores[0]?.nombre,
    colorHex: producto.colores[0]?.hex,
    tallasDisponibles: TALLAS_DISPONIBLES,
    cantidad: indice === 2 ? 2 : 1,
  }));
}

export function CarritoProvider({ children }) {
  const [lineas, setLineas] = useState([]);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [hidratado, setHidratado] = useState(false);

  // Persistencia mínima en localStorage — imprescindible aquí: el sitio
  // entero enlaza con <a href> normales, nunca next/link (ver Navbar.jsx,
  // Boton.jsx), así que ir a /carrito — o a cualquier otra página — es
  // SIEMPRE una recarga completa, no una navegación cliente. Sin esto,
  // CarritoProvider se remontaría desde cero en cada clic y el carrito
  // se vaciaría solo por navegar.
  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(CLAVE_STORAGE);
      // "guardado === null": todavía no existe la clave, primera visita
      // de verdad — distinto de "[]" (carrito vaciado a mano), que sí
      // debe quedarse vacío. Ver lineasEjemplo() más arriba.
      if (guardado === null) setLineas(lineasEjemplo());
      else setLineas(JSON.parse(guardado));
    } catch {
      // localStorage no disponible (privado, bloqueado...) — el carrito
      // sigue funcionando durante la carga actual, solo no sobrevive a
      // la próxima navegación.
    }
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    try {
      window.localStorage.setItem(CLAVE_STORAGE, JSON.stringify(lineas));
    } catch {
      // Ver comentario de arriba.
    }
  }, [lineas, hidratado]);

  const agregar = ({ nombre, precio, imagen, talla, color, colorHex, tallasDisponibles }) => {
    const id = idLinea({ nombre, talla, color });
    setLineas((actuales) => {
      const existente = actuales.find((linea) => linea.id === id);
      if (existente) {
        return actuales.map((linea) => (linea.id === id ? { ...linea, cantidad: linea.cantidad + 1 } : linea));
      }
      return [...actuales, { id, nombre, precio, imagen, talla, color, colorHex, tallasDisponibles, cantidad: 1 }];
    });
    setPanelAbierto(true);
  };

  const quitar = (id) => setLineas((actuales) => actuales.filter((linea) => linea.id !== id));

  const actualizarCantidad = (id, cantidad) => {
    setLineas((actuales) => actuales.map((linea) => (linea.id === id ? { ...linea, cantidad: Math.max(1, cantidad) } : linea)));
  };

  // Cambiar la talla desde /carrito no re-agrupa con otra línea ya
  // existente con esa misma combinación — caso límite que no hace
  // falta cubrir sin backend real detrás.
  const actualizarTalla = (id, talla) => {
    setLineas((actuales) => actuales.map((linea) => (linea.id === id ? { ...linea, talla } : linea)));
  };

  const cerrarPanel = () => setPanelAbierto(false);

  const cantidadTotal = lineas.reduce((total, linea) => total + linea.cantidad, 0);
  const subtotal = lineas.reduce((total, linea) => total + parsearPrecio(linea.precio) * linea.cantidad, 0);

  const valor = {
    lineas,
    agregar,
    quitar,
    actualizarCantidad,
    actualizarTalla,
    cantidadTotal,
    subtotal,
    panelAbierto,
    cerrarPanel,
  };

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

export function useCarrito() {
  const contexto = useContext(CarritoContext);
  if (!contexto) throw new Error('useCarrito debe usarse dentro de <CarritoProvider>.');
  return contexto;
}
