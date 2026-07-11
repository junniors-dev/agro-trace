// Pantalla "Validación satelital de parcela" (pantalla #4 de la rúbrica).
// Muestra la parcela sobre imagen satelital, su estado EUDR (Validado/Alerta),
// datos del predio (fuente Google Earth Engine) e historial de validaciones.
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import AppShell from '../components/layout/AppShell.jsx';
import ParcelaSatMap from '../components/map/ParcelaSatMap.jsx';
import { Card, Badge } from '../components/ui/index.jsx';
import {
  IconArrowLeft, IconPin, IconCalendar, IconUser, IconShield, IconCheckCircle,
} from '../components/icons.jsx';

export default function ValidacionParcela() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.parcela(id).then((d) => setP(d.parcela)).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <AppShell headerVariant="green"><Card className="p-6 text-center text-sm text-alerta">{error}</Card></AppShell>;
  if (!p) return <AppShell headerVariant="green"><p className="py-10 text-center text-sm text-gray-400">Cargando parcela…</p></AppShell>;

  const validado = p.estado_satelital !== 'alerta';

  return (
    <AppShell headerVariant="green">
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="text-bosque"><IconArrowLeft width={22} height={22} /></button>
        <h1 className="font-display text-lg font-bold text-bosque">Validación satelital</h1>
      </div>

      {/* Mapa satelital con estado */}
      <div className="relative mb-4">
        <ParcelaSatMap parcela={p} height={240} />
        <div className={`absolute right-3 top-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white shadow ${validado ? 'bg-hoja' : 'bg-alerta'}`}>
          <IconCheckCircle width={18} height={18} />
          <div className="leading-tight">
            {validado ? 'VALIDADO' : 'ALERTA'}
            <span className="block text-[10px] font-normal opacity-90">
              {validado ? 'Libre de deforestación' : 'Posible no-conformidad'}
            </span>
          </div>
        </div>
      </div>

      {/* Datos de la parcela */}
      <Card className="mb-4 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display font-bold text-bosque">{p.codigo} · {p.nombre}</h2>
          <Badge estado={validado ? 'validado' : 'alerta'} />
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Dato Icon={IconPin} label="Coordenadas" valor={`${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`} />
          <Dato Icon={IconShield} label="Área" valor={`${p.area_ha} ha`} />
          <Dato Icon={IconUser} label="Propietario" valor={p.propietario} />
          <Dato Icon={IconCalendar} label="Fecha de análisis" valor={p.fecha_analisis} />
        </div>
        <p className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-400">
          Fuente de datos: {p.fuente}
        </p>
      </Card>

      {/* Historial de validaciones */}
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-bosque/70">Historial de validaciones</h2>
      <div className="space-y-2.5">
        {p.historial.map((h, i) => (
          <Card key={i} className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${h.estado === 'alerta' ? 'bg-alerta/12 text-alerta' : 'bg-hoja/12 text-bosque'}`}>
                <IconShield width={18} height={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{p.codigo} · {p.nombre.split(' ').slice(-1)}</p>
                <p className="text-xs text-gray-400">{h.fecha} · {h.area_ha} ha</p>
              </div>
            </div>
            <Badge estado={h.estado === 'alerta' ? 'alerta' : 'validado'} />
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

function Dato({ Icon, label, valor }) {
  return (
    <div className="flex items-start gap-2">
      <Icon width={16} height={16} className="mt-0.5 text-bosque/60" />
      <div>
        <p className="text-[11px] text-gray-400">{label}</p>
        <p className="font-medium text-gray-700">{valor}</p>
      </div>
    </div>
  );
}
