// Barra de navegacion inferior (5 tabs, segun mockups): Inicio, Registrar, QR, Reportes, Perfil.
import { NavLink } from 'react-router-dom';
import { IconHome, IconPlus, IconQr, IconChart, IconUser } from '../icons.jsx';

const TABS = [
  { to: '/dashboard', label: 'Inicio', Icon: IconHome },
  { to: '/registrar', label: 'Registrar', Icon: IconPlus },
  { to: '/escaner', label: 'QR Escáner', Icon: IconQr },
  { to: '/reportes', label: 'Reportes', Icon: IconChart },
  { to: '/perfil', label: 'Perfil', Icon: IconUser },
];

export default function TabBar() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 border-t border-gray-100 bg-white shadow-tab">
      <div className="grid grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 text-[10.5px] font-medium transition ${
                isActive ? 'text-bosque' : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon width={22} height={22} strokeWidth={isActive ? 2.1 : 1.7} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
