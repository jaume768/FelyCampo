'use client';

/* ============================================================
   SELECTOR IDIOMA — Fely Campo (admin)
   Alterna qué idioma se edita en un grupo de campos de texto
   bilingües (nombre, descripción, contenido...). No duplica la
   pantalla entera — solo cambia qué valor del objeto {es, en} se ve.
   `completados` es opcional (array de códigos de idioma, p.ej. ['es']):
   marca con un check qué idiomas ya tienen los campos rellenos, para
   no tener que abrir cada pestaña para comprobarlo.
   Uso:
     const [idioma, setIdioma] = useState('es');
     <SelectorIdioma idioma={idioma} onChange={setIdioma} completados={['es']} />
     <Input etiqueta="Nombre" valor={form.nombre[idioma]}
       onChange={(e) => actualizarCampo('nombre', idioma, e.target.value)} />
   ============================================================ */

import { Check } from 'lucide-react';
import styles from './SelectorIdioma.module.css';

const IDIOMAS = [
  { valor: 'es', etiqueta: 'ES', bandera: '/img/assets/flags/spain-flag.png' },
  { valor: 'en', etiqueta: 'EN', bandera: '/img/assets/flags/united-kingdom.png' },
];

function SelectorIdioma({ idioma, onChange, completados = [] }) {
  return (
    <div className={styles.grupo} role="tablist" aria-label="Idioma del contenido">
      {IDIOMAS.map((opcion) => (
        <button
          key={opcion.valor}
          type="button"
          role="tab"
          aria-selected={idioma === opcion.valor}
          className={`${styles.opcion} ${idioma === opcion.valor ? styles.opcionActiva : ''}`}
          onClick={() => onChange(opcion.valor)}
        >
          <img src={opcion.bandera} alt="" className={styles.bandera} aria-hidden="true" />
          {opcion.etiqueta}
          {completados.includes(opcion.valor) && (
            <Check size={11} className={styles.tick} aria-label="Completado" />
          )}
        </button>
      ))}
    </div>
  );
}

export default SelectorIdioma;
