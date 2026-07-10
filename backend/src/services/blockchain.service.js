// Servicio de "anclaje en Blockchain".
//
// DEMO: calculamos un SHA-256 REAL sobre el JSON del lote. Matematicamente es un
// hash valido e inmutable frente a cualquier cambio en los datos del lote, aunque
// aqui NO se ancla en una cadena de bloques real.
//
// TODO(produccion): reemplazar por un anclaje real. Flujo tipico:
//   1. Calcular el hash del lote (como aqui).
//   2. Enviar una transaccion a una red (ej. Polygon / Hyperledger Fabric) con el hash.
//   3. Guardar el txHash y el numero de bloque devueltos para verificacion publica.
// Ejemplo (pseudocodigo):
//   const tx = await contrato.registrarLote(codigoLote, hash);
//   return { hash, txHash: tx.hash, bloque: tx.blockNumber };
import { createHash } from 'node:crypto';

/**
 * Devuelve el SHA-256 (hex) de un objeto de lote.
 * Se serializa de forma estable para que el mismo lote produzca siempre el mismo hash.
 */
export function sha256DelLote(loteObj) {
  const json = JSON.stringify(loteObj);
  return createHash('sha256').update(json, 'utf-8').digest('hex');
}
