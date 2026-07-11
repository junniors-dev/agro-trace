// Pantalla de inicio de sesion (celular + contrasena) con usuarios de prueba.
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import Logo from '../components/Logo.jsx';
import { Button, Input, Field } from '../components/ui/index.jsx';
import { IconPhone, IconLock } from '../components/icons.jsx';

export default function Login() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const [celular, setCelular] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [demos, setDemos] = useState([]);

  useEffect(() => {
    if (usuario) navigate('/dashboard', { replace: true });
  }, [usuario, navigate]);

  useEffect(() => {
    api.usuariosDemo().then((d) => setDemos(d.usuarios)).catch(() => {});
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await login(celular, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  // Precarga rapida de credenciales de demo
  function usarDemo(cel) {
    const map = { '987654321': 'agro2026', '976543210': 'coop2026', '965432109': 'gore2026' };
    setCelular(cel);
    setPassword(map[cel] || '');
  }

  const rolLabel = { agricultor: 'Agricultor', gerente: 'Gerente de cooperativa', gore: 'Funcionario GORE' };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-crema px-6 py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo variant="icon" size={72} />
        <h1 className="mt-3 font-display text-3xl font-bold text-bosque">AGRO-TRACE</h1>
        <p className="mt-1 text-sm text-gray-500">Trazabilidad y certificación digital de origen</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Número de celular o DNI" icon={<IconPhone width={20} height={20} />}>
          <Input
            icon
            type="text"
            inputMode="numeric"
            placeholder="Celular (987…) o DNI (445…)"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            autoComplete="username"
          />
        </Field>
        <Field label="Contraseña" icon={<IconLock width={20} height={20} />}>
          <Input
            icon
            type="password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </Field>

        {error && (
          <div className="rounded-xl bg-alerta/10 px-4 py-3 text-sm font-medium text-alerta">{error}</div>
        )}

        <Button type="submit" className="w-full" disabled={cargando}>
          {cargando ? 'Ingresando…' : 'Iniciar sesión'}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <Link to="/recuperar" className="text-gray-500 hover:text-bosque">¿Olvidaste tu contraseña?</Link>
          <Link to="/registro" className="font-semibold text-bosque">Crear cuenta</Link>
        </div>
      </form>

      {demos.length > 0 && (
        <div className="mt-8">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-gray-400">
            Usuarios de prueba (toca para autocompletar)
          </p>
          <div className="space-y-2">
            {demos.map((u) => (
              <button
                key={u.celular}
                onClick={() => usarDemo(u.celular)}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-left text-sm transition hover:border-bosque"
              >
                <span>
                  <span className="font-semibold text-bosque">{rolLabel[u.rol]}</span>
                  <span className="block text-xs text-gray-400">{u.nombre}</span>
                </span>
                <span className="font-mono text-xs text-gray-500">{u.celular}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
