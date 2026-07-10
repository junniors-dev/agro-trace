// Rutas de certificados: genera el Certificado de Origen Digital al completar packing.
// Al certificar:
//   1. Valida satelitalmente la parcela (servicio simulado).
//   2. Calcula un SHA-256 real del JSON del lote (servicio blockchain simulado).
//   3. Asigna un codigo secuencial AT-2026-XXXX.
//   4. Genera un QR real apuntando a la URL publica de verificacion.
import { Router } from 'express';
import db from '../db/index.js';
import { obtenerLoteCompleto } from './lotes.routes.js';
import { sha256DelLote } from '../services/blockchain.service.js';
import { validarParcela } from '../services/satelital.service.js';
import { generarQrDataUrl } from '../services/qr.service.js';

const router = Router();

const BASE_URL = process.env.PUBLIC_URL || 'http://localhost:5173';

// POST /api/certificados/generar  { lote_id }
router.post('/generar', async (req, res) => {
  const { lote_id } = req.body || {};
  const lote = obtenerLoteCompleto(lote_id);
  if (!lote) return res.status(404).json({ error: 'Lote no encontrado.' });

  // Si ya estaba certificado, devolvemos el certificado existente (idempotente)
  const existente = db.prepare('SELECT * FROM certificados WHERE lote_id = ?').get(lote_id);
  if (existente) {
    return res.json({ certificado: serializarCertificado(existente), yaExistia: true });
  }

  // Debe tener registrada la etapa de packing
  const tienePacking = lote.etapas.some((e) => e.tipo_etapa === 'packing');
  if (!tienePacking) {
    return res.status(400).json({ error: 'Falta registrar la etapa de Packing antes de certificar.' });
  }

  // 1) Validacion satelital (simulada)
  const estadoSatelital = validarParcela({ estado_satelital: lote.parcela_estado_satelital });
  const cumpleEudr = estadoSatelital === 'validado' ? 1 : 0;

  // 2) Hash real del lote
  const loteParaHash = {
    codigo: null, // aun sin codigo; hasheamos el contenido de trazabilidad
    producto: lote.producto,
    parcela: lote.parcela_codigo,
    etapas: lote.etapas.map((e) => ({
      tipo_etapa: e.tipo_etapa, responsable: e.responsable, ubicacion: e.ubicacion,
      fecha: e.fecha, peso_kg: e.peso_kg, gps_lat: e.gps_lat, gps_lng: e.gps_lng,
    })),
  };
  const hash = sha256DelLote(loteParaHash);

  // 3) Codigo secuencial AT-2026-XXXX
  const codigo = siguienteCodigoCertificado();

  // 4) QR real -> URL publica de verificacion
  const url = `${BASE_URL}/verificar/${codigo}`;
  const qr = await generarQrDataUrl(url);

  const info = db.prepare(`
    INSERT INTO certificados (lote_id, codigo, hash_sha256, qr_dataurl, url_verificacion, estado_satelital, cumple_eudr)
    VALUES (@lote, @codigo, @hash, @qr, @url, @estado, @eudr)
  `).run({ lote: lote_id, codigo, hash, qr, url, estado: estadoSatelital, eudr: cumpleEudr });

  // Marca el lote como certificado y guarda su codigo
  db.prepare("UPDATE lotes SET estado = 'certificado', etapa_actual = 'certificado', codigo = ? WHERE id = ?")
    .run(codigo, lote_id);

  // Notificacion de exito
  db.prepare(`
    INSERT INTO notificaciones (usuario_id, categoria, titulo, mensaje)
    VALUES (@usuario, @categoria, @titulo, @mensaje)
  `).run({
    usuario: lote.creado_por,
    categoria: estadoSatelital === 'validado' ? 'exito' : 'urgente',
    titulo: estadoSatelital === 'validado'
      ? `Certificado QR generado exitosamente — Lote ${codigo}`
      : `Alerta EUDR en el lote ${codigo}`,
    mensaje: estadoSatelital === 'validado'
      ? 'El lote ha sido validado y está listo para exportación. Ver certificado QR.'
      : 'La validación satelital detectó una posible no-conformidad. Revisar antes de exportar.',
  });

  const cert = db.prepare('SELECT * FROM certificados WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ certificado: serializarCertificado(cert) });
});

// GET /api/certificados/:codigo -> datos del certificado (incluye QR)
router.get('/:codigo', (req, res) => {
  const cert = db.prepare('SELECT * FROM certificados WHERE codigo = ?').get(req.params.codigo);
  if (!cert) return res.status(404).json({ error: 'Certificado no encontrado.' });
  res.json({ certificado: serializarCertificado(cert) });
});

// ---- helpers ----
function siguienteCodigoCertificado() {
  // Cuenta certificados existentes y arma AT-2026-XXXX con 4 digitos.
  const row = db.prepare("SELECT codigo FROM certificados WHERE codigo LIKE 'AT-2026-%' ORDER BY codigo DESC LIMIT 1").get();
  let n = 1;
  if (row) {
    const ultimo = parseInt(row.codigo.split('-')[2], 10);
    if (!Number.isNaN(ultimo)) n = ultimo + 1;
  }
  return `AT-2026-${String(n).padStart(4, '0')}`;
}

function serializarCertificado(cert) {
  return {
    id: cert.id, lote_id: cert.lote_id, codigo: cert.codigo,
    hash_sha256: cert.hash_sha256, qr_dataurl: cert.qr_dataurl,
    url_verificacion: cert.url_verificacion, estado_satelital: cert.estado_satelital,
    cumple_eudr: !!cert.cumple_eudr, emitido_en: cert.emitido_en,
  };
}

export default router;
