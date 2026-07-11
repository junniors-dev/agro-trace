// Pantalla "Recuperar contraseña" (flujo simulado).
// TODO(produccion): integrar envio real de codigo por SMS (ej. Twilio / API de operador).
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import Logo from '../components/Logo.jsx';
import { Button, Input, Field } from '../components/ui/index.jsx';
import { IconPhone, IconArrowLeft, IconCheckCircle } from '../components/icons.jsx';

export default function RecuperarPassword() {
  const navigate = useNavigate();
  const [celular, setCelular] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!/^\d{9}$/.test(celular)) { setError('Ingresa un celular válido de 9 dígitos.'); return; }
    setCargando(true);
    try {
      await api.recuperarPassword(celular);
      setEnviado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-crema px-6 py-10">
      <button onClick={() => navigate('/login')} className="mb-4 flex items-center gap-1 self-start text-sm text-bosque">
        <IconArrowLeft width={18} height={18} /> Volver a iniciar sesión
      </button>

      <div className="mb-6 flex flex-col items-center text-center">
        <Logo variant="icon" size={64} />
        <h1 className="mt-3 font-display text-2xl font-bold text-bosque">Recuperar contraseña</h1>
      </div>

      {enviado ? (
        <div className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-card">
          <div className="animate-pop flex h-16 w-16 items-center justify-center rounded-full bg-hoja/15 text-hoja">
            <IconCheckCircle width={40} height={40} />
          </div>
          <h2 className="mt-3 font-display text-lg font-bold text-bosque">Código enviado</h2>
          <p className="mt-1 text-sm text-gray-500">
            Si el número <span className="font-semibold">{celular}</span> está registrado, recibirás un código de
            verificación por SMS para restablecer tu contraseña.
          </p>
          <Button className="mt-5 w-full" to="/login">Volver a iniciar sesión</Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <p className="text-center text-sm text-gray-500">
            Ingresa tu número de celular y te enviaremos un código de verificación por SMS.
          </p>
          <Field label="Número de celular" icon={<IconPhone width={20} height={20} />}>
            <Input icon type="tel" inputMode="numeric" maxLength={9} value={celular}
              onChange={(e) => setCelular(e.target.value.replace(/\D/g, ''))} placeholder="9 dígitos" />
          </Field>
          {error && <div className="rounded-xl bg-alerta/10 px-4 py-3 text-sm font-medium text-alerta">{error}</div>}
          <Button type="submit" className="w-full" disabled={cargando}>
            {cargando ? 'Enviando…' : 'Enviar código'}
          </Button>
          <p className="text-center text-sm text-gray-500">
            ¿Recordaste tu contraseña? <Link to="/login" className="font-semibold text-bosque">Inicia sesión</Link>
          </p>
        </form>
      )}
    </div>
  );
}
