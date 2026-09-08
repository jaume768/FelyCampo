'use client';

/* ============================================================
   CATEGORÍAS — DATOS REALES: /api/v1/admin/categories/.

   REDISEÑADA, no migrada: la versión anterior agrupaba categorías
   por TIPO DE PRODUCTO (Prêt-à-porter / Atelier / Runway / Novia /
   Fiesta), cada una con su lista propia. El modelo real es otra cosa:
   un ÁRBOL de categorías de ocasión (Fiesta → Cóctel, Novia, Outlet)
   con `parent`, sin ninguna relación con el tipo de producto. No eran
   los mismos datos con otro nombre, eran dos modelos distintos.

   Lo que un producto tiene es `line` (su tipo) Y `categories` (M2M al
   árbol): dos ejes independientes. Agruparlos aquí era mezclarlos.

   El `slug` NO se autogenera en el backend: es obligatorio y único.
   Se propone a partir del nombre y se deja editar.

   El orden se guarda en `position` (menor primero), no en la posición
   dentro de un array del cliente.
   ============================================================ */

import { useCallback, useMemo, useState } from 'react';
import { Plus, X, ChevronRight } from 'lucide-react';

import { PageHeader, useToast } from '@/components/admin';
import { Boton, Input } from '@/components/ui';
import { categorias as apiCategorias } from '@/lib/api/adminCatalog';
import { useRecursoAdmin } from '@/components/admin/useRecursoAdmin';
import { slugify } from '@/lib/slugify';
import styles from './page.module.css';

function adaptarCategoria(c) {
  return {
    id: c.id,
    nombre: c.name,
    nombreEn: c.name_en || '',
    slug: c.slug,
    padreId: c.parent || null,
    padre: c.parent_name || null,
    posicion: c.position ?? 0,
    activa: c.is_active !== false,
  };
}

export default function CategoriasPage() {
  const { mostrarToast } = useToast();
  const adaptar = useCallback(adaptarCategoria, []);
  const {
    filas: categorias, cargando, error, guardando, crear, actualizar, borrar,
  } = useRecursoAdmin(apiCategorias, adaptar);

  const [nombre, setNombre] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTocado, setSlugTocado] = useState(false);
  const [padreId, setPadreId] = useState('');

  // Árbol de dos niveles: el modelo admite más profundidad, pero la navegación pública
  // solo usa raíz → hija (ver `filter_category`, que incluye las hijas al pedir la madre).
  const arbol = useMemo(() => {
    const raices = categorias.filter((c) => !c.padreId).sort((a, b) => a.posicion - b.posicion);
    return raices.map((r) => ({
      ...r,
      hijas: categorias.filter((c) => c.padreId === r.id).sort((a, b) => a.posicion - b.posicion),
    }));
  }, [categorias]);

  const sueltas = categorias.filter(
    (c) => c.padreId && !categorias.some((p) => p.id === c.padreId)
  );

  function cambiarNombre(valor) {
    setNombre(valor);
    // El slug se propone desde el nombre hasta que alguien lo toca a mano.
    if (!slugTocado) setSlug(slugify(valor));
  }

  async function anadir() {
    if (!nombre.trim() || !slug.trim()) return;
    const resultado = await crear({
      name: nombre.trim(),
      slug: slug.trim(),
      ...(padreId && { parent: padreId }),
      // Al final del nivel donde entra.
      position: categorias.length + 1,
    });

    if (!resultado.ok) {
      mostrarToast(`No se ha creado: ${resultado.mensaje}`);
      return;
    }
    setNombre('');
    setSlug('');
    setSlugTocado(false);
    setPadreId('');
    mostrarToast('Categoría añadida');
  }

  async function alternarActiva(cat) {
    const resultado = await actualizar(cat.id, { is_active: !cat.activa });
    mostrarToast(resultado.ok
      ? (cat.activa ? 'Categoría oculta' : 'Categoría visible')
      : `No se ha podido cambiar: ${resultado.mensaje}`);
  }

  async function mover(cat, direccion) {
    // El orden es un campo del servidor, no la posición en un array del cliente.
    const resultado = await actualizar(cat.id, { position: Math.max(0, cat.posicion + direccion) });
    if (!resultado.ok) mostrarToast(`No se ha podido reordenar: ${resultado.mensaje}`);
  }

  async function eliminar(cat) {
    const resultado = await borrar(cat.id);
    // `Category.parent` es PROTECT y los productos la referencian: el backend impide
    // borrar una categoría en uso y su motivo es el que hay que enseñar.
    mostrarToast(resultado.ok ? 'Categoría eliminada' : `No se puede borrar: ${resultado.mensaje}`);
  }

  function Fila({ cat, esHija }) {
    return (
      <div className={`${styles.fila} ${esHija ? styles.filaHija : ''} ${cat.activa ? '' : styles.filaOculta}`}>
        {esHija && <ChevronRight size={14} className={styles.flechaHija} aria-hidden="true" />}
        <span className={styles.nombre}>
          {cat.nombre}
          <span className={styles.slug}>/{cat.slug}</span>
        </span>
        <div className={styles.acciones}>
          <button type="button" className={styles.mover} onClick={() => mover(cat, -1)} disabled={guardando} aria-label={`Subir ${cat.nombre}`}>↑</button>
          <button type="button" className={styles.mover} onClick={() => mover(cat, 1)} disabled={guardando} aria-label={`Bajar ${cat.nombre}`}>↓</button>
          <Boton variante="texto" onClick={() => alternarActiva(cat)}>{cat.activa ? 'Ocultar' : 'Mostrar'}</Boton>
          <button type="button" className={styles.borrar} onClick={() => eliminar(cat)} disabled={guardando} aria-label={`Borrar ${cat.nombre}`}>
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        titulo="Categorías"
        subtitulo={cargando ? 'Cargando…' : `${categorias.length} categoría${categorias.length === 1 ? '' : 's'} · orden y visibilidad en la navegación pública`}
      />

      <p className={styles.explicacion}>
        Las categorías son el eje de <strong>ocasión</strong> (Fiesta, Novia, Outlet…), no el
        tipo de producto. El tipo se elige en cada producto con su <strong>línea</strong>
        {' '}(prêt-à-porter, atelier, archivo): son dos ejes independientes.
      </p>

      {error && (
        <p className={styles.aviso} role="alert">
          {error.isNetworkError ? 'No hemos podido conectar con el servidor.' : error.message}
        </p>
      )}

      {!error && !cargando && categorias.length === 0 && (
        <p className={styles.aviso}>Todavía no hay categorías. Crea la primera abajo.</p>
      )}

      <div className={styles.lista}>
        {arbol.map((raiz) => (
          <div key={raiz.id}>
            <Fila cat={raiz} />
            {raiz.hijas.map((hija) => (
              <Fila key={hija.id} cat={hija} esHija />
            ))}
          </div>
        ))}

        {/* Una hija cuya madre no está en la lista: no debería pasar, pero si pasa es
            mejor verla que perderla. */}
        {sueltas.map((c) => (
          <Fila key={c.id} cat={c} />
        ))}
      </div>

      <div className={styles.anadirFila}>
        <Input etiqueta="Nombre *" valor={nombre} onChange={(e) => cambiarNombre(e.target.value)} placeholder="Cóctel" />
        {/* Obligatorio y único: el backend NO lo autogenera. */}
        <Input
          etiqueta="Slug *"
          valor={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugTocado(true); }}
          placeholder="coctel"
        />
        <label className={styles.campo}>
          <span className={styles.etiquetaCampo}>Dentro de</span>
          <select className={styles.select} value={padreId} onChange={(e) => setPadreId(e.target.value)}>
            <option value="">— Categoría principal —</option>
            {arbol.map((r) => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </select>
        </label>
        <Boton variante="contorno" onClick={anadir} desactivado={guardando || !nombre.trim() || !slug.trim()}>
          <Plus size={14} />
          {guardando ? 'Guardando…' : 'Añadir'}
        </Boton>
      </div>
    </div>
  );
}
