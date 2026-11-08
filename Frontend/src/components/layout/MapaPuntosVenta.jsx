// MapaPuntosVenta.jsx

'use client';

/* ============================================================
   MAPA DE PUNTOS DE VENTA — Fely Campo
   Mapa mínimo (Leaflet + teselas CARTO Positron, sin etiquetas de
   marca ni clustering) + listado accesible agrupado por país (España
   primero, resto por cercanía real, ver "paises" más abajo) que
   sincroniza con los marcadores. Pensado para reutilizarse tal cual
   en /puntos-de-venta-fely-campo además de al final de
   /visita-fely-campo (ver "puntos" más abajo).

   Por qué así:
   - Leaflet se importa dentro de useEffect (dynamic import), nunca en
     el cuerpo del módulo: su bundle toca `window` al cargar, y este
     componente igual se renderiza primero en el servidor aunque sea
     'use client' — importarlo antes de montar rompería el SSR.
   - Marcadores como L.circleMarker (SVG, sin iconos de imagen): evita
     el problema clásico de los iconos por defecto de Leaflet con
     bundlers, y mantiene el peso al mínimo con ~70 puntos.
   - El mapa se crea una vez, al montar; los marcadores van en una capa
     aparte que se vuelve a pintar si cambian los puntos (la vista previa
     del admin: ?previa=puntos-venta, ver usePrevia.js).
   - El mapa lleva aria-hidden: el listado de abajo (botones reales,
     focusables) es el camino accesible por teclado a cada punto —
     clicarlo mueve el mapa (flyTo) y abre su popup.
   - matchMedia('prefers-reduced-motion') desactiva el flyTo animado
     en favor de un salto directo (setView), mismo criterio que el
     resto del sitio (ver CuadriculaProductos.module.css).
   - Guarda contra el doble-montaje de Strict Mode en desarrollo
     (mapContainer._leaflet_id) para no reventar con "Map container is
     already initialized".
   ============================================================ */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CabeceraSeccion, Input, Boton } from '@/components/ui';
import {
  ID_PREVIA_PUNTOS, EDITOR_PUNTOS, conDatosDeSede, obtenerPuntosVenta, puntosPublicados,
} from '@/lib/puntosVenta';
import BarraPrevia from './BarraPrevia';
import usePrevia from './usePrevia';
import styles from './MapaPuntosVenta.module.css';
import { useTextoCabecera } from './CabeceraPagina';
import 'leaflet/dist/leaflet.css';
import { atributosImagen, srcSetDe } from '@/lib/imagenes';

const CENTRO_EUROPA = [47, 8];
const ZOOM_INICIAL = 4;

// Distancia real (haversine, km) entre dos {lat, lng} — compartida por
// "paises" (orden de los grupos del listado) y "buscarPorCp" (más
// abajo), antes duplicada solo dentro de "paises".
function distanciaKm(a, b) {
  const R = 6371;
  const aRad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * aRad;
  const dLng = (b.lng - a.lng) * aRad;
  const sen = Math.sin(dLat / 2) ** 2
    + Math.cos(a.lat * aRad) * Math.cos(b.lat * aRad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(sen));
}

// "Buscar el más cercano por código postal" (ver buscarPorCp más
// abajo): sin geocodificador real de por medio, se aproxima el CP
// introducido a la capital de su provincia (2 primeros dígitos, código
// postal español estándar) y desde ahí se mide la distancia real a
// cada punto de PUNTOS_VENTA (lat/lng ya vienen a nivel de ciudad, ver
// comentario de cabecera de puntosVenta.js) — no es la dirección
// exacta del usuario, pero acierta la sede más cercana en la inmensa
// mayoría de casos, que es lo que pide la función. Coordenadas
// aproximadas de cada capital de provincia, mismo criterio que
// CAPITALES_APROX más abajo (dato público, no geocodificado a mano).
const CAPITALES_PROVINCIA = {
  '01': { lat: 42.8467, lng: -2.6716 }, '02': { lat: 38.9943, lng: -1.8585 },
  '03': { lat: 38.3452, lng: -0.4810 }, '04': { lat: 36.8381, lng: -2.4597 },
  '05': { lat: 40.6566, lng: -4.6818 }, '06': { lat: 38.8794, lng: -6.9707 },
  '07': { lat: 39.5696, lng: 2.6502 }, '08': { lat: 41.3851, lng: 2.1734 },
  '09': { lat: 42.3439, lng: -3.6969 }, '10': { lat: 39.4753, lng: -6.3724 },
  '11': { lat: 36.5271, lng: -6.2886 }, '12': { lat: 39.9864, lng: -0.0513 },
  '13': { lat: 38.9848, lng: -3.9272 }, '14': { lat: 37.8882, lng: -4.7794 },
  '15': { lat: 43.3623, lng: -8.4115 }, '16': { lat: 40.0704, lng: -2.1374 },
  '17': { lat: 41.9794, lng: 2.8214 }, '18': { lat: 37.1773, lng: -3.5986 },
  '19': { lat: 40.6333, lng: -3.1669 }, '20': { lat: 43.3183, lng: -1.9812 },
  '21': { lat: 37.2614, lng: -6.9447 }, '22': { lat: 42.1401, lng: -0.4089 },
  '23': { lat: 37.7796, lng: -3.7849 }, '24': { lat: 42.5987, lng: -5.5671 },
  '25': { lat: 41.6176, lng: 0.6200 }, '26': { lat: 42.4627, lng: -2.4449 },
  '27': { lat: 43.0121, lng: -7.5560 }, '28': { lat: 40.4168, lng: -3.7038 },
  '29': { lat: 36.7213, lng: -4.4214 }, '30': { lat: 37.9922, lng: -1.1307 },
  '31': { lat: 42.8125, lng: -1.6458 }, '32': { lat: 42.3364, lng: -7.8632 },
  '33': { lat: 43.3603, lng: -5.8448 }, '34': { lat: 42.0096, lng: -4.5288 },
  '35': { lat: 28.1235, lng: -15.4363 }, '36': { lat: 42.4310, lng: -8.6444 },
  '37': { lat: 40.9701, lng: -5.6635 }, '38': { lat: 28.4636, lng: -16.2518 },
  '39': { lat: 43.4623, lng: -3.8099 }, '40': { lat: 40.9429, lng: -4.1088 },
  '41': { lat: 37.3891, lng: -5.9845 }, '42': { lat: 41.7636, lng: -2.4649 },
  '43': { lat: 41.1189, lng: 1.2445 }, '44': { lat: 40.3456, lng: -1.1065 },
  '45': { lat: 39.8628, lng: -4.0273 }, '46': { lat: 39.4699, lng: -0.3763 },
  '47': { lat: 41.6523, lng: -4.7245 }, '48': { lat: 43.2630, lng: -2.9350 },
  '49': { lat: 41.5033, lng: -5.7446 }, '50': { lat: 41.6488, lng: -0.8891 },
  '51': { lat: 35.8894, lng: -5.3213 }, '52': { lat: 35.2923, lng: -2.9381 },
};

// Foto de cada punto de venta ("foto" en src/datos/puntosVenta.js):
// miniatura 3:4 en public/img/atelier/puntos-de-venta/ (o la que se suba
// en el admin). Sin foto, cicla por posición entre las 3 miniaturas de
// respaldo.
const CARPETA_FOTOS = '/img/atelier/puntos-de-venta';
const IMAGENES_FALLBACK = ['respaldo-salamanca', 'respaldo-madrid', 'respaldo-oviedo'];

function imagenDe(punto, indice) {
  if (punto.foto) return punto.foto;
  return `${CARPETA_FOTOS}/fely-campo-punto-de-venta-${IMAGENES_FALLBACK[indice % IMAGENES_FALLBACK.length]}.webp`;
}

// Los textos del popup van como HTML: se escapan (los escribe el admin).
const escapar = (texto) => String(texto).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

// Lo publicado y, en la vista previa, el punto que se está editando
// ("enfocar"), para abrirlo en el mapa.
const PUBLICADO = { puntos: obtenerPuntosVenta(), enfocar: '' };

// Coordenadas aproximadas (capital) de cada país presente en
// puntosVenta.js — usadas SOLO para ordenar los países por cercanía a
// España (ver "paises" más abajo), no para el mapa en sí. Con pocos
// puntos por país, el centroide de sus propias tiendas queda sesgado
// (ej. el único punto de Francia está en Verlinghem, cerca de Bélgica,
// muy al norte del país — con su centroide de tiendas, Francia salía
// más lejos que Suiza). La capital real evita ese sesgo. Un país que no
// esté aquí (nuevo en puntosVenta.js) cae al centroide de sus tiendas
// como respaldo, ver "centroPais" más abajo — nunca rompe, solo pierde
// la precisión extra.
const CAPITALES_APROX = {
  España: { lat: 40.4168, lng: -3.7038 },
  Francia: { lat: 48.8566, lng: 2.3522 },
  Suiza: { lat: 46.9480, lng: 7.4474 },
  Luxemburgo: { lat: 49.6117, lng: 6.1319 },
  'Reino Unido': { lat: 51.5074, lng: -0.1278 },
  Bélgica: { lat: 50.8503, lng: 4.3517 },
  Italia: { lat: 41.9028, lng: 12.4964 },
  Irlanda: { lat: 53.3498, lng: -6.2603 },
  Austria: { lat: 48.2082, lng: 16.3738 },
  Alemania: { lat: 52.5200, lng: 13.4050 },
  'Estados Unidos': { lat: 38.9072, lng: -77.0369 },
};

// Código ISO 3166-1 alpha-2 de cada país — solo para el nombre de
// archivo del banderín circular (ver .listaGrupoBandera en
// MapaPuntosVenta.module.css). SVGs 1x1 (recorte cuadrado, pensado para
// clip circular por CSS) sacados una vez del paquete flag-icons a
// public/img/flags/ — no es una dependencia del proyecto, solo los 11
// SVG que hacían falta, así no arrastra el paquete entero a producción.
const CODIGO_PAIS = {
  España: 'es',
  Francia: 'fr',
  Suiza: 'ch',
  Luxemburgo: 'lu',
  'Reino Unido': 'gb',
  Bélgica: 'be',
  Italia: 'it',
  Irlanda: 'ie',
  Austria: 'at',
  Alemania: 'de',
  'Estados Unidos': 'us',
};

function MapaPuntosVenta({ className }) {
  const t = useTranslations('puntosVenta');
  // Título y texto de encima: lib/cabeceras.js (Puntos de venta), con
  // vista previa en su página.
  const textoCabecera = useTextoCabecera('puntos-de-venta');
  const { datos, enPrevia } = usePrevia(ID_PREVIA_PUNTOS, PUBLICADO);
  // Los ateliers propios, con la dirección y el teléfono de su página.
  const puntos = useMemo(() => puntosPublicados(datos.puntos.map((punto) => conDatosDeSede(punto))), [datos.puntos]);
  const contenedorRef = useRef(null);
  const mapaRef = useRef(null);
  const leafletRef = useRef(null);
  const capaRef = useRef(null);
  const marcadoresRef = useRef(new Map());
  const [mapaListo, setMapaListo] = useState(false);

  // Orden de países — no alfabético: España primero, luego el resto de
  // más cerca a más lejos (distancia real, haversine, entre el
  // centroide de España y el de cada país — reutiliza el lat/lng que ya
  // trae cada punto, sin mantener una lista de países a mano que se
  // quedaría corta en cuanto se añada uno nuevo a puntosVenta.js).
  // Alimenta los grupos del listado de abajo (ver "gruposVisibles").
  const paises = useMemo(() => {
    const porPais = new Map();
    puntos.forEach((punto) => {
      if (!porPais.has(punto.pais)) porPais.set(punto.pais, []);
      porPais.get(punto.pais).push(punto);
    });

    const centroideTiendas = (lista) => {
      const suma = lista.reduce((acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }), { lat: 0, lng: 0 });
      return { lat: suma.lat / lista.length, lng: suma.lng / lista.length };
    };

    const centroPais = (pais) => CAPITALES_APROX[pais] || centroideTiendas(porPais.get(pais));

    const centroEspana = centroPais('España');

    return [...porPais.keys()].sort((a, b) => {
      if (a === 'España') return -1;
      if (b === 'España') return 1;
      return distanciaKm(centroEspana, centroPais(a)) - distanciaKm(centroEspana, centroPais(b));
    });
  }, [puntos]);

  // Agrupa el listado por país en el mismo orden que "paises" — un
  // grupo por país con su propio título (ver .listaGrupoTitulo).
  const gruposVisibles = useMemo(
    () => paises
      .map((pais) => ({ pais, puntos: puntos.filter((punto) => punto.pais === pais) }))
      .filter((grupo) => grupo.puntos.length > 0),
    [paises, puntos],
  );

  useEffect(() => {
    let cancelado = false;

    async function montar() {
      if (!contenedorRef.current || contenedorRef.current._leaflet_id) return;

      const L = (await import('leaflet')).default;
      if (cancelado) return;

      const mapa = L.map(contenedorRef.current, {
        center: CENTRO_EUROPA,
        zoom: ZOOM_INICIAL,
        minZoom: 2,
        maxZoom: 17,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      // Teselas estándar de OpenStreetMap — sin API key ni cuenta de
      // por medio (CARTO Positron dejó de servir su capa gratuita sin
      // key). Se desatura por CSS (ver .mapa :global(.leaflet-tile-pane)
      // en MapaPuntosVenta.module.css) para acercarla al resto del sitio.
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapa);

      leafletRef.current = L;
      capaRef.current = L.layerGroup().addTo(mapa);
      mapaRef.current = mapa;
      setMapaListo(true);
    }

    montar();

    return () => {
      cancelado = true;
      if (mapaRef.current) {
        mapaRef.current.remove();
        mapaRef.current = null;
      }
      marcadoresRef.current.clear();
      setMapaListo(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Los marcadores: se pintan al estar el mapa y otra vez si cambian los
  // puntos (vista previa).
  useEffect(() => {
    if (!mapaListo) return;
    const L = leafletRef.current;
    const mapa = capaRef.current;
    mapa.clearLayers();
    marcadoresRef.current.clear();

    // Marcador cuadrado: Leaflet no tiene un "squareMarker" (circleMarker
    // solo dibuja círculos), así que es un L.marker con un divIcon —
    // un <span> cuadrado por CSS (ver .marcador en
    // MapaPuntosVenta.module.css), sin imagen de icono de por medio.
    const icono = L.divIcon({
      className: styles.marcador,
      iconSize: [9, 9],
      iconAnchor: [4.5, 4.5],
      popupAnchor: [0, -4],
    });

    puntos.forEach((punto) => {
      const marcador = L.marker([punto.lat, punto.lng], { icon: icono });

      const lineasDireccion = punto.direccion.map(escapar).join('<br>');
      const contacto = [
        punto.telefono && `<a href="tel:${punto.telefono.replace(/[^+\d]/g, '')}">${escapar(punto.telefono)}</a>`,
        punto.email && `<a href="mailto:${escapar(punto.email)}">${escapar(punto.email)}</a>`,
      ].filter(Boolean).join('<br>');
      const enlaceDirecciones = `https://www.google.com/maps/dir/?api=1&destination=${punto.lat},${punto.lng}`;

      marcador.bindPopup(
        `<p class="${styles.popupNombre}">${escapar(punto.nombre)}</p>` +
        `<p class="${styles.popupTexto}">${lineasDireccion}</p>` +
        (contacto ? `<p class="${styles.popupTexto}">${contacto}</p>` : '') +
        `<a class="${styles.popupEnlace}" href="${enlaceDirecciones}" target="_blank" rel="noopener noreferrer">${t('direcciones')}</a>`,
        { closeButton: true },
      );

      marcadoresRef.current.set(punto.id, marcador);
      marcador.addTo(mapa);
    });

    // Vista previa: abre el punto que se está editando.
    const enfocado = datos.enfocar && marcadoresRef.current.get(datos.enfocar);
    if (enfocado) {
      mapaRef.current.setView(enfocado.getLatLng(), 13);
      enfocado.openPopup();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapaListo, puntos, datos.enfocar]);

  function irAPunto(punto) {
    const marcador = marcadoresRef.current.get(punto.id);
    if (!mapaRef.current || !marcador) return;

    const reducirMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducirMovimiento) {
      mapaRef.current.setView([punto.lat, punto.lng], 13);
    } else {
      mapaRef.current.flyTo([punto.lat, punto.lng], 13, { duration: 0.6 });
    }
    marcador.openPopup();
  }

  // "Encuentra tu punto de venta más cercano" (ver CAPITALES_PROVINCIA
  // arriba para el porqué de aproximar por provincia) — solo entre los
  // puntos de España (un código postal español no tiene sentido
  // comparado contra Italia o Reino Unido). Al encontrarlo, vuela el
  // mapa hasta él y abre su popup (mismo "irAPunto" que ya usa el
  // listado de abajo al clicar una tarjeta) — eso ya es la confirmación
  // visual, sin texto aparte con el nombre (quitado a petición).
  const [codigoPostal, setCodigoPostal] = useState('');
  const [errorCp, setErrorCp] = useState(false);

  function buscarPorCp(evento) {
    evento.preventDefault();
    const cp = codigoPostal.trim();
    const prefijo = cp.slice(0, 2);
    const centroProvincia = /^\d{5}$/.test(cp) ? CAPITALES_PROVINCIA[prefijo] : null;

    if (!centroProvincia) {
      setErrorCp(true);
      return;
    }

    setErrorCp(false);
    const puntosEspana = puntos.filter((punto) => punto.pais === 'España');
    const masCercano = puntosEspana.reduce((mejor, punto) => (
      distanciaKm(centroProvincia, punto) < distanciaKm(centroProvincia, mejor) ? punto : mejor
    ), puntosEspana[0]);

    irAPunto(masCercano);
  }

  return (
    <div className={`${styles.seccion} ${className || ''}`}>
      <CabeceraSeccion
        title={textoCabecera('mapaTitulo')}
        description={textoCabecera('mapaTexto')}
        alinear="start"
      />

      {/* Entre la intro y el mapa, a petición — busca por código
          postal (aproximado a la provincia, ver CAPITALES_PROVINCIA)
          en vez de navegar el listado entero a mano. Sin "etiqueta"
          propia (Input, ui/): la propia intro de arriba ya termina en
          "Encuentra tu punto de venta más cercano", repetirlo aquí
          encima del campo era redundante. */}
      <form className={styles.buscarCp} onSubmit={buscarPorCp}>
        <Input
          nombre="codigoPostal"
          placeholder={t('buscarCpPlaceholder')}
          valor={codigoPostal}
          onChange={(evento) => { setCodigoPostal(evento.target.value); setErrorCp(false); }}
          className={styles.buscarCpInput}
        />
        <Boton variante="contorno" type="submit">{t('buscarCpBoton')}</Boton>
      </form>

      {errorCp && <p className={styles.buscarCpAviso}>{t('buscarCpError')}</p>}

      <div className={styles.layout}>
        <div ref={contenedorRef} className={styles.mapa} role="presentation" aria-hidden="true" />

        <div className={styles.lista} aria-label={textoCabecera('mapaTitulo')}>
          {gruposVisibles.map((grupo) => (
            <section key={grupo.pais} className={styles.listaGrupo}>
              <h3 className={styles.listaGrupoTitulo}>
                {CODIGO_PAIS[grupo.pais] && (
                  <img
                    {...atributosImagen(`/img/flags/${CODIGO_PAIS[grupo.pais]}.svg`, { sizes: '120px' })}
                    alt=""
                    aria-hidden="true"
                    className={styles.listaGrupoBandera}
                  />
                )}
                {grupo.pais}
              </h3>
              <ul className={styles.listaGrupoItems}>
                {grupo.puntos.map((punto) => {
                  const indice = puntos.indexOf(punto);
                  return (
                    <li key={punto.id}>
                      <button type="button" className={styles.puntoBtn} onClick={() => irAPunto(punto)}>
                        <img
                          src={imagenDe(punto, indice)} srcSet={srcSetDe(imagenDe(punto, indice))} sizes="120px"
                          alt=""
                          loading="lazy"
                          decoding="async"
                          aria-hidden="true"
                          className={styles.puntoImagen}
                        />
                        <span className={styles.puntoTextos}>
                          <span className={styles.puntoNombre}>{punto.nombre}</span>
                          <span className={styles.puntoTexto}>{punto.direccion.join('\n')}</span>
                          {(punto.telefono || punto.email) && (
                            <span className={styles.puntoTexto}>
                              {[punto.telefono, punto.email].filter(Boolean).join('\n')}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>

      {enPrevia && <BarraPrevia editor={datos.enfocar ? `${EDITOR_PUNTOS}?punto=${datos.enfocar}` : EDITOR_PUNTOS} />}
    </div>
  );
}

export default MapaPuntosVenta;
