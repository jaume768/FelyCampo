'use client';

/**
 * Panel lateral deslizante — mecanismo reutilizable, ancho fijo (nunca
 * se ajusta al contenido). Se usa en Navbar (submenú de escritorio en
 * hover, y el menú móvil) anclado a la izquierda, y en paneles
 * disparados por clic (ej. GuiaTallas) que pueden pedir el lado
 * derecho y atrapar el foco — mismo deslizamiento, contenido distinto.
 *
 * Importante: este componente permanece SIEMPRE montado; "abierto" solo
 * cambia la clase que mueve el transform. Si se desmontara al cerrar,
 * la transición de salida no se vería (desaparecería de golpe).
 *
 * "debajo" es opcional: contenido que va DESPUÉS de .contenido pero
 * dentro de .panel, así queda fuera del padding lateral y puede ocupar
 * el ancho completo del panel (ej. las cards del submenú de Navbar).
 *
 * "lado" ('izquierda' por defecto | 'derecha'): borde al que queda
 * anclado y desde el que se desliza.
 *
 * "atraparFoco" (false por defecto): SOLO para paneles disparados por
 * clic (nunca por hover — el submenú de Navbar no lo activa, robaría
 * el foco solo por pasar el ratón). Al abrir, mueve el foco dentro del
 * panel y lo devuelve a quien lo abrió al cerrar; Escape cierra; Tab
 * queda atrapado dentro del panel mientras esté abierto.
 *
 * "debajoHeader" (false por defecto, z-index por ENCIMA del header
 * sticky): actívalo solo para tapar el header a propósito con el
 * panel — hoy en día únicamente el submenú de escritorio del Navbar
 * lo necesita. Cualquier otro uso (Filtros, GuiaTallas, drawers de
 * admin...) debe dejarlo en su valor por defecto.
 *
 * "claseContenido" (opcional): clase extra sobre .contenido, SOLO para
 * quien necesite que su contenido tenga alto propio y scroll interno
 * (ej. CarritoPanel: lista scrollable + botones que no deben moverse
 * nunca de sitio). Sin ella, .contenido se queda en su alto natural —
 * el comportamiento de siempre, sin tocar al resto de usos.
 *
 * "ancho" (opcional, ej. "380px"): sobrescribe el ancho fijo de 420px
 * de .panel vía style inline — así un consumidor concreto (ej.
 * CarritoPanel) puede tener su propio ancho sin tocar el de los
 * demás (Filtros, GuiaTallas, submenú de Navbar...), que se quedan en
 * el de siempre. "max-width: 90vw" de .panel se sigue aplicando igual.
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './PanelLateral.module.css';

const SELECTOR_FOCUSABLES = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function PanelLateral({
  abierto,
  children,
  debajo,
  sobreNavbar = false,
  debajoHeader = false,
  lado = 'izquierda',
  atraparFoco = false,
  claseContenido,
  ancho,
  onMouseEnter,
  onMouseLeave,
  onCerrar,
}) {
  const panelRef = useRef(null);

  // Portal a document.body: quien invoque PanelLateral puede vivir
  // dentro de cualquier ancestro con su propio contexto de apilamiento
  // (ej. .info en la ficha de producto, position:sticky — los siempre
  // crean uno, tenga o no z-index) — desde ahí, ningún z-index interno
  // del panel puede ganarle al header (Navbar.module.css), por alto que
  // sea: el ancestro entero queda "atrapado" por debajo. Portal saca el
  // panel/overlay de ese árbol y los cuelga directo de <body>, al mismo
  // nivel que el propio Navbar, donde su z-index sí compara de verdad.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  // Bloquea el scroll de la página de fondo mientras el panel está
  // abierto — solo para los paneles "modales" de verdad (atraparFoco,
  // ej. CarritoPanel/GuiaTallas): no tiene sentido dejar ver/mover la
  // barra de scroll de la página detrás de un panel que tiene su
  // propio scroll interno. El submenú de Navbar (hover) y el menú
  // móvil no pasan atraparFoco, así que no les afecta.
  useEffect(() => {
    if (!atraparFoco || !abierto) return undefined;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflowPrevio;
    };
  }, [atraparFoco, abierto]);

  useEffect(() => {
    if (!atraparFoco || !abierto) return undefined;

    const panel = panelRef.current;
    const enfocadoAntes = document.activeElement;
    panel?.focus();

    const alTeclado = (evento) => {
      if (evento.key === 'Escape') {
        onCerrar?.();
        return;
      }
      if (evento.key !== 'Tab' || !panel) return;
      const focosables = panel.querySelectorAll(SELECTOR_FOCUSABLES);
      if (focosables.length === 0) return;
      const primero = focosables[0];
      const ultimo = focosables[focosables.length - 1];
      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener('keydown', alTeclado);
    return () => {
      document.removeEventListener('keydown', alTeclado);
      enfocadoAntes?.focus?.();
    };
  }, [atraparFoco, abierto, onCerrar]);

  const clase = [
    styles.panel,
    abierto && styles.abierto,
    sobreNavbar && styles.sobreNavbar,
    debajoHeader && styles.debajoHeader,
    lado === 'derecha' && styles.derecha,
  ].filter(Boolean).join(' ');

  const claseOverlay = [
    styles.overlay,
    abierto && styles.abierto,
    sobreNavbar && styles.sobreNavbar,
    debajoHeader && styles.debajoHeader,
  ].filter(Boolean).join(' ');

  if (!montado) return null;

  return createPortal(
    <>
      {/* Capa oscura para centrar la atención en el panel — comparte
          transición/estado con el panel pero es un elemento hermano
          (así su opacidad no se hereda al contenido). Clic la cierra. */}
      <div className={claseOverlay} aria-hidden="true" onClick={abierto ? onCerrar : undefined} />
      <div
        ref={panelRef}
        className={clase}
        style={ancho ? { width: ancho } : undefined}
        aria-hidden={!abierto}
        tabIndex={atraparFoco ? -1 : undefined}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className={`${styles.contenido} ${claseContenido || ''}`}>{children}</div>
        {debajo}
      </div>
    </>,
    document.body,
  );
}

export default PanelLateral;
