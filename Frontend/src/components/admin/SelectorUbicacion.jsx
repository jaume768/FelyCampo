'use client';

/* ============================================================
   SELECTOR DE UBICACIÓN — Fely Campo (admin)
   Un mapa pequeño para decir dónde está un punto de venta, sin escribir
   coordenadas: «Buscar la dirección en el mapa» lo coloca solo (con el
   buscador gratuito de OpenStreetMap, Nominatim) y, si no acierta, se
   pincha en el mapa o se arrastra el marcador al sitio exacto.
   Mismo mapa (Leaflet + OpenStreetMap) que el de la web.
   Uso:
     <SelectorUbicacion lat={40.97} lng={-5.66} direccion="C/ …, Salamanca, España"
       onChange={({ lat, lng }) => …} />
   ============================================================ */

import { useEffect, useRef, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { Boton } from '@/components/ui';
import campos from './CamposEditor.module.css';
import styles from './SelectorUbicacion.module.css';
import 'leaflet/dist/leaflet.css';

const CENTRO_EUROPA = [46, 4];
const redondear = (numero) => Math.round(numero * 10000) / 10000;

function SelectorUbicacion({
  lat, lng, direccion, onChange,
}) {
  const contenedor = useRef(null);
  const mapa = useRef(null);
  const marcador = useRef(null);
  const leaflet = useRef(null);
  const alCambiar = useRef(onChange);
  const [listo, setListo] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState('');
  const marcado = typeof lat === 'number' && typeof lng === 'number';

  alCambiar.current = onChange;

  // El mapa, una vez.
  useEffect(() => {
    let cancelado = false;
    (async () => {
      if (!contenedor.current || contenedor.current._leaflet_id) return;
      const L = (await import('leaflet')).default;
      if (cancelado) return;
      const nuevo = L.map(contenedor.current, {
        center: CENTRO_EUROPA, zoom: 4, minZoom: 2, maxZoom: 18, scrollWheelZoom: false,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(nuevo);
      nuevo.on('click', (evento) => {
        alCambiar.current({ lat: redondear(evento.latlng.lat), lng: redondear(evento.latlng.lng) });
      });
      leaflet.current = L;
      mapa.current = nuevo;
      setListo(true);
    })();
    return () => {
      cancelado = true;
      mapa.current?.remove();
      mapa.current = null;
      marcador.current = null;
      setListo(false);
    };
  }, []);

  // El marcador: sigue a lat/lng y se puede arrastrar.
  useEffect(() => {
    if (!listo) return;
    const L = leaflet.current;
    if (!marcado) {
      marcador.current?.remove();
      marcador.current = null;
      return;
    }
    if (!marcador.current) {
      const icono = L.divIcon({
        className: styles.marcador, iconSize: [22, 22], iconAnchor: [11, 11],
      });
      marcador.current = L.marker([lat, lng], { icon: icono, draggable: true }).addTo(mapa.current);
      marcador.current.on('dragend', () => {
        const posicion = marcador.current.getLatLng();
        alCambiar.current({ lat: redondear(posicion.lat), lng: redondear(posicion.lng) });
      });
      mapa.current.setView([lat, lng], Math.max(mapa.current.getZoom(), 14));
    } else {
      marcador.current.setLatLng([lat, lng]);
    }
  }, [listo, marcado, lat, lng]);

  async function buscar() {
    setAviso('');
    if (!direccion.trim()) {
      setAviso('Escribe primero la dirección (arriba).');
      return;
    }
    setBuscando(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=es&q=${encodeURIComponent(direccion)}`;
      const respuesta = await fetch(url, { headers: { Accept: 'application/json' } });
      const [encontrado] = respuesta.ok ? await respuesta.json() : [];
      if (!encontrado) {
        setAviso('No la encuentro. Pincha tú en el mapa donde está (puedes acercarte con el botón +).');
        return;
      }
      const posicion = { lat: redondear(Number(encontrado.lat)), lng: redondear(Number(encontrado.lon)) };
      alCambiar.current(posicion);
      mapa.current?.setView([posicion.lat, posicion.lng], 16);
      setAviso('Encontrada. Comprueba que el marcador está en su sitio; si no, arrástralo.');
    } catch {
      setAviso('No se ha podido buscar (¿hay internet?). Pincha tú en el mapa donde está.');
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className={styles.selector}>
      <div className={styles.barra}>
        <Boton variante="contorno" type="button" onClick={buscar} desactivado={buscando}>
          <Search size={14} aria-hidden="true" /> {buscando ? 'Buscando…' : 'Buscar la dirección en el mapa'}
        </Boton>
        <p className={`${styles.estado} ${marcado ? styles.estadoSi : styles.estadoNo}`}>
          <MapPin size={15} aria-hidden="true" />
          {marcado ? 'Marcado en el mapa' : 'Todavía sin marcar'}
        </p>
      </div>
      {aviso && <p className={campos.ayuda} role="status">{aviso}</p>}
      <div ref={contenedor} className={styles.mapa} />
      <p className={campos.ayuda}>
        Pincha en el mapa para poner el punto o arrastra el marcador para moverlo.
        {marcado && ` (Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)})`}
      </p>
    </div>
  );
}

export default SelectorUbicacion;
