// Flujo "Registrar Lote" en 4 pasos: Siembra -> Cosecha -> Acopio -> Packing.
// Persiste cada etapa en el backend antes de avanzar. Al completar Packing,
// genera el Certificado de Origen Digital y navega a la pantalla del certificado.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AppShell from '../components/layout/AppShell.jsx';
import { Card, Button, Input, Select, Field, StepProgress, ETAPAS } from '../components/ui/index.jsx';
import {
  IconUser, IconPin, IconCalendar, IconScale, IconCamera, IconBox,
  IconWifiOff, IconCheck, IconArrowLeft,
} from '../components/icons.jsx';

const hoy = () => new Date().toISOString().slice(0, 10);

export default function RegistrarLote() {
  const { loteId: loteIdParam } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [parcelas, setParcelas] = useState([]);
  const [loteId, setLoteId] = useState(loteIdParam ? Number(loteIdParam) : null);
  const [paso, setPaso] = useState(0); // 0..3
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  // Estado del formulario por etapa
  const [form, setForm] = useState({
    parcela_id: '',
    responsable: usuario?.nombre || '',
    ubicacion: '',
    fecha: hoy(),
    peso_kg: '',
    cajas: '',
    calibre: '14',
    destino: 'Unión Europea',
    contenedor: '',
    condicion: 'Óptima',
    foto: false,
  });

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  useEffect(() => {
    api.parcelas().then((d) => setParcelas(d.parcelas)).catch(() => {});
  }, []);

  // Si venimos con loteId, cargamos el lote y saltamos a su etapa actual
  useEffect(() => {
    if (!loteIdParam) return;
    api.lote(loteIdParam).then(({ lote }) => {
      const idx = ETAPAS.findIndex((e) => e.key === lote.etapa_actual);
      setPaso(idx < 0 ? 0 : Math.min(idx, 3));
      set('parcela_id', String(lote.parcela_id || ''));
    }).catch(() => {});
  }, [loteIdParam]);

  const parcelaSel = useMemo(
    () => parcelas.find((p) => String(p.id) === String(form.parcela_id)),
    [parcelas, form.parcela_id]
  );

  // GPS "autodetectado" a partir de la parcela seleccionada (simulado)
  const gps = parcelaSel
    ? { lat: parcelaSel.lat, lng: parcelaSel.lng }
    : { lat: null, lng: null };

  const etapaActual = ETAPAS[paso].key;
  const esUltima = paso === 3;

  async function guardarPaso() {
    setError('');
    if (!form.parcela_id) { setError('Selecciona una parcela.'); return; }
    if (!form.responsable) { setError('Ingresa el responsable.'); return; }

    setGuardando(true);
    try {
      // Crea el lote la primera vez
      let id = loteId;
      if (!id) {
        const { lote } = await api.crearLote(Number(form.parcela_id), usuario?.id);
        id = lote.id;
        setLoteId(id);
      }

      // Arma el payload de la etapa
      const extra = {};
      if (etapaActual === 'cosecha') extra.condicion = form.condicion;
      if (etapaActual === 'packing') {
        extra.cajas = form.cajas; extra.calibre = form.calibre;
        extra.destino = form.destino; extra.contenedor = form.contenedor;
      }

      await api.guardarEtapa(id, {
        tipo_etapa: etapaActual,
        responsable: form.responsable,
        ubicacion: form.ubicacion || (parcelaSel ? `${parcelaSel.nombre}, ${parcelaSel.distrito}` : ''),
        fecha: form.fecha,
        peso_kg: form.peso_kg ? Number(form.peso_kg) : null,
        gps_lat: gps.lat,
        gps_lng: gps.lng,
        foto_url: form.foto ? `evidencia-${etapaActual}.jpg` : null,
        extra: Object.keys(extra).length ? extra : null,
      });

      if (esUltima) {
        // Genera el certificado
        const { certificado } = await api.generarCertificado(id);
        setExito(true);
        setTimeout(() => navigate(`/certificado/${certificado.codigo}`), 1200);
      } else {
        setExito(true);
        setTimeout(() => {
          setExito(false);
          setPaso((p) => p + 1);
          set('peso_kg', ''); set('foto', false); set('ubicacion', '');
        }, 900);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  // Pantalla de exito intermedia / final
  if (exito) {
    return (
      <AppShell headerVariant="green">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="animate-pop flex h-20 w-20 items-center justify-center rounded-full bg-hoja text-white">
            <IconCheck width={44} height={44} />
          </div>
          <h2 className="mt-5 font-display text-xl font-bold text-bosque">
            {esUltima ? 'Generando Certificado…' : 'Etapa registrada exitosamente'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {esUltima ? 'Calculando hash y código QR' : 'Tus datos han sido guardados'}
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell headerVariant="green">
      {/* Aviso modo offline (decorativo, segun mockups) */}
      <div className="mb-3 flex items-center justify-center gap-2 rounded-full bg-ambar/10 px-3 py-1.5 text-xs font-medium text-ambar">
        <IconWifiOff width={15} height={15} /> Modo offline activo — se sincroniza al recuperar señal
      </div>

      <div className="mb-4">
        <StepProgress pasoActual={paso} />
      </div>

      <h1 className="mb-3 text-center font-display text-lg font-bold text-bosque">
        Registrar Lote — Etapa: {ETAPAS[paso].label}
      </h1>

      {esUltima && (
        <div className="mb-3 rounded-xl bg-bosque px-4 py-2.5 text-center text-sm font-medium text-white">
          Última etapa — Se generará el Certificado QR al guardar
        </div>
      )}

      <Card className="space-y-4 p-4">
        {/* Parcela (siempre visible, bloqueada tras el paso 1) */}
        <Field label="Parcela">
          <Select
            value={form.parcela_id}
            onChange={(e) => set('parcela_id', e.target.value)}
            disabled={paso > 0}
          >
            <option value="">Selecciona una parcela…</option>
            {parcelas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.codigo} · {p.nombre} ({p.distrito})
              </option>
            ))}
          </Select>
        </Field>

        {parcelaSel && (
          <div className="flex items-center gap-2 rounded-xl bg-hoja/8 px-3 py-2 text-xs text-bosque">
            <IconPin width={16} height={16} />
            GPS autodetectado: {gps.lat?.toFixed(4)}, {gps.lng?.toFixed(4)} ·{' '}
            {parcelaSel.estado_satelital === 'alerta'
              ? <span className="font-semibold text-alerta">⚠ Alerta satelital</span>
              : <span className="font-semibold">✓ Parcela verificada</span>}
          </div>
        )}

        <Field label={etapaActual === 'siembra' ? 'Agricultor' : 'Responsable'} icon={<IconUser width={18} height={18} />}>
          <Input icon value={form.responsable} onChange={(e) => set('responsable', e.target.value)} placeholder="Nombre completo" />
        </Field>

        {/* Ubicacion especifica segun etapa */}
        {(etapaActual === 'acopio' || etapaActual === 'packing') && (
          <Field label={etapaActual === 'acopio' ? 'Centro de acopio' : 'Planta de packing'} icon={<IconBox width={18} height={18} />}>
            <Input icon value={form.ubicacion} onChange={(e) => set('ubicacion', e.target.value)}
              placeholder={etapaActual === 'acopio' ? 'Ej. Centro de Acopio Lambayeque' : 'Ej. Empacadora Frutos del Norte'} />
          </Field>
        )}

        <Field label="Fecha" icon={<IconCalendar width={18} height={18} />}>
          <Input icon type="date" value={form.fecha} onChange={(e) => set('fecha', e.target.value)} />
        </Field>

        {/* Peso (todas menos siembra) */}
        {etapaActual !== 'siembra' && (
          <Field label={etapaActual === 'packing' ? 'Peso neto total (kg)' : 'Peso (kg)'} icon={<IconScale width={18} height={18} />}>
            <Input icon type="number" inputMode="decimal" value={form.peso_kg}
              onChange={(e) => set('peso_kg', e.target.value)} placeholder="Ej. 3200" />
          </Field>
        )}

        {etapaActual === 'cosecha' && (
          <Field label="Condición del producto">
            <Select value={form.condicion} onChange={(e) => set('condicion', e.target.value)}>
              <option>Óptima</option><option>Buena</option><option>Regular</option>
            </Select>
          </Field>
        )}

        {etapaActual === 'packing' && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="N° de cajas" icon={<IconBox width={18} height={18} />}>
              <Input icon type="number" value={form.cajas} onChange={(e) => set('cajas', e.target.value)} placeholder="240" />
            </Field>
            <Field label="Calibre">
              <Select value={form.calibre} onChange={(e) => set('calibre', e.target.value)}>
                <option>10</option><option>12</option><option>14</option><option>16</option><option>18</option>
              </Select>
            </Field>
            <Field label="Destino de exportación">
              <Select value={form.destino} onChange={(e) => set('destino', e.target.value)}>
                <option>Unión Europea</option><option>EE.UU.</option><option>Asia</option>
              </Select>
            </Field>
            <Field label="N° de contenedor">
              <Input value={form.contenedor} onChange={(e) => set('contenedor', e.target.value)} placeholder="MSKU-0000000" />
            </Field>
          </div>
        )}

        {/* Foto de evidencia (simulada) */}
        <button
          type="button"
          onClick={() => set('foto', !form.foto)}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3 text-sm font-medium transition ${
            form.foto ? 'border-hoja bg-hoja/8 text-bosque' : 'border-gray-300 text-gray-500'
          }`}
        >
          <IconCamera width={20} height={20} />
          {form.foto ? '✓ 1 foto de evidencia adjunta' : 'Tomar foto de evidencia'}
        </button>

        {error && <div className="rounded-xl bg-alerta/10 px-4 py-2.5 text-sm font-medium text-alerta">{error}</div>}
      </Card>

      <div className="mt-4 flex gap-3">
        {paso > 0 && (
          <Button variant="outline" onClick={() => setPaso((p) => p - 1)} disabled={guardando}>
            <IconArrowLeft width={18} height={18} />
          </Button>
        )}
        <Button className="flex-1" onClick={guardarPaso} disabled={guardando}>
          {guardando ? 'Guardando…' : esUltima ? 'Finalizar y generar Certificado QR' : 'Guardar y continuar'}
        </Button>
      </div>

      <button onClick={() => navigate('/dashboard')} className="mt-3 w-full text-center text-sm text-gray-400">
        Volver al Dashboard
      </button>
    </AppShell>
  );
}
