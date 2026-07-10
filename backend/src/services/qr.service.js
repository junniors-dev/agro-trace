// Generacion de codigos QR REALES con la libreria 'qrcode'.
// El QR apunta a la URL publica de verificacion del certificado.
import QRCode from 'qrcode';

/**
 * Genera un QR como data URL (PNG en base64) listo para <img src=...>.
 * @param {string} texto  URL o contenido a codificar
 */
export async function generarQrDataUrl(texto) {
  return QRCode.toDataURL(texto, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 320,
    color: { dark: '#14532D', light: '#FFFFFF' }, // verde bosque sobre blanco
  });
}
