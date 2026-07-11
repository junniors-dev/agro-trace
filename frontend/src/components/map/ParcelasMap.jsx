// Mapa de parcelas con Leaflet + OpenStreetMap (sin API key).
// Inicializa Leaflet manualmente en un useEffect para evitar dependencias de version.
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

export default function ParcelasMap({ parcelas = [], height = 240 }) {
  const navigate = useNavigate();
  const contenedorRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current || !contenedorRef.current) return;

    // Centro aproximado de la region Lambayeque
    const map = L.map(contenedorRef.current, {
      center: [-6.35, -79.85],
      zoom: 9,
      scrollWheelZoom: false,
      attributionControl: false,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Dibuja/actualiza los marcadores cuando cambian las parcelas
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

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
      // Al hacer click en el marcador, abre la validacion satelital de la parcela
      marker.on('click', () => navigate(`/parcela/${p.id}`));
      puntos.push([p.lat, p.lng]);
    });

    if (puntos.length > 1) {
      map.fitBounds(puntos, { padding: [30, 30], maxZoom: 11 });
    }

    return () => capa.remove();
  }, [parcelas]);

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
