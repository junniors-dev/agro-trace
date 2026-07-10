// Ruta de indicadores del dashboard (tarjetas + actividad reciente).
import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

// GET /api/dashboard -> KPIs y actividad reciente
router.get('/', (_req, res) => {
  const lotesCertificados = db.prepare("SELECT COUNT(*) AS n FROM lotes WHERE estado = 'certificado'").get().n;
  const kgTrazados = db.prepare(`
    SELECT COALESCE(SUM(peso_kg), 0) AS kg FROM etapas_lote WHERE tipo_etapa = 'cosecha'
  `).get().kg;
  const alertasEudr = db.prepare("SELECT COUNT(*) AS n FROM parcelas WHERE estado_satelital = 'alerta'").get().n;
  const certificadosQr = db.prepare('SELECT COUNT(*) AS n FROM certificados').get().n;
  const lotesEnProceso = db.prepare("SELECT COUNT(*) AS n FROM lotes WHERE estado = 'en_progreso'").get().n;

  // Actividad reciente: ultimos lotes con su estado
  const actividad = db.prepare(`
    SELECT l.id, l.codigo, l.producto, l.estado, l.etapa_actual, l.creado_en,
           p.codigo AS parcela_codigo, p.distrito,
           (SELECT peso_kg FROM etapas_lote WHERE lote_id = l.id AND tipo_etapa = 'packing') AS peso_packing,
           (SELECT peso_kg FROM etapas_lote WHERE lote_id = l.id AND tipo_etapa = 'cosecha') AS peso_cosecha
    FROM lotes l
    LEFT JOIN parcelas p ON p.id = l.parcela_id
    ORDER BY l.id DESC
    LIMIT 6
  `).all();

  res.json({
    kpis: {
      lotesCertificados,
      kgTrazados: Math.round(kgTrazados),
      alertasEudr,
      certificadosQr,
      lotesEnProceso,
    },
    actividad,
  });
});

export default router;
