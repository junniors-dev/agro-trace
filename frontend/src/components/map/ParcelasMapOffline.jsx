// Mapa SVG estilizado de la región Lambayeque (fallback sin internet).
// Proyecta las parcelas por lat/lng dentro de una caja fija de la región,
// para que el Dashboard siga viéndose bien aunque no haya señal (mosaicos OSM).
import { useNavigate } from 'react-router-dom';

// Caja aproximada de la zona productora de Lambayeque
const LAT_MAX = -5.75, LAT_MIN = -6.95;   // norte -> sur
const LNG_MIN = -80.05, LNG_MAX = -79.45; // oeste -> este

// Ciudades de referencia (aprox) para orientar
const CIUDADES = [
  { nombre: 'Olmos', lat: -5.99, lng: -79.75 },
  { nombre: 'Motupe', lat: -6.15, lng: -79.71 },
  { nombre: 'Jayanca', lat: -6.36, lng: -79.81 },
  { nombre: 'Ferreñafe', lat: -6.64, lng: -79.79 },
  { nombre: 'Chiclayo', lat: -6.77, lng: -79.84 },
];

const W = 340, H = 240, PAD = 14;

function proj(lat, lng) {
  const x = PAD + ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * (W - 2 * PAD);
  const y = PAD + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (H - 2 * PAD);
  return [Math.max(PAD, Math.min(W - PAD, x)), Math.max(PAD, Math.min(H - PAD, y))];
}

export default function ParcelasMapOffline({ parcelas = [], height = 220 }) {
  const navigate = useNavigate();

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-hoja/20" style={{ height }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        {/* Fondo tierra */}
        <rect width={W} height={H} fill="#eef2ea" />
        {/* Mar (franja oeste) */}
        <rect x="0" y="0" width="42" height={H} fill="#d6e6ea" />
        <path d="M42 0 C 50 60, 36 120, 46 180 L 42 240 L 0 240 L 0 0 Z" fill="#d6e6ea" />
        {/* Grilla suave */}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`v${i}`} x1={(W / 6) * i} y1="0" x2={(W / 6) * i} y2={H} stroke="#14532D" strokeOpacity="0.05" />
        ))}
        {Array.from({ length: 4 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={(H / 4) * i} x2={W} y2={(H / 4) * i} stroke="#14532D" strokeOpacity="0.05" />
        ))}

        {/* Ciudades de referencia */}
        {CIUDADES.map((c) => {
          const [x, y] = proj(c.lat, c.lng);
          return (
            <g key={c.nombre}>
              <circle cx={x} cy={y} r="1.6" fill="#9ca3af" />
              <text x={x + 4} y={y + 3} fontSize="7.5" fill="#6b7280" fontFamily="Inter, sans-serif">{c.nombre}</text>
            </g>
          );
        })}

        {/* Parcelas */}
        {parcelas.map((p) => {
          if (p.lat == null || p.lng == null) return null;
          const [x, y] = proj(p.lat, p.lng);
          const alerta = p.estado_satelital === 'alerta';
          const color = alerta ? '#DC2626' : '#22C55E';
          return (
            <g key={p.id} onClick={() => navigate(`/parcela/${p.id}`)} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r="7" fill={color} fillOpacity="0.25" />
              <circle cx={x} cy={y} r="4" fill={color} stroke="#fff" strokeWidth="1.5" />
              <title>{`${p.codigo} · ${p.nombre} · ${alerta ? 'Alerta EUDR' : 'Validado'}`}</title>
            </g>
          );
        })}
      </svg>

      {/* Etiqueta modo offline */}
      <div className="absolute left-2 top-2 rounded-full bg-ambar/90 px-2 py-0.5 text-[10px] font-semibold text-white">
        Mapa offline
      </div>
      <div className="absolute bottom-2 right-2 rounded-md bg-white/85 px-2 py-1 text-[9px] text-gray-500">
        Región Lambayeque
      </div>
    </div>
  );
}
