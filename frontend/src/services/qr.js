// Generacion de QR REAL en el navegador (libreria qrcode) + utilidades para
// empaquetar los datos de verificacion dentro del propio enlace del QR.
//
// El QR apunta a:  ${PUBLIC_URL}/verificar/${codigo}#${payloadBase64}
// El fragmento (#...) viaja DENTRO del QR, asi que la pagina de verificacion
// puede mostrar toda la trazabilidad SIN consultar ningun servidor: funciona
// desde cualquier celular y en cualquier red.
import QRCode from 'qrcode';

// URL publica donde esta publicada la pagina de verificacion (sitio estatico).
// Se define en build via VITE_PUBLIC_URL. En dev cae al origin actual.
export const PUBLIC_URL =
  import.meta.env.VITE_PUBLIC_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '');

// Base64 seguro para UTF-8
export function encodePayload(obj) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}
export function decodePayload(b64) {
  return JSON.parse(decodeURIComponent(escape(atob(b64))));
}

export function construirUrlVerificacion(codigo, payload) {
  const frag = payload ? `#${encodePayload(payload)}` : '';
  return `${PUBLIC_URL}/verificar/${codigo}${frag}`;
}

export async function generarQrDataUrl(texto) {
  return QRCode.toDataURL(texto, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 320,
    color: { dark: '#14532D', light: '#FFFFFF' },
  });
}
