// Escáner QR con cámara REAL (librería @zxing/browser) + entrada manual de respaldo.
// Al leer un QR de certificado abre su verificación pública (conservando los datos
// embebidos en el fragmento de la URL).
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserQRCodeReader } from '@zxing/browser';
import AppShell from '../components/layout/AppShell.jsx';
import { Card, Button, Input, Field } from '../components/ui/index.jsx';
import { IconQr, IconCamera } from '../components/icons.jsx';

export default function Escaner() {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [escaneando, setEscaneando] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const controlsRef = useRef(null);

  // Limpia la cámara al desmontar
  useEffect(() => () => detener(), []);

  function detener() {
    try { controlsRef.current?.stop(); } catch {}
    controlsRef.current = null;
  }

  // Convierte lo escaneado (URL completa o solo código) en una ruta interna de verificación
  function irAVerificacion(texto) {
    detener();
    setEscaneando(false);
    let codigo = texto.trim();
    let hash = '';
    try {
      const u = new URL(texto);
      if (u.pathname.includes('/verificar/')) {
        codigo = u.pathname.split('/verificar/')[1];
        hash = u.hash || '';
      }
    } catch {
      // no era una URL: se asume que es el código directamente
    }
    navigate(`/verificar/${codigo.toUpperCase()}${hash}`);
  }

  async function iniciarCamara() {
    setError('');
    setEscaneando(true);
    try {
      const reader = new BrowserQRCodeReader();
      controlsRef.current = await reader.decodeFromVideoDevice(
        undefined, // cámara por defecto (trasera si está disponible)
        videoRef.current,
        (result) => { if (result) irAVerificacion(result.getText()); }
      );
    } catch (err) {
      setEscaneando(false);
      setError('No se pudo acceder a la cámara. Verifica los permisos o ingresa el código manualmente.');
    }
  }

  function verificarManual(e) {
    e.preventDefault();
    if (codigo.trim()) navigate(`/verificar/${codigo.trim().toUpperCase()}`);
  }

  return (
    <AppShell headerVariant="green">
      <div className="flex flex-col items-center py-4 text-center">
        {escaneando ? (
          <div className="relative w-full overflow-hidden rounded-3xl bg-black">
            <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 rounded-2xl border-4 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
            </div>
          </div>
        ) : (
          <div className="flex h-44 w-44 items-center justify-center rounded-3xl border-4 border-dashed border-hoja/40 text-hoja/50">
            <IconQr width={72} height={72} />
          </div>
        )}

        <h1 className="mt-4 font-display text-xl font-bold text-bosque">Escanear Certificado QR</h1>
        <p className="mt-1 max-w-xs text-sm text-gray-500">
          {escaneando
            ? 'Apunta la cámara al código QR del certificado.'
            : 'Verifica el origen de un lote escaneando su código QR.'}
        </p>

        <div className="mt-4 w-full">
          {escaneando ? (
            <Button variant="outline" className="w-full" onClick={() => { detener(); setEscaneando(false); }}>
              Cancelar
            </Button>
          ) : (
            <Button className="w-full" onClick={iniciarCamara}>
              <IconCamera width={20} height={20} /> Escanear con cámara
            </Button>
          )}
        </div>
      </div>

      {error && <div className="mb-3 rounded-xl bg-alerta/10 px-4 py-3 text-sm font-medium text-alerta">{error}</div>}

      <Card className="p-4">
        <form onSubmit={verificarManual} className="space-y-3">
          <Field label="…o ingresa el código manualmente">
            <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="AT-2026-0001" />
          </Field>
          <Button type="submit" variant="outline" className="w-full">Verificar origen</Button>
        </form>
        <p className="mt-3 text-center text-xs text-gray-400">
          Prueba con <button type="button" onClick={() => setCodigo('AT-2026-0001')} className="font-semibold text-bosque underline">AT-2026-0001</button>
        </p>
      </Card>
    </AppShell>
  );
}
