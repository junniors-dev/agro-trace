// Contenedor principal de las pantallas autenticadas:
// header verde con logo + usuario, contenido scrollable y tab bar inferior.
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Logo from '../Logo.jsx';
import TabBar from './TabBar.jsx';
import { IconBell } from '../icons.jsx';

export default function AppShell({ children, title, showHeader = true, headerVariant = 'green' }) {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-crema">
      {showHeader && headerVariant === 'green' && (
        <header className="bg-bosque px-4 pt-4 pb-3 text-white">
          <div className="flex items-center justify-between">
            <Logo variant="full" tone="light" size={32} />
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/notificaciones')} className="relative" aria-label="Notificaciones">
                <IconBell width={22} height={22} />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-alerta" />
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                {usuario?.avatar_iniciales || 'U'}
              </div>
            </div>
          </div>
          {title && <h1 className="mt-3 font-display text-xl font-bold">{title}</h1>}
        </header>
      )}

      {showHeader && headerVariant === 'light' && (
        <header className="bg-crema px-4 pt-5 pb-2">
          <div className="flex items-center justify-between">
            <Logo variant="wordmark" tone="dark" className="text-lg" />
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/notificaciones')} className="relative text-bosque" aria-label="Notificaciones">
                <IconBell width={22} height={22} />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-alerta" />
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bosque text-xs font-bold text-white">
                {usuario?.avatar_iniciales || 'U'}
              </div>
            </div>
          </div>
          {title && <h1 className="mt-2 font-display text-2xl font-bold text-bosque">{title}</h1>}
        </header>
      )}

      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4">{children}</main>

      <TabBar />
    </div>
  );
}
