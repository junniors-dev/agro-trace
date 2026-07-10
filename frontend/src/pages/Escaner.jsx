// Escaner QR (stub funcional): permite ingresar un codigo manualmente para
// abrir la verificacion publica. Util en la demo si no hay camara disponible.
// TODO(produccion): integrar la camara real (ej. libreria html5-qrcode) para
// escanear directamente el codigo QR.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import { Card, Button, Input, Field } from '../components/ui/index.jsx';
import { IconQr } from '../components/icons.jsx';

export default function Escaner() {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');

  function verificar(e) {
    e.preventDefault();
    const c = codigo.trim().toUpperCase();
    if (c) navigate(`/verificar/${c}`);
  }

  return (
    <AppShell headerVariant="green">
      <div className="flex flex-col items-center py-6 text-center">
        <div className="flex h-40 w-40 items-center justify-center rounded-3xl border-4 border-dashed border-hoja/40 text-hoja/50">
          <IconQr width={72} height={72} />
        </div>
        <h1 className="mt-4 font-display text-xl font-bold text-bosque">Escanear Certificado QR</h1>
        <p className="mt-1 max-w-xs text-sm text-gray-500">
          Apunta la cámara al código QR del certificado o ingresa el código manualmente.
        </p>
      </div>

      <Card className="p-4">
        <form onSubmit={verificar} className="space-y-3">
          <Field label="Código del certificado">
            <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="AT-2026-0001" />
          </Field>
          <Button type="submit" className="w-full">Verificar origen</Button>
        </form>
        <p className="mt-3 text-center text-xs text-gray-400">
          Prueba con <button type="button" onClick={() => setCodigo('AT-2026-0001')} className="font-semibold text-bosque underline">AT-2026-0001</button>
        </p>
      </Card>
    </AppShell>
  );
}
