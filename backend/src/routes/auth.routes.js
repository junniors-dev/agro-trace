// Rutas de autenticacion (login simulado).
// NO usa JWT ni sesiones: valida celular + password contra la tabla usuarios
// y devuelve el usuario. El frontend guarda ese usuario en localStorage.
import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

// POST /api/auth/login  { celular, password }
router.post('/login', (req, res) => {
  const { celular, password } = req.body || {};
  if (!celular || !password) {
    return res.status(400).json({ error: 'Celular y contraseña son obligatorios.' });
  }
  const usuario = db.prepare(
    'SELECT id, nombre, celular, rol, cooperativa, avatar_iniciales FROM usuarios WHERE celular = ? AND password = ?'
  ).get(String(celular).trim(), String(password));

  if (!usuario) {
    return res.status(401).json({ error: 'Credenciales incorrectas. Verifica tu celular y contraseña.' });
  }
  res.json({ usuario });
});

// GET /api/auth/usuarios-demo  -> lista de credenciales de prueba (ayuda para la demo)
router.get('/usuarios-demo', (_req, res) => {
  const usuarios = db.prepare('SELECT nombre, celular, rol FROM usuarios ORDER BY id').all();
  res.json({ usuarios });
});

export default router;
