// Rutas de parcelas (para el mapa del dashboard y el dropdown de registro).
import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

// GET /api/parcelas -> todas las parcelas con su estado satelital
router.get('/', (_req, res) => {
  const parcelas = db.prepare(`
    SELECT p.*, u.nombre AS agricultor_nombre
    FROM parcelas p
    LEFT JOIN usuarios u ON u.id = p.agricultor_id
    ORDER BY p.codigo
  `).all();
  res.json({ parcelas });
});

export default router;
