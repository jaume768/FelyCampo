// exportar-contenido.mjs — vuelca src/datos/*.js a un JSON { clave: datos }
// que el backend carga con `python manage.py cargar_contenido`.
//
// Es el paso de migración del contenido de la web estática a la base de
// datos (docs/ADMIN.md §4.6): los archivos de src/datos/ son el contenido
// inicial y cada export es UN documento de `content.Document`, con
// exactamente la misma forma. Las claves son las de CLAVES (abajo), las
// mismas que lista apps/content/registry.py en el backend.
//
// Uso (desde Frontend/):
//   node scripts/exportar-contenido.mjs ../backend/apps/content/seed/contenido.json
//
// Falla si algún valor no sobrevive a JSON (funciones, undefined, Date,
// NaN…): lo que no se puede guardar en JSONB no puede ser contenido.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const DATOS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'datos');

// clave del documento → [archivo de src/datos, nombre del export]
export const CLAVES = {
  'landing': ['landing.js', 'LANDING'],
  'piezas-comunes': ['piezasComunes.js', 'PIEZAS_COMUNES'],
  'seo-textos': ['seoTextos.js', 'SEO_TEXTOS'],
  'sobre-fely': ['sobreFely.js', 'SOBRE_FELY'],
  'talleres': ['talleres.js', 'TALLERES'],
  'contacto': ['contacto.js', 'CONTACTO'],
  'cabeceras': ['cabeceras.js', 'CABECERAS'],
  'sedes': ['ateliers.js', 'SEDES'],
  'puntos-venta': ['puntosVenta.js', 'PUNTOS_VENTA'],
  'vosotras': ['vosotras.js', 'VOSOTRAS'],
  'articulos': ['blog.js', 'ARTICULOS'],
  'episodios': ['blog.js', 'EPISODIOS'],
  'editorial-novias': ['atelierEditorial.js', 'EDITORIAL_NOVIAS'],
  'editorial-fiesta': ['atelierEditorial.js', 'EDITORIAL_FIESTA'],
  'editorial-pret-a-porter': ['atelierEditorial.js', 'EDITORIAL_PRET_A_PORTER'],
  'colecciones-fiesta': ['atelierFiesta.js', 'COLECCIONES_FIESTA'],
  'colecciones-novias': ['atelierNovias.js', 'COLECCIONES_NOVIAS'],
  'colecciones-runway': ['runway.js', 'COLECCIONES_RUNWAY'],
  'productos-pret-a-porter': ['pretAPorter.js', 'PRODUCTOS_PRET_A_PORTER'],
};

async function main() {
  const destino = process.argv[2];
  if (!destino) {
    console.error('Uso: node scripts/exportar-contenido.mjs <destino.json>');
    process.exit(1);
  }

  // Ningún export de src/datos puede quedarse fuera sin que nadie lo note.
  const exportados = new Set();
  for (const archivo of fs.readdirSync(DATOS).filter((n) => n.endsWith('.js'))) {
    const modulo = await import(pathToFileURL(path.join(DATOS, archivo)).href);
    for (const nombre of Object.keys(modulo)) exportados.add(`${archivo}:${nombre}`);
  }
  const mapeados = new Set(Object.values(CLAVES).map(([a, n]) => `${a}:${n}`));
  const sinClave = [...exportados].filter((e) => !mapeados.has(e));
  if (sinClave.length) throw new Error(`Exports de src/datos sin clave en CLAVES: ${sinClave.join(', ')}`);

  const salida = {};
  for (const [clave, [archivo, nombre]] of Object.entries(CLAVES)) {
    const modulo = await import(pathToFileURL(path.join(DATOS, archivo)).href);
    const valor = modulo[nombre];
    if (valor === undefined) throw new Error(`${archivo} no exporta ${nombre}`);
    const ida = JSON.parse(JSON.stringify(valor));
    if (!isDeepStrictEqual(ida, valor)) {
      throw new Error(`${clave} (${archivo}:${nombre}) tiene valores que no caben en JSON`);
    }
    salida[clave] = ida;
  }

  fs.mkdirSync(path.dirname(path.resolve(destino)), { recursive: true });
  fs.writeFileSync(destino, `${JSON.stringify(salida, null, 1)}\n`);
  console.log(`${Object.keys(salida).length} documentos → ${destino}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
