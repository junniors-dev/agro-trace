// Pantalla del Certificado de Origen Digital recién generado.
// Muestra el QR real, el ID, el hash SHA-256 y opciones de compartir.
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import AppShell from '../components/layout/AppShell.jsx';
import { Card, Button, Badge } from '../components/ui/index.jsx';
import { IconShield, IconShare, IconDownload, IconCheckCircle } from '../components/icons.jsx';

export default function CertificadoGenerado() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.certificado(codigo).then((d) => setCert(d.certificado)).catch((e) => setError(e.message));
  }, [codigo]);

  if (error) {
    return (
      <AppShell headerVariant="green">
        <Card className="p-6 text-center text-sm text-alerta">{error}</Card>
      </AppShell>
    );
  }
  if (!cert) {
    return (
      <AppShell headerVariant="green">
        <p className="py-10 text-center text-sm text-gray-400">Cargando certificado…</p>
      </AppShell>
    );
  }

  const validado = cert.estado_satelital === 'validado';
  async function compartir() {
    const texto = `Certificado de Origen Digital AGRO-TRACE ${cert.codigo}. Verifica: ${cert.url_verificacion}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Certificado AGRO-TRACE', text: texto, url: cert.url_verificacion }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(cert.url_verificacion); alert('Enlace copiado al portapapeles'); } catch {}
    }
  }

  return (
    <AppShell headerVariant="green">
      <div className="mb-4 flex flex-col items-center text-center">
        <div className="animate-pop flex h-16 w-16 items-center justify-center rounded-full bg-hoja/15 text-hoja">
          <IconCheckCircle width={40} height={40} />
        </div>
        <h1 className="mt-3 font-display text-xl font-bold text-bosque">¡Certificado generado!</h1>
        <p className="text-sm text-gray-500">El lote está listo para exportación</p>
      </div>

      {/* Tarjeta del certificado */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between bg-bosque px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <IconShield width={22} height={22} />
            <div>
              <p className="text-xs opacity-80">Certificado de Origen Digital</p>
              <p className="font-display font-bold">{cert.codigo}</p>
            </div>
          </div>
          <Badge estado={validado ? 'validado' : 'alerta'}>{validado ? 'Válido' : 'Alerta'}</Badge>
        </div>

        {/* QR real */}
        <div className="flex flex-col items-center gap-3 p-5">
          <img src={cert.qr_dataurl} alt={`QR ${cert.codigo}`} className="h-52 w-52 rounded-xl border border-gray-100" />
          <p className="text-center text-xs text-gray-500">
            Escanea este código para verificar el origen del lote desde cualquier celular
          </p>

          {/* Validaciones */}
          <div className="w-full space-y-2 rounded-xl bg-crema p-3 text-sm">
            <Validacion ok label="Parcela libre de deforestación · Google Earth Engine" v={validado} />
            <Validacion ok label="Registro inmutable en Blockchain" v />
            <Validacion ok label="Cumple normativa EUDR · UE 2023/1115" v={validado} />
          </div>

          {/* Hash */}
          <div className="w-full rounded-xl border border-gray-100 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Hash de verificación (SHA-256)</p>
            <p className="mt-1 break-all font-mono text-[11px] leading-tight text-bosque">{cert.hash_sha256}</p>
          </div>
        </div>
      </Card>

      <div className="mt-4 space-y-2.5">
        <Button className="w-full" onClick={compartir}>
          <IconShare width={20} height={20} /> Compartir con importador
        </Button>
        <Button variant="outline" className="w-full" to={`/verificar/${cert.codigo}`}>
          <IconDownload width={20} height={20} /> Ver verificación pública
        </Button>
        <button onClick={() => navigate('/dashboard')} className="w-full py-2 text-center text-sm text-gray-400">
          Volver al Dashboard
        </button>
      </div>
    </AppShell>
  );
}

function Validacion({ label, v }) {
  return (
    <div className="flex items-start gap-2">
      <span className={`mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full text-[10px] text-white ${v ? 'bg-hoja' : 'bg-alerta'}`}>
        {v ? '✓' : '!'}
      </span>
      <span className={v ? 'text-gray-700' : 'text-alerta'}>{label}</span>
    </div>
  );
}
