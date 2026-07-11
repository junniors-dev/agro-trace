// Pantalla "Crear cuenta" (registro). Valida y crea el usuario en el store local,
// luego inicia sesion automaticamente. Basada en el mockup del proyecto.
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';
import { Button, Input, Select, Field } from '../components/ui/index.jsx';
import { IconUser, IconPhone, IconLock, IconArrowLeft } from '../components/icons.jsx';

export default function Registro() {
  const { registrar } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ nombre: '', celular: '', dni: '', rol: '', password: '', confirmar: '', acepta: false });
  const [verPass, setVerPass] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await registrar(f);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-crema px-6 py-8">
      <button onClick={() => navigate('/login')} className="mb-2 flex items-center gap-1 self-start text-sm text-bosque">
        <IconArrowLeft width={18} height={18} /> Volver
      </button>

      <div className="mb-6 flex flex-col items-center text-center">
        <Logo variant="icon" size={60} />
        <h1 className="mt-2 font-display text-2xl font-bold text-bosque">Crear cuenta</h1>
        <p className="text-sm text-gray-500">Únete a la red de trazabilidad AGRO-TRACE</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3.5">
        <Field label="Nombre completo" icon={<IconUser width={18} height={18} />}>
          <Input icon value={f.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Ej. Juan Pérez López" />
        </Field>
        <Field label="Número de celular" icon={<IconPhone width={18} height={18} />}>
          <Input icon type="tel" inputMode="numeric" maxLength={9} value={f.celular} onChange={(e) => set('celular', e.target.value.replace(/\D/g, ''))} placeholder="9 dígitos" />
        </Field>
        <Field label="DNI">
          <Input inputMode="numeric" maxLength={8} value={f.dni} onChange={(e) => set('dni', e.target.value.replace(/\D/g, ''))} placeholder="Documento Nacional de Identidad" />
        </Field>
        <Field label="Tipo de usuario">
          <Select value={f.rol} onChange={(e) => set('rol', e.target.value)}>
            <option value="">Selecciona…</option>
            <option value="agricultor">Agricultor</option>
            <option value="gerente">Gerente de cooperativa</option>
            <option value="gore">Funcionario GORE</option>
          </Select>
        </Field>
        <Field label="Contraseña" icon={<IconLock width={18} height={18} />}>
          <div className="relative">
            <Input icon type={verPass ? 'text' : 'password'} value={f.password} onChange={(e) => set('password', e.target.value)} placeholder="Mínimo 6 caracteres" />
            <button type="button" onClick={() => setVerPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-bosque">
              {verPass ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </Field>
        <Field label="Confirmar contraseña" icon={<IconLock width={18} height={18} />}>
          <Input icon type={verPass ? 'text' : 'password'} value={f.confirmar} onChange={(e) => set('confirmar', e.target.value)} placeholder="Repite tu contraseña" />
        </Field>

        <label className="flex items-start gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={f.acepta} onChange={(e) => set('acepta', e.target.checked)} className="mt-0.5 h-4 w-4 accent-hoja" />
          <span>Acepto los <span className="font-medium text-bosque underline">términos y condiciones</span></span>
        </label>

        {error && <div className="rounded-xl bg-alerta/10 px-4 py-3 text-sm font-medium text-alerta">{error}</div>}

        <Button type="submit" className="w-full" disabled={cargando}>
          {cargando ? 'Creando cuenta…' : 'Registrarse'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        ¿Ya tienes cuenta? <Link to="/login" className="font-semibold text-bosque">Inicia sesión</Link>
      </p>
    </div>
  );
}
