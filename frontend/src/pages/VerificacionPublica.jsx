// Pantalla PUBLICA de verificacion (accesible al escanear el QR, sin login).
// Muestra el timeline vertical de las etapas, el estado satelital y el hash.
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import Logo from '../components/Logo.jsx';
import {
  IconSprout, IconLeaf, IconWarehouse, IconBox, IconShield,
  IconCheckCircle, IconPin,
} from '../components/icons.jsx';

const ICONO_ETAPA = {
  siembra: IconSprout,
  cosecha: IconLeaf,
  acopio: IconWarehouse,
  packing: IconBox,
};
const LABEL_ETAPA = {
  siembra: 'Siembra', cosecha: 'Cosecha', acopio: 'Acopio', packing: 'Packing',
};

export default function VerificacionPublica() {
  const { codigo } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Los datos viajan dentro del QR en el fragmento (#...): asi la verificacion
    // funciona desde cualquier celular sin consultar ningun servidor.
    const fragmento = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '';
    api.verificar(codigo, fragmento).then((d) => setData(d.verificacion)).catch((e) => setError(e.message));
  }, [codigo]);

  if (error) {
    return (
      <Marco>
        <div className="py-16 text-center">
          <p className="text-lg font-semibold text-alerta">Certificado no válido</p>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <p className="mt-4 font-mono text-xs text-gray-400">{codigo}</p>
        </div>
      </Marco>
    );
  }
  if (!data) {
    return <Marco><p className="py-16 text-center text-sm text-gray-400">Verificando origen…</p></Marco>;
  }

  const validado = data.estado_satelital === 'validado';

  return (
    <Marco>
      {/* Cabecera de resultado */}
      <div className="flex flex-col items-center py-6 text-center">
        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${validado ? 'bg-hoja/15 text-hoja' : 'bg-alerta/15 text-alerta'}`}>
          <IconCheckCircle width={40} height={40} />
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold text-bosque">
          {validado ? 'Origen verificado' : 'Con observación EUDR'}
        </h1>
        <p className="mt-1 max-w-xs text-sm text-gray-500">
          {validado
            ? 'Este lote cumple con todos los estándares de trazabilidad.'
            : 'La validación satelital detectó una posible no-conformidad.'}
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-bosque px-3 py-1 text-xs font-semibold text-white">{data.codigo}</span>
          <span className="rounded-full bg-crema px-3 py-1 text-xs font-medium text-gray-600">{data.producto}</span>
          <span className="rounded-full bg-crema px-3 py-1 text-xs font-medium text-gray-600">{data.cooperativa}</span>
        </div>
      </div>

      {/* Estado satelital */}
      <div className={`mb-6 flex items-center gap-3 rounded-2xl p-4 ${validado ? 'bg-hoja/10' : 'bg-alerta/10'}`}>
        <IconShield width={28} height={28} className={validado ? 'text-hoja' : 'text-alerta'} />
        <div className="text-sm">
          <p className={`font-semibold ${validado ? 'text-bosque' : 'text-alerta'}`}>
            {validado ? 'Validado — Libre de deforestación' : 'Alerta — Revisar parcela'}
          </p>
          <p className="text-xs text-gray-500">
            Parcela {data.parcela.codigo} · {data.parcela.distrito} · {data.parcela.area_ha} ha
          </p>
        </div>
      </div>

      {/* Timeline vertical de etapas */}
      <div className="relative pl-2">
        {data.etapas.map((e, i) => {
          const Icon = ICONO_ETAPA[e.tipo_etapa] || IconLeaf;
          const ultimo = i === data.etapas.length - 1;
          return (
            <div key={e.tipo_etapa} className="relative flex gap-4 pb-6">
              {/* Linea conectora */}
              {!ultimo && <span className="absolute left-[19px] top-11 h-full w-0.5 bg-hoja/30" />}
              {/* Nodo */}
              <div className="relative z-10 flex h-10 w-10 flex-none items-center justify-center rounded-full border-2 border-hoja bg-white text-bosque">
                <Icon width={20} height={20} />
              </div>
              {/* Contenido */}
              <div className="pt-1">
                <p className="font-display font-bold text-bosque">
                  {LABEL_ETAPA[e.tipo_etapa]} {e.fecha && <span className="font-body text-xs font-normal text-gray-400">· {e.fecha}</span>}
                </p>
                {e.ubicacion && <p className="text-sm text-gray-600">{e.ubicacion}</p>}
                <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                  <IconPin width={12} height={12} />
                  {e.gps_lat != null ? `${Number(e.gps_lat).toFixed(4)}, ${Number(e.gps_lng).toFixed(4)}` : 'GPS no disponible'}
                  {e.peso_kg ? ` · ${e.peso_kg} kg` : ''}
                </p>
              </div>
            </div>
          );
        })}

        {/* Nodo final: certificacion */}
        <div className="relative flex gap-4">
          <div className="relative z-10 flex h-10 w-10 flex-none items-center justify-center rounded-full border-2 border-bosque bg-bosque text-white">
            <IconShield width={20} height={20} />
          </div>
          <div className="pt-1">
            <p className="font-display font-bold text-bosque">Certificación · {formatoFecha(data.emitido_en)}</p>
            <p className="text-sm text-gray-600">Certificado de Origen Digital emitido</p>
          </div>
        </div>
      </div>

      {/* Hash + pie */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-crema p-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Hash de verificación (SHA-256)</p>
        <p className="mt-1 break-all font-mono text-[11px] leading-tight text-bosque">{data.hash_sha256}</p>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 py-2 text-center text-xs text-gray-400">
        <IconShield width={16} height={16} />
        Validado por Blockchain — Sin cuenta requerida · Acceso público
      </div>
    </Marco>
  );
}

// Marco publico (sin tab bar): header con logo.
function Marco({ children }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-white">
      <header className="flex items-center justify-center gap-2 border-b border-gray-100 bg-white px-4 py-3">
        <Logo variant="full" tone="dark" size={26} />
      </header>
      <p className="bg-crema py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-bosque/60">
        Verificación pública de origen
      </p>
      <div className="px-5 pb-10">{children}</div>
    </div>
  );
}

function formatoFecha(s) {
  if (!s) return '';
  return s.split(' ')[0].split('-').reverse().join('/');
}
