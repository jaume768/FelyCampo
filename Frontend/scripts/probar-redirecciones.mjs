// Prueba el mapa de redirecciones 301 (docs/redirecciones-301.csv) contra
// un servidor en marcha. Para cada URL antigua comprueba:
//   1. responde 301 (308 en la raíz no aplica: "/" la resuelve next-intl),
//   2. en UN solo salto, al destino del CSV,
//   3. y que ese destino responde 200.
// Uso:
//   node scripts/probar-redirecciones.mjs                 → http://localhost:3000
//   node scripts/probar-redirecciones.mjs https://staging.example.com
// Sale con código 1 si alguna falla — sirve para la comprobación previa al
// lanzamiento, contra staging y otra vez contra producción tras el cambio de DNS.

import fs from 'node:fs';

const base = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const filas = fs.readFileSync(new URL('../docs/redirecciones-301.csv', import.meta.url), 'utf8')
  .trim().split(/\r?\n/).slice(1)
  .map((linea) => linea.split(','))
  .map(([antigua, nueva]) => [new URL(antigua).pathname, new URL(nueva).pathname]);

const destinosOk = new Map();
const fallos = [];

async function probar([origen, destino]) {
  if (origen === '/') return;
  const r = await fetch(base + origen, { redirect: 'manual' });
  const location = r.headers.get('location') || '';
  const llega = location ? new URL(location, base).pathname : '';
  if (r.status !== 301 || llega !== destino) {
    fallos.push(`${origen} → ${r.status} ${llega || '(sin Location)'} (esperado 301 ${destino})`);
    return;
  }
  if (!destinosOk.has(destino)) {
    destinosOk.set(destino, fetch(base + destino, { redirect: 'manual' }).then((d) => d.status));
  }
  const estado = await destinosOk.get(destino);
  if (estado !== 200) fallos.push(`${origen} → ${destino} responde ${estado}`);
}

// En tandas de 10 para no saturar el servidor.
for (let i = 0; i < filas.length; i += 10) {
  await Promise.all(filas.slice(i, i + 10).map(probar));
}

console.log(`${filas.length} redirecciones probadas contra ${base} · ${destinosOk.size} destinos distintos · ${fallos.length} fallos`);
fallos.forEach((f) => console.log(`  ✗ ${f}`));
process.exit(fallos.length ? 1 : 0);
