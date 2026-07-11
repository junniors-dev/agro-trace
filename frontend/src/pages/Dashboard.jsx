// Dashboard principal: monitor de parcelas (mapa) + indicadores clave + actividad reciente.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AppShell from '../components/layout/AppShell.jsx';
import ParcelasMap from '../components/map/ParcelasMap.jsx';
import { Card, Badge, Button } from '../components/ui/index.jsx';
import {
  IconShield, IconScale, IconWarehouse, IconQr, IconPlus, IconArrowRight,
} from '../components/icons.jsx';

export default function Dashboard() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [parcelas, setParcelas] = useState([]);

  useEffect(() => {
    api.dashboard().then(setData).catch(() => {});
    api.parcelas().then((d) => setParcelas(d.parcelas)).catch(() => {});
  }, []);

  const k = data?.kpis;
  const saludo = obtenerSaludo();

  const kpis = [
    { label: 'Lotes Certificados', valor: k?.lotesCertificados ?? '—', sub: 'Lotes registrados & validados', Icon: IconShield, color: 'text-bosque', bg: 'bg-hoja/12' },
    { label: 'Kg Trazados', valor: (k?.kgTrazados ?? 0).toLocaleString('es-PE'), sub: 'Total cosecha registrada', Icon: IconScale, color: 'text-bosque', bg: 'bg-hoja/12' },
    { label: 'Alertas EUDR', valor: k?.alertasEudr ?? '—', sub: 'No conformidades detectadas', Icon: IconWarehouse, color: 'text-alerta', bg: 'bg-alerta/12', alerta: true },
    { label: 'Certificados QR', valor: k?.certificadosQr ?? '—', sub: 'Códigos generados', Icon: IconQr, color: 'text-bosque', bg: 'bg-hoja/12' },
  ];

  return (
    <AppShell headerVariant="green">
      <p className="-mt-1 mb-3 text-sm text-gray-500">
        {saludo}, <span className="font-semibold text-bosque">{primerNombre(usuario?.nombre)}</span>
      </p>

      {/* Monitor de parcelas */}
      <section className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wide text-bosque/70">Monitor de parcelas</h2>
          <button onClick={() => navigate('/parcelas/nueva')} className="flex items-center gap-1 text-xs font-semibold text-bosque">
            <IconPlus width={15} height={15} /> Registrar parcela
          </button>
        </div>
        <ParcelasMap parcelas={parcelas} height={220} />
      </section>

      {/* Indicadores clave */}
      <section className="mb-5">
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-bosque/70">Indicadores clave</h2>
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="p-3.5">
              <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-full ${kpi.bg} ${kpi.color}`}>
                <kpi.Icon width={20} height={20} />
              </div>
              <p className="text-[11px] font-medium text-gray-500">{kpi.label}</p>
              <p className={`font-display text-2xl font-bold ${kpi.alerta ? 'text-alerta' : 'text-bosque'}`}>{kpi.valor}</p>
              <p className="mt-0.5 text-[10px] leading-tight text-gray-400">{kpi.sub}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Accion principal */}
      <Button className="mb-5 w-full" onClick={() => navigate('/registrar')}>
        <IconPlus width={20} height={20} /> Registrar nuevo lote
      </Button>

      {/* Actividad reciente */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wide text-bosque/70">Actividad reciente</h2>
          <button onClick={() => navigate('/lotes')} className="text-xs font-semibold text-bosque">Ver todos →</button>
        </div>
        <div className="space-y-2.5">
          {data?.actividad?.length ? (
            data.actividad.map((a) => (
              <Card
                key={a.id}
                className="flex items-center justify-between p-3.5"
                onClick={() => a.codigo && a.estado === 'certificado' ? navigate(`/verificar/${a.codigo}`) : navigate(`/registrar/${a.id}`)}
                role="button"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-800">
                    {a.codigo || `Lote #${a.id}`}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {a.producto} · {((a.peso_packing || a.peso_cosecha || 0) / 1000).toFixed(1)} ton · {a.distrito || 'Lambayeque'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge estado={a.estado === 'certificado' ? 'certificado' : 'en_progreso'} />
                  <IconArrowRight width={18} height={18} className="text-gray-300" />
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-5 text-center text-sm text-gray-400">Aún no hay lotes registrados.</Card>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function obtenerSaludo() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
function primerNombre(nombre) {
  return nombre ? nombre.split(' ')[0] : '';
}
