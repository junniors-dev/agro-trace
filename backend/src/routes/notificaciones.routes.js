// Rutas de notificaciones / centro de alertas.
import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

// GET /api/notificaciones -> todas las notificaciones (mas recientes primero)
router.get('/', (_req, res) => {
  const notificaciones = db.prepare('SELECT * FROM notificaciones ORDER BY id DESC').all()
    .map((n) => ({ ...n, leida: !!n.leida }));
  const nuevas = notificaciones.filter((n) => !n.leida).length;
  res.json({ notificaciones, nuevas });
});

// PUT /api/notificaciones/leer-todas -> marca todas como leidas
router.put('/leer-todas', (_req, res) => {
  db.prepare('UPDATE notificaciones SET leida = 1').run();
  res.json({ ok: true });
});

export default router;
