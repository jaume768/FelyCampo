'use client';

/* ============================================================
   SETTINGS — placeholder de ejemplo. Formulario sin API/BBDD
   detrás; "Guardar cambios" solo confirma con un toast (demo).
   ============================================================ */

import { useState } from 'react';
import { PageHeader, FormSeccion, useToast } from '@/components/admin';
import { Boton, Input } from '@/components/ui';
import { ajustesTiendaMock } from '@/components/admin/mockData';
import styles from './page.module.css';

export default function SettingsPage() {
  const { mostrarToast } = useToast();
  const [ajustes, setAjustes] = useState(ajustesTiendaMock);

  function actualizar(campo) {
    return (e) => setAjustes((actual) => ({ ...actual, [campo]: e.target.value }));
  }

  function guardar(e) {
    e.preventDefault();
    mostrarToast('Ajustes guardados (demo)');
  }

  return (
    <div>
      <PageHeader titulo="Settings" subtitulo="Datos generales de la tienda" />

      <form onSubmit={guardar}>
        <FormSeccion numero="1" titulo="Información de la tienda" descripcion="Datos visibles en el sitio público y en las comunicaciones a clientas.">
          <Input etiqueta="Nombre de la tienda" valor={ajustes.nombreTienda} onChange={actualizar('nombreTienda')} />
          <Input etiqueta="Email de contacto" tipo="email" valor={ajustes.emailContacto} onChange={actualizar('emailContacto')} />
          <Input etiqueta="Teléfono" valor={ajustes.telefono} onChange={actualizar('telefono')} />
        </FormSeccion>

        <FormSeccion numero="2" titulo="Preferencias" descripcion="Moneda e idioma predeterminados del panel.">
          <Input etiqueta="Moneda" valor={ajustes.moneda} onChange={actualizar('moneda')} />
          <Input etiqueta="Idioma predeterminado" valor={ajustes.idiomaPredeterminado} onChange={actualizar('idiomaPredeterminado')} />
        </FormSeccion>

        <div className={styles.acciones}>
          <Boton type="submit">Guardar cambios</Boton>
        </div>
      </form>
    </div>
  );
}
