// SHA-256 real en el navegador usando Web Crypto API.
// Matematicamente identico al que haria el backend; corre 100% en el dispositivo.
//
// TODO(produccion): ademas de este hash, anclar el valor en una blockchain real
// (ej. Polygon) y guardar el txHash para verificacion on-chain.
export async function sha256Hex(obj) {
  const json = typeof obj === 'string' ? obj : JSON.stringify(obj);
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(json));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
