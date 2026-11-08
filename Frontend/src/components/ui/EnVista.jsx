// EnVista.jsx

'use client';

/* ============================================================
   EN VISTA — Fely Campo
   Envoltorio genérico para animar CUALQUIER bloque (texto o imagen)
   la primera vez que entra en el viewport al hacer scroll — mismo
   patrón que ya usan a mano SplitMedia/MediaBanner/SectionCompromiso/
   ImageTitle/TarjetaProducto (@/hooks/useEnVista + las clases
   .al-scroll/.en-vista de global.css), aquí como componente para
   Server Components (page.js, AtelierDetalle.jsx...) que no pueden
   llamar hooks ellos mismos: envuelven el bloque en <EnVista> en vez
   de convertirse enteros en 'use client'.
   "as" (opcional, 'div' por defecto): la etiqueta HTML a renderizar
   ("img", "section", "a"...) — el resto de props (className, src,
   alt, href...) se reenvían tal cual a esa etiqueta.
   Uso:
     <EnVista as="img" src={foto} alt="" className={styles.imagen} />
     <EnVista className={styles.bloque}>
       <p>...</p>
     </EnVista>
   ============================================================ */

import useEnVista from '@/hooks/useEnVista';

function EnVista({ as: Etiqueta = 'div', className, children, ...resto }) {
  const [ref, enVista] = useEnVista();

  return (
    <Etiqueta ref={ref} className={`${className || ''} al-scroll ${enVista ? 'en-vista' : ''}`} {...resto}>
      {children}
    </Etiqueta>
  );
}

export default EnVista;
