// Rutas de lotes: crear lote, guardar el progreso de cada etapa y consultar.
// El flujo de 4 pasos (siembra -> cosecha -> acopio -> packing) persiste cada
// etapa en la tabla etapas_lote para poder retomar el registro entre pasos.
import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

const ORDEN_ETAPAS = ['siembra', 'cosecha', 'acopio', 'packing'];

// GET /api/lotes -> lista de lotes con datos de parcela y certificado
router.get('/', (_req, res) => {
  const lotes = db.prepare(`
    SELECT l.*, p.codigo AS parcela_codigo, p.distrito, c.codigo AS certificado_codigo
    FROM lotes l
    LEFT JOIN parcelas p ON p.id = l.parcela_id
    LEFT JOIN certificados c ON c.lote_id = l.id
    ORDER BY l.id DESC
  `).all();
  res.json({ lotes });
});

// GET /api/lotes/:id -> un lote con todas sus etapas
router.get('/:id', (req, res) => {
  const lote = obtenerLoteCompleto(req.params.id);
  if (!lote) return res.status(404).json({ error: 'Lote no encontrado.' });
  res.json({ lote });
});

// POST /api/lotes -> crea un lote nuevo (en_progreso, etapa inicial siembra)
//   body: { parcela_id, creado_por }
router.post('/', (req, res) => {
  const { parcela_id, creado_por } = req.body || {};
  if (!parcela_id) return res.status(400).json({ error: 'parcela_id es obligatorio.' });

  const r = db.prepare(`
    INSERT INTO lotes (parcela_id, creado_por, etapa_actual, estado)
    VALUES (?, ?, 'siembra', 'en_progreso')
  `).run(parcela_id, creado_por || null);

  res.status(201).json({ lote: obtenerLoteCompleto(r.lastInsertRowid) });
});

// PUT /api/lotes/:id/etapa -> guarda (o actualiza) una etapa del lote
//   body: { tipo_etapa, responsable, ubicacion, fecha, peso_kg, gps_lat, gps_lng, foto_url, extra }
// Persiste el progreso y avanza etapa_actual. NO certifica (eso es endpoint aparte).
router.put('/:id/etapa', (req, res) => {
  const loteId = Number(req.params.id);
  const lote = db.prepare('SELECT * FROM lotes WHERE id = ?').get(loteId);
  if (!lote) return res.status(404).json({ error: 'Lote no encontrado.' });

  const {
    tipo_etapa, responsable, ubicacion, fecha,
    peso_kg, gps_lat, gps_lng, foto_url, extra,
  } = req.body || {};

  if (!ORDEN_ETAPAS.includes(tipo_etapa)) {
    return res.status(400).json({ error: 'tipo_etapa invalido.' });
  }

  // upsert de la etapa (unica por lote + tipo)
  db.prepare(`
    INSERT INTO etapas_lote (lote_id, tipo_etapa, responsable, ubicacion, fecha, peso_kg, gps_lat, gps_lng, foto_url, extra)
    VALUES (@lote, @tipo, @resp, @ubic, @fecha, @peso, @lat, @lng, @foto, @extra)
    ON CONFLICT(lote_id, tipo_etapa) DO UPDATE SET
      responsable=@resp, ubicacion=@ubic, fecha=@fecha, peso_kg=@peso,
      gps_lat=@lat, gps_lng=@lng, foto_url=@foto, extra=@extra
  `).run({
    lote: loteId, tipo: tipo_etapa,
    resp: responsable || null, ubic: ubicacion || null, fecha: fecha || null,
    peso: peso_kg ?? null, lat: gps_lat ?? null, lng: gps_lng ?? null,
    foto: foto_url || null, extra: extra ? JSON.stringify(extra) : null,
  });

  // Avanza etapa_actual al siguiente paso pendiente (sin pasar de packing)
  const idx = ORDEN_ETAPAS.indexOf(tipo_etapa);
  const siguiente = ORDEN_ETAPAS[idx + 1] || 'packing';
  if (lote.estado !== 'certificado') {
    db.prepare('UPDATE lotes SET etapa_actual = ? WHERE id = ?').run(siguiente, loteId);
  }

  res.json({ lote: obtenerLoteCompleto(loteId) });
});

// ---- helpers ----
export function obtenerLoteCompleto(id) {
  const lote = db.prepare(`
    SELECT l.*, p.codigo AS parcela_codigo, p.nombre AS parcela_nombre,
           p.distrito, p.lat AS parcela_lat, p.lng AS parcela_lng,
           p.area_ha, p.estado_satelital AS parcela_estado_satelital
    FROM lotes l
    LEFT JOIN parcelas p ON p.id = l.parcela_id
    WHERE l.id = ?
  `).get(id);
  if (!lote) return null;

  lote.etapas = db.prepare('SELECT * FROM etapas_lote WHERE lote_id = ? ORDER BY id').all(id)
    .map((e) => ({ ...e, extra: e.extra ? JSON.parse(e.extra) : null }));
  lote.certificado = db.prepare('SELECT codigo, hash_sha256, estado_satelital, emitido_en FROM certificados WHERE lote_id = ?').get(id) || null;
  return lote;
}

export { ORDEN_ETAPAS };
export default router;
