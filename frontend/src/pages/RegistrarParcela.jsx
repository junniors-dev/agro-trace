// Pantalla "Registrar parcela": alta de una parcela nueva con coordenadas GPS
// (manuales o autodetectadas) y validación satelital simulada.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AppShell from '../components/layout/AppShell.jsx';
import { Card, Button, Input, Select, Field } from '../components/ui/index.jsx';
import { IconPin, IconLeaf, IconScale, IconCheck } from '../components/icons.jsx';

const DISTRITOS = ['Olmos', 'Motupe', 'Jayanca', 'Ferreñafe', 'Chiclayo', 'Lambayeque', 'Íllimo', 'Pacora'];

export default function RegistrarParcela() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ nombre: '', distrito: 'Olmos', lat: '-6.1490', lng: '-79.7140', area_ha: '' });
  const [error, setError] = useState('');
  const [gpsMsg, setGpsMsg] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(null);

  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  function detectarGps() {
    setGpsMsg('Detectando ubicación…');
    if (!navigator.geolocation) { setGpsMsg('Este dispositivo no soporta GPS.'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set('lat', pos.coords.latitude.toFixed(4));
        set('lng', pos.coords.longitude.toFixed(4));
        setGpsMsg('✓ Ubicación detectada');
      },
      () => setGpsMsg('No se pudo obtener el GPS. Ingresa las coordenadas manualmente.'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      const { parcela } = await api.crearParcela({
        nombre: f.nombre, distrito: f.distrito,
        lat: f.lat, lng: f.lng, area_ha: f.area_ha,
        agricultor_id: usuario?.id,
      });
      setExito(parcela);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  // Pantalla de éxito
  if (exito) {
    return (
      <AppShell headerVariant="green">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="animate-pop flex h-20 w-20 items-center justify-center rounded-full bg-hoja text-white">
            <IconCheck width={44} height={44} />
          </div>
          <h2 className="mt-5 font-display text-xl font-bold text-bosque">Parcela registrada</h2>
          <p className="mt-1 text-sm text-gray-500">
            <span className="font-semibold text-bosque">{exito.codigo}</span> · {exito.nombre}
          </p>
          <div className="mt-2 rounded-full bg-hoja/15 px-3 py-1 text-xs font-semibold text-bosque">
            ✓ Validada satelitalmente · libre de deforestación
          </div>
          <div className="mt-6 w-full space-y-2.5">
            <Button className="w-full" onClick={() => navigate(`/parcela/${exito.id}`)}>Ver validación satelital</Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/registrar')}>Registrar un lote en esta parcela</Button>
            <button onClick={() => navigate('/dashboard')} className="w-full py-2 text-sm text-gray-400">Volver al Dashboard</button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell headerVariant="green">
      <h1 className="mb-1 font-display text-lg font-bold text-bosque">Registrar parcela</h1>
      <p className="mb-4 text-sm text-gray-500">Da de alta un predio para poder trazar sus lotes.</p>

      <Card className="space-y-4 p-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Nombre de la parcela / predio" icon={<IconLeaf width={18} height={18} />}>
            <Input icon value={f.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Ej. Finca El Amanecer" />
          </Field>

          <Field label="Distrito">
            <Select value={f.distrito} onChange={(e) => set('distrito', e.target.value)}>
              {DISTRITOS.map((d) => <option key={d}>{d}</option>)}
            </Select>
          </Field>

          {/* Coordenadas GPS */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Coordenadas GPS</span>
              <button type="button" onClick={detectarGps} className="flex items-center gap-1 text-xs font-semibold text-bosque">
                <IconPin width={14} height={14} /> Detectar mi ubicación
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input value={f.lat} onChange={(e) => set('lat', e.target.value)} placeholder="Latitud" inputMode="decimal" />
              <Input value={f.lng} onChange={(e) => set('lng', e.target.value)} placeholder="Longitud" inputMode="decimal" />
            </div>
            {gpsMsg && <p className="mt-1 text-xs text-bosque">{gpsMsg}</p>}
          </div>

          <Field label="Área (hectáreas)" icon={<IconScale width={18} height={18} />}>
            <Input icon type="number" step="0.1" inputMode="decimal" value={f.area_ha} onChange={(e) => set('area_ha', e.target.value)} placeholder="Ej. 3.5" />
          </Field>

          <div className="rounded-xl bg-hoja/8 px-3 py-2.5 text-xs text-bosque">
            🛰️ Al registrar, la parcela se valida automáticamente contra imágenes satelitales (Google Earth Engine) para confirmar que no proviene de zona deforestada (EUDR).
          </div>

          {error && <div className="rounded-xl bg-alerta/10 px-4 py-2.5 text-sm font-medium text-alerta">{error}</div>}

          <Button type="submit" className="w-full" disabled={guardando}>
            {guardando ? 'Validando y registrando…' : 'Registrar parcela'}
          </Button>
        </form>
      </Card>

      <button onClick={() => navigate('/dashboard')} className="mt-3 w-full text-center text-sm text-gray-400">
        Cancelar
      </button>
    </AppShell>
  );
}
