'use client';

/* ============================================================
   TOAST — Fely Campo (admin)
   Aviso breve tras "Guardar borrador"/"Publicar" en pantallas sin
   backend real todavía. ToastProvider vive una vez en admin/layout.js;
   cualquier página consume useToast() para dispararlo antes de
   navegar de vuelta al listado.
   Uso:
     const { mostrarToast } = useToast();
     mostrarToast('Guardado (demo)');
     router.push('/admin/productos');
   ============================================================ */

import { createContext, useCallback, useContext, useState, useRef } from 'react';
import styles from './Toast.module.css';

const ToastContext = createContext(null);

const DURACION_MS = 2500;

function ToastProvider({ children }) {
  const [mensaje, setMensaje] = useState('');
  const [visible, setVisible] = useState(false);

  const temporizador = useRef(null);
  // "duracion" opcional: los avisos largos (un conflicto al publicar) se
  // quedan más tiempo. Cada aviso nuevo reinicia la cuenta.
  const mostrarToast = useCallback((texto, duracion = DURACION_MS) => {
    setMensaje(texto);
    setVisible(true);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setVisible(false), duracion);
  }, []);

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}
      <div className={`${styles.toast} ${visible ? styles.visible : ''}`} role="status" aria-live="polite">
        {mensaje}
      </div>
    </ToastContext.Provider>
  );
}

function useToast() {
  const contexto = useContext(ToastContext);
  if (!contexto) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return contexto;
}

export { ToastProvider, useToast };
