// App Express: monta middlewares y todas las rutas de la API.
import express from 'express';
import cors from 'cors';
import { aplicarEsquema } from './db/index.js';

import authRoutes from './routes/auth.routes.js';
import parcelasRoutes from './routes/parcelas.routes.js';
import lotesRoutes from './routes/lotes.routes.js';
import certificadosRoutes from './routes/certificados.routes.js';
import verificacionRoutes from './routes/verificacion.routes.js';
import notificacionesRoutes from './routes/notificaciones.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

aplicarEsquema();

const app = express();

// CORS abierto: la app (APK / navegador) llama desde otro origen.
app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, servicio: 'AGRO-TRACE API' }));

app.use('/api/auth', authRoutes);
app.use('/api/parcelas', parcelasRoutes);
app.use('/api/lotes', lotesRoutes);
app.use('/api/certificados', certificadosRoutes);
app.use('/api/verificacion', verificacionRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 de API
app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

export default app;
