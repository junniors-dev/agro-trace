// Centro de notificaciones / alertas con filtros por categoria.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import AppShell from '../components/layout/AppShell.jsx';
import { Card } from '../components/ui/index.jsx';
import { IconArrowLeft, IconCheck } from '../components/icons.jsx';

const FILTROS = [
  { key: 'todas', label: 'Todas' },
  { key: 'urgente', label: 'Urgentes' },
  { key: 'informativa', label: 'Informativas' },
  { key: 'sistema', label: 'Sistema' },
];

const ESTILO_CAT = {
  urgente: { punto: 'bg-alerta', icono: 'bg-alerta', titulo: 'text-alerta' },
  exito: { punto: 'bg-hoja', icono: 'bg-hoja', titulo: 'text-bosque' },
  sistema: { punto: 'bg-blue-500', icono: 'bg-blue-500', titulo: 'text-blue-600' },
  informativa: { punto: 'bg-ambar', icono: 'bg-ambar', titulo: 'text-ambar' },
};

export default function Notificaciones() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [nuevas, setNuevas] = useState(0);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => { cargar(); }, []);
  function cargar() {
    api.notificaciones().then((d) => { setItems(d.notificaciones); setNuevas(d.nuevas); }).catch(() => {});
  }
  async function marcarTodas() {
    await api.leerTodasNotificaciones().catch(() => {});
    cargar();
  }

  const visibles = items.filter((n) => {
    if (filtro === 'todas') return true;
    if (filtro === 'informativa') return n.categoria === 'informativa' || n.categoria === 'exito';
    return n.categoria === filtro;
  });

  return (
    <AppShell headerVariant="green">
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="text-bosque"><IconArrowLeft width={22} height={22} /></button>
        <h1 className="font-display text-lg font-bold text-bosque">Notificaciones</h1>
        {nuevas > 0 && (
          <span className="rounded-full bg-alerta px-2 py-0.5 text-xs font-semibold text-white">{nuevas} nuevas</span>
        )}
      </div>

      {/* Chips de filtro */}
      <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
        {FILTROS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              filtro === f.key ? 'border-hoja bg-hoja/15 text-bosque' : 'border-gray-200 bg-white text-gray-500'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <button onClick={marcarTodas} className="mb-3 flex items-center gap-1.5 text-sm font-medium text-bosque">
        <IconCheck width={16} height={16} /> Marcar todas como leídas
      </button>

      <div className="space-y-2.5">
        {visibles.map((n) => {
          const est = ESTILO_CAT[n.categoria] || ESTILO_CAT.informativa;
          return (
            <Card key={n.id} className={`flex gap-3 p-3.5 ${!n.leida ? '' : 'opacity-70'}`}>
              <span className={`mt-1.5 h-2.5 w-2.5 flex-none rounded-full ${est.punto}`} />
              <div className="min-w-0 flex-1">
                <p className={`font-semibold leading-snug ${est.titulo}`}>{n.titulo}</p>
                <p className="mt-0.5 text-sm text-gray-500">{n.mensaje}</p>
                <p className="mt-1 text-[11px] text-gray-400">{n.creada_en}</p>
              </div>
            </Card>
          );
        })}
        {visibles.length === 0 && (
          <Card className="p-6 text-center text-sm text-gray-400">Sin notificaciones en esta categoría.</Card>
        )}
      </div>
    </AppShell>
  );
}
