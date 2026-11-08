'use client';

/* ============================================================
   CONTEXTO DE MI CUENTA — Fely Campo
   Solo abierta/cerrada — MiCuentaModal.jsx (ver components/ecommerce)
   vive montado una sola vez en Navbar.jsx (mismo criterio que
   CarritoPanel/CarritoContext) para que "Mi cuenta" se pueda abrir
   como modal desde cualquier sitio del árbol (Navbar escritorio/móvil,
   el aviso de /carrito) sin tener que levantar estado a mano por cada
   consumidor. Monta en src/app/[locale]/layout.js, junto a
   CarritoProvider.
   ============================================================ */

import { createContext, useContext, useState } from 'react';

const MiCuentaContext = createContext(null);

export function MiCuentaProvider({ children }) {
  const [abierta, setAbierta] = useState(false);

  const valor = {
    abierta,
    abrir: () => setAbierta(true),
    cerrar: () => setAbierta(false),
  };

  return <MiCuentaContext.Provider value={valor}>{children}</MiCuentaContext.Provider>;
}

export function useMiCuenta() {
  const contexto = useContext(MiCuentaContext);
  if (!contexto) throw new Error('useMiCuenta debe usarse dentro de <MiCuentaProvider>.');
  return contexto;
}
