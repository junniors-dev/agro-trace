// Router principal de AGRO-TRACE.
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import RecuperarPassword from './pages/RecuperarPassword.jsx';
import ValidacionParcela from './pages/ValidacionParcela.jsx';
import Dashboard from './pages/Dashboard.jsx';
import RegistrarLote from './pages/RegistrarLote.jsx';
import CertificadoGenerado from './pages/CertificadoGenerado.jsx';
import VerificacionPublica from './pages/VerificacionPublica.jsx';
import Notificaciones from './pages/Notificaciones.jsx';
import Reportes from './pages/Reportes.jsx';
import Configuracion from './pages/Configuracion.jsx';
import Escaner from './pages/Escaner.jsx';

// Envuelve rutas que requieren sesion.
function Privada({ children }) {
  const { usuario } = useAuth();
  const location = useLocation();
  if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Publicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/recuperar" element={<RecuperarPassword />} />
      <Route path="/verificar/:codigo" element={<VerificacionPublica />} />

      {/* Privadas */}
      <Route path="/dashboard" element={<Privada><Dashboard /></Privada>} />
      <Route path="/registrar" element={<Privada><RegistrarLote /></Privada>} />
      <Route path="/registrar/:loteId" element={<Privada><RegistrarLote /></Privada>} />
      <Route path="/parcela/:id" element={<Privada><ValidacionParcela /></Privada>} />
      <Route path="/certificado/:codigo" element={<Privada><CertificadoGenerado /></Privada>} />
      <Route path="/notificaciones" element={<Privada><Notificaciones /></Privada>} />
      <Route path="/reportes" element={<Privada><Reportes /></Privada>} />
      <Route path="/perfil" element={<Privada><Configuracion /></Privada>} />
      <Route path="/escaner" element={<Privada><Escaner /></Privada>} />

      {/* Raiz */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
