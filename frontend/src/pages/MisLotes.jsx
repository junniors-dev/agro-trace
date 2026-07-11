// Pantalla "Mis lotes": lista completa con búsqueda y filtro por estado.
// Permite abrir el detalle, continuar un registro en progreso, ver el certificado
// o eliminar el lote.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import AppShell from '../components/layout/AppShell.jsx';
import { Card, Input, Badge, Button } from '../components/ui/index.jsx';
import { IconSearch, IconArrowRight, IconPlus } from '../components/icons.jsx';

const FILTROS = [
  { key: 'todos', label: 'Todos' },
  { key: 'certificado', label: 'Certificados' },
  { key: 'en_progreso', label: 'En proceso' },
  { key: 'alerta', label: 'Con alerta' },
];

export default function MisLotes() {
  const navigate = useNavigate();
  const [lotes, setLotes] = useState([]);
  const [q, setQ] = useState('');
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => { api.lotes().then((d) => setLotes(d.lotes)).catch(() => {}); }, []);

  const visibles = lotes.filter((l) => {
    if (filtro === 'certificado' && l.estado !== 'certificado') return false;
    if (filtro === 'en_progreso' && l.estado !== 'en_progreso') return false;
    if (filtro === 'alerta' && l.estado_satelital !== 'alerta') return false;
    if (q) {
      const t = `${l.codigo || ''} ${l.parcela_codigo || ''} ${l.distrito || ''} ${l.producto || ''}`.toLowerCase();
      if (!t.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <AppShell headerVariant="light" title="Mis lotes">
      {/* Búsqueda */}
      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconSearch width={18} height={18} /></span>
        <Input className="pl-10" placeholder="Buscar por código, parcela o distrito" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {/* Filtros */}
      <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
        {FILTROS.map((f) => (
          <button key={f.key} onClick={() => setFiltro(f.key)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              filtro === f.key ? 'border-hoja bg-hoja/15 text-bosque' : 'border-gray-200 bg-white text-gray-500'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      <Button className="mb-3 w-full" onClick={() => navigate('/registrar')}>
        <IconPlus width={20} height={20} /> Registrar nuevo lote
      </Button>

      {/* Lista */}
      <div className="space-y-2.5">
        {visibles.map((l) => (
          <Card key={l.id} role="button" onClick={() => navigate(`/lotes/${l.id}`)} className="flex items-center gap-3 p-3">
            {l.foto ? (
              <img src={l.foto} alt="" className="h-12 w-12 flex-none rounded-lg object-cover" />
            ) : (
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-lg bg-hoja/10 text-lg">🥑</div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-gray-800">{l.codigo || `Lote en proceso #${l.id}`}</p>
              <p className="truncate text-xs text-gray-500">
                {l.parcela_codigo || '—'} · {l.distrito || 'Lambayeque'}{l.peso ? ` · ${(l.peso / 1000).toFixed(1)} ton` : ''}
              </p>
            </div>
            <div className="flex flex-none items-center gap-2">
              {l.estado_satelital === 'alerta' && l.estado !== 'certificado'
                ? <Badge estado="alerta" />
                : <Badge estado={l.estado === 'certificado' ? 'certificado' : 'en_progreso'} />}
              <IconArrowRight width={18} height={18} className="text-gray-300" />
            </div>
          </Card>
        ))}
        {visibles.length === 0 && (
          <Card className="p-6 text-center text-sm text-gray-400">No hay lotes que coincidan.</Card>
        )}
      </div>
    </AppShell>
  );
}
