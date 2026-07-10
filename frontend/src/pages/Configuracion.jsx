// Perfil / Configuracion (stub segun mockup). Muestra el usuario y un menu simple.
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AppShell from '../components/layout/AppShell.jsx';
import { Card, Badge } from '../components/ui/index.jsx';
import {
  IconUser, IconGlobe, IconBell, IconWifiOff, IconPhone, IconLogout, IconChevron, IconShield,
} from '../components/icons.jsx';

const ROL = { agricultor: 'Agricultor', gerente: 'Gerente de Cooperativa', gore: 'Funcionario GORE' };

export default function Configuracion() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function cerrarSesion() {
    logout();
    navigate('/login', { replace: true });
  }

  const items = [
    { Icon: IconUser, label: 'Mi cuenta' },
    { Icon: IconShield, label: 'Suscripción activa', extra: <Badge estado="validado">Plan Pro</Badge> },
    { Icon: IconGlobe, label: 'Idioma', extra: <span className="text-sm text-gray-400">Español</span> },
    { Icon: IconBell, label: 'Notificaciones', accion: () => navigate('/notificaciones') },
    { Icon: IconWifiOff, label: 'Modo offline', extra: <Toggle on /> },
    { Icon: IconPhone, label: 'Soporte vía WhatsApp' },
  ];

  return (
    <AppShell headerVariant="green">
      {/* Cabecera de perfil */}
      <div className="mb-5 flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bosque font-display text-2xl font-bold text-white">
          {usuario?.avatar_iniciales || 'U'}
        </div>
        <h1 className="mt-3 font-display text-xl font-bold text-bosque">{usuario?.nombre}</h1>
        <p className="text-sm text-gray-500">{ROL[usuario?.rol] || 'Usuario'}</p>
        <p className="text-xs text-gray-400">{usuario?.cooperativa}</p>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <Stat valor="47" label="Lotes" />
        <Stat valor="38" label="Certificados" />
        <Stat valor="12" label="Parcelas" />
      </div>

      {/* Menu */}
      <Card className="divide-y divide-gray-100 overflow-hidden">
        {items.map(({ Icon, label, extra, accion }) => (
          <button
            key={label}
            onClick={accion}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-crema"
          >
            <Icon width={20} height={20} className="text-bosque" />
            <span className="flex-1 text-[15px] text-gray-700">{label}</span>
            {extra || <IconChevron width={18} height={18} className="text-gray-300" />}
          </button>
        ))}
        <button onClick={cerrarSesion} className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-alerta transition hover:bg-alerta/5">
          <IconLogout width={20} height={20} />
          <span className="flex-1 text-[15px] font-medium">Cerrar sesión</span>
        </button>
      </Card>

      <p className="mt-4 text-center text-[11px] text-gray-400">AGRO-TRACE v1.0.0 · MVP GEBT 2026</p>
    </AppShell>
  );
}

function Stat({ valor, label }) {
  return (
    <Card className="p-3 text-center">
      <p className="font-display text-2xl font-bold text-bosque">{valor}</p>
      <p className="text-[11px] text-gray-500">{label}</p>
    </Card>
  );
}
function Toggle({ on }) {
  return (
    <span className={`flex h-6 w-11 items-center rounded-full p-0.5 ${on ? 'justify-end bg-hoja' : 'justify-start bg-gray-300'}`}>
      <span className="h-5 w-5 rounded-full bg-white shadow" />
    </span>
  );
}
