import { redirect } from 'next/navigation';

// "Tus Materiales" ya no es una página propia con pestañas (Colores/Telas/
// Colecciones confundidas en un mismo sitio) — ahora son dos páginas
// separadas colgadas del sidebar (ver AdminSidebar.jsx `children` de este
// item). /admin/materiales sin más aterriza en la primera.
export default function MaterialesPage() {
  redirect('/admin/materiales/colores');
}
