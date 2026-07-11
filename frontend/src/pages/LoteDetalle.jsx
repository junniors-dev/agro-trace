// Detalle de un lote: etapas con fotos, estado, acceso al certificado, y acciones
// de editar (continuar registro si está en progreso) o eliminar.
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import AppShell from '../components/layout/AppShell.jsx';
import { Card, Button, Badge } from '../components/ui/index.jsx';
import { IconArrowLeft, IconShield, IconTrash, IconEdit, IconPin } from '../components/icons.jsx';

const LABEL = { siembra: 'Siembra', cosecha: 'Cosecha', acopio: 'Acopio', packing: 'Packing' };

export default function LoteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lote, setLote] = useState(null);
  const [error, setError] = useState('');
  const [confirmar, setConfirmar] = useState(false);

  useEffect(() => { api.lote(id).then((d) => setLote(d.lote)).catch((e) => setError(e.message)); }, [id]);

  async function eliminar() {
    await api.eliminarLote(id).catch(() => {});
    navigate('/lotes', { replace: true });
  }

  if (error) return <AppShell headerVariant="green"><Card className="p-6 text-center text-sm text-alerta">{error}</Card></AppShell>;
  if (!lote) return <AppShell headerVariant="green"><p className="py-10 text-center text-sm text-gray-400">Cargando…</p></AppShell>;

  const certificado = lote.estado === 'certificado';

  return (
    <AppShell headerVariant="green">
      <button onClick={() => navigate('/lotes')} className="mb-3 flex items-center gap-1 text-sm text-bosque">
        <IconArrowLeft width={18} height={18} /> Mis lotes
      </button>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-bosque">{lote.codigo || `Lote #${lote.id}`}</h1>
          <p className="text-sm text-gray-500">{lote.producto} · {lote.parcela_codigo} · {lote.distrito}</p>
        </div>
        <Badge estado={certificado ? 'certificado' : 'en_progreso'} />
      </div>

      {/* Certificado */}
      {certificado && (
        <Card className="mb-4 flex items-center justify-between p-4">
          <div className="flex items-center gap-2 text-bosque">
            <IconShield width={22} height={22} />
            <span className="text-sm font-semibold">Certificado emitido</span>
          </div>
          <Button variant="ghost" className="!px-3 !py-2 text-sm" to={`/certificado/${lote.codigo}`}>Ver</Button>
        </Card>
      )}

      {/* Timeline de etapas con fotos */}
      <div className="space-y-3">
        {lote.etapas.map((e) => (
          <Card key={e.id} className="overflow-hidden">
            {e.foto_url && <img src={e.foto_url} alt={e.tipo_etapa} className="h-36 w-full object-cover" />}
            <div className="p-3.5">
              <div className="flex items-center justify-between">
                <p className="font-display font-bold text-bosque">{LABEL[e.tipo_etapa] || e.tipo_etapa}</p>
                <span className="text-xs text-gray-400">{e.fecha}</span>
              </div>
              {e.responsable && <p className="text-sm text-gray-600">{e.responsable}</p>}
              <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                <IconPin width={12} height={12} />
                {e.gps_lat != null ? `${Number(e.gps_lat).toFixed(4)}, ${Number(e.gps_lng).toFixed(4)}` : 'GPS s/d'}
                {e.peso_kg ? ` · ${e.peso_kg} kg` : ''}
              </p>
            </div>
          </Card>
        ))}
        {lote.etapas.length === 0 && <Card className="p-5 text-center text-sm text-gray-400">Sin etapas registradas.</Card>}
      </div>

      {/* Acciones */}
      <div className="mt-5 space-y-2.5">
        {!certificado && (
          <Button className="w-full" onClick={() => navigate(`/registrar/${lote.id}`)}>
            <IconEdit width={18} height={18} /> Continuar registro
          </Button>
        )}
        {confirmar ? (
          <Card className="p-4">
            <p className="mb-3 text-sm text-gray-700">¿Eliminar este lote y su certificado? Esta acción no se puede deshacer.</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmar(false)}>Cancelar</Button>
              <Button variant="danger" className="flex-1" onClick={eliminar}>Eliminar</Button>
            </div>
          </Card>
        ) : (
          <Button variant="outline" className="w-full !border-alerta/40 !text-alerta" onClick={() => setConfirmar(true)}>
            <IconTrash width={18} height={18} /> Eliminar lote
          </Button>
        )}
      </div>
    </AppShell>
  );
}
