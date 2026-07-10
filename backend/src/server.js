// Punto de entrada del backend.
import app from './app.js';

const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌱 AGRO-TRACE API escuchando en http://localhost:${PORT}`);
  console.log(`   Salud: http://localhost:${PORT}/api/health`);
});
