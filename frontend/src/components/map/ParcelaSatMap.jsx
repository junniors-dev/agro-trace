// Mapa satelital de una parcela (Esri World Imagery, sin API key) con el
// poligono del predio resaltado en verde (validado) o rojo (alerta).
import { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function ParcelaSatMap({ parcela, height = 260 }) {
  const ref = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current || !ref.current || !parcela) return;
    const { lat, lng } = parcela;
    const map = L.map(ref.current, { center: [lat, lng], zoom: 16, scrollWheelZoom: false, attributionControl: false });
    mapRef.current = map;

    // Imagen satelital de Esri (uso libre para demos)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
    }).addTo(map);

    // Poligono aproximado de la parcela (rectangulo alrededor del centro)
    const d = 0.0016;
    const alerta = parcela.estado_satelital === 'alerta';
    const color = alerta ? '#DC2626' : '#22C55E';
    L.polygon(
      [[lat + d, lng - d], [lat + d, lng + d], [lat - d, lng + d], [lat - d, lng - d]],
      { color, weight: 3, fillOpacity: 0.12 }
    ).addTo(map);

    setTimeout(() => map.invalidateSize(), 100);
    return () => { map.remove(); mapRef.current = null; };
  }, [parcela]);

  return <div ref={ref} style={{ height }} className="w-full overflow-hidden rounded-2xl" />;
}
