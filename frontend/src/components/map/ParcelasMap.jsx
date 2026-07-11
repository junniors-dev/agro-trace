// Mapa de parcelas: usa Leaflet + OpenStreetMap cuando hay internet, y cae a un
// mapa SVG estilizado (ParcelasMapOffline) si no hay conexión o fallan los mosaicos.
// Así el Dashboard nunca se ve roto en una demo sin wifi.
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import ParcelasMapOffline from './ParcelasMapOffline.jsx';

export default function ParcelasMap({ parcelas = [], height = 240 }) {
  const navigate = useNavigate();
  const contenedorRef = useRef(null);
  const mapRef = useRef(null);
  // offline si el navegador reporta sin conexión o si fallan los mosaicos
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && !navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => {
    if (offline) return; // no montamos Leaflet en modo offline
    if (mapRef.current || !contenedorRef.current) return;

    const map = L.map(contenedorRef.current, {
      center: [-6.35, -79.85],
      zoom: 9,
      scrollWheelZoom: false,
      attributionControl: false,
    });
    mapRef.current = map;

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 });
    let errores = 0;
    tiles.on('tileerror', () => { errores += 1; if (errores >= 3) setOffline(true); });
    tiles.addTo(map);

    return () => { map.remove(); mapRef.current = null; };
  }, [offline]);

  // Marcadores (solo modo online/Leaflet)
  useEffect(() => {
    const map = mapRef.current;
    if (offline || !map) return;

    const capa = L.layerGroup().addTo(map);
    const puntos = [];
    parcelas.forEach((p) => {
      if (p.lat == null || p.lng == null) return;
      const alerta = p.estado_satelital === 'alerta';
      const color = alerta ? '#DC2626' : '#22C55E';
      const icon = L.divIcon({
        className: '',
        html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 0 0 2px ${color}55"></span>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      const marker = L.marker([p.lat, p.lng], { icon }).addTo(capa);
      marker.bindPopup(
        `<strong>${p.codigo}</strong> · ${p.nombre || ''}<br/>${p.distrito || ''} · ${
          alerta ? '⚠️ Alerta EUDR' : '✓ Validado'
        }<br/><span style="color:#14532D;font-weight:600">Ver validación →</span>`
      );
      marker.on('click', () => navigate(`/parcela/${p.id}`));
      puntos.push([p.lat, p.lng]);
    });
    if (puntos.length > 1) map.fitBounds(puntos, { padding: [30, 30], maxZoom: 11 });
    return () => capa.remove();
  }, [parcelas, offline, navigate]);

  if (offline) return <ParcelasMapOffline parcelas={parcelas} height={height} />;

  return (
    <div
      ref={contenedorRef}
      style={{ height }}
      className="w-full overflow-hidden rounded-2xl"
      role="img"
      aria-label="Mapa de parcelas en Lambayeque"
    />
  );
}
