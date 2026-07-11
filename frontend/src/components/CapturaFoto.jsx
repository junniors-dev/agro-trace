// Captura de foto de evidencia REAL: abre la cámara (o galería) del dispositivo,
// comprime la imagen a un thumbnail pequeño y devuelve un data URL (base64) para
// guardarlo en el lote sin llenar el almacenamiento local.
import { useRef, useState } from 'react';
import { IconCamera } from './icons.jsx';

// Redimensiona a máx. 640px y comprime a JPEG (~40-70 KB) para caber en localStorage.
function comprimir(file, maxLado = 640, calidad = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxLado) { height = (height * maxLado) / width; width = maxLado; }
        else if (height > maxLado) { width = (width * maxLado) / height; height = maxLado; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', calidad));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CapturaFoto({ valor, onChange }) {
  const inputRef = useRef(null);
  const [cargando, setCargando] = useState(false);

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCargando(true);
    try {
      const dataUrl = await comprimir(file);
      onChange(dataUrl);
    } catch {
      onChange(null);
    } finally {
      setCargando(false);
      e.target.value = ''; // permite volver a tomar la misma foto
    }
  }

  return (
    <div>
      {/* input real: 'capture=environment' abre la cámara trasera en celulares */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFile}
      />
      {valor ? (
        <div className="relative overflow-hidden rounded-xl border border-hoja/30">
          <img src={valor} alt="Evidencia" className="h-40 w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-3 py-1.5 text-xs text-white">
            <span>✓ Foto de evidencia</span>
            <button type="button" onClick={() => inputRef.current?.click()} className="font-semibold underline">
              Cambiar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={cargando}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition hover:border-hoja hover:text-bosque"
        >
          <IconCamera width={20} height={20} />
          {cargando ? 'Procesando…' : 'Tomar foto de evidencia'}
        </button>
      )}
    </div>
  );
}
