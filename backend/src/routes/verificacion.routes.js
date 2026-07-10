// Ruta PUBLICA de verificacion (sin autenticacion).
// Alimenta la pantalla que se abre al escanear el QR: timeline de etapas,
// estado satelital y hash de verificacion.
import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

// GET /api/verificacion/:codigo -> datos publicos del lote certificado
router.get('/:codigo', (req, res) => {
  const cert = db.prepare('SELECT * FROM certificados WHERE codigo = ?').get(req.params.codigo);
  if (!cert) {
    return res.status(404).json({ error: 'Certificado no encontrado o inválido.' });
  }
  const lote = db.prepare(`
    SELECT l.*, p.codigo AS parcela_codigo, p.nombre AS parcela_nombre,
           p.distrito, p.area_ha, p.lat AS parcela_lat, p.lng AS parcela_lng
    FROM lotes l
    LEFT JOIN parcelas p ON p.id = l.parcela_id
    WHERE l.id = ?
  `).get(cert.lote_id);

  const etapas = db.prepare(
    'SELECT tipo_etapa, responsable, ubicacion, fecha, peso_kg, gps_lat, gps_lng FROM etapas_lote WHERE lote_id = ? ORDER BY id'
  ).all(cert.lote_id);

  res.json({
    verificacion: {
      codigo: cert.codigo,
      producto: lote?.producto || 'Palta Hass',
      cooperativa: 'APROPAL',
      parcela: {
        codigo: lote?.parcela_codigo, nombre: lote?.parcela_nombre,
        distrito: lote?.distrito, area_ha: lote?.area_ha,
      },
      estado_satelital: cert.estado_satelital,
      cumple_eudr: !!cert.cumple_eudr,
      hash_sha256: cert.hash_sha256,
      emitido_en: cert.emitido_en,
      etapas,
    },
  });
});

export default router;
