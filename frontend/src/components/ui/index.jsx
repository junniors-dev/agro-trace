// Componentes UI reutilizables de AGRO-TRACE.
import { Link } from 'react-router-dom';

// ---- Boton ----
export function Button({ children, variant = 'primary', className = '', as, to, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-base px-5 py-3.5 transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-bosque text-white shadow-card hover:bg-[#0f3d21]',
    accent: 'bg-hoja text-white hover:brightness-95',
    outline: 'border-2 border-bosque text-bosque bg-white hover:bg-bosque/5',
    ghost: 'text-bosque hover:bg-bosque/5',
    danger: 'bg-alerta text-white hover:brightness-95',
  };
  const cls = `${base} ${variants[variant]} ${className}`;
  if (to) return <Link to={to} className={cls} {...props}>{children}</Link>;
  const Comp = as || 'button';
  return <Comp className={cls} {...props}>{children}</Comp>;
}

// ---- Tarjeta ----
export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-white rounded-2xl shadow-card ${className}`} {...props}>
      {children}
    </div>
  );
}

// ---- Badge de estado ----
export function Badge({ estado, children }) {
  const map = {
    certificado: 'bg-hoja/15 text-bosque',
    validado: 'bg-hoja/15 text-bosque',
    en_progreso: 'bg-ambar/15 text-ambar',
    pendiente: 'bg-ambar/15 text-ambar',
    alerta: 'bg-alerta/15 text-alerta',
  };
  const label = children || {
    certificado: 'Certificado', validado: 'Validado',
    en_progreso: 'En proceso', pendiente: 'Pendiente', alerta: 'Alerta',
  }[estado];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${map[estado] || 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
}

// ---- Campo de formulario con icono ----
export function Field({ label, icon, children, hint }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-gray-700 mb-1.5">{label}</span>}
      <div className="relative">
        {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bosque/60">{icon}</span>}
        {children}
      </div>
      {hint && <span className="block text-xs text-gray-400 mt-1">{hint}</span>}
    </label>
  );
}

const inputBase = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] outline-none focus:border-bosque focus:ring-2 focus:ring-bosque/15 transition';

export function Input({ icon, className = '', ...props }) {
  return <input className={`${inputBase} ${icon ? 'pl-11' : ''} ${className}`} {...props} />;
}

export function Select({ icon, className = '', children, ...props }) {
  return (
    <select className={`${inputBase} ${icon ? 'pl-11' : ''} appearance-none ${className}`} {...props}>
      {children}
    </select>
  );
}

// ---- Indicador de progreso de 4 etapas ----
const ETAPAS = [
  { key: 'siembra', label: 'Siembra' },
  { key: 'cosecha', label: 'Cosecha' },
  { key: 'acopio', label: 'Acopio' },
  { key: 'packing', label: 'Packing' },
];

export function StepProgress({ pasoActual }) {
  // pasoActual: indice 0..3 de la etapa en curso
  return (
    <div className="flex items-center justify-between px-1">
      {ETAPAS.map((e, i) => {
        const completado = i < pasoActual;
        const activo = i === pasoActual;
        return (
          <div key={e.key} className="flex flex-col items-center flex-1 relative">
            {i > 0 && (
              <span
                className={`absolute top-3.5 right-1/2 h-0.5 w-full -z-0 ${i <= pasoActual ? 'bg-hoja' : 'bg-gray-200'}`}
              />
            )}
            <div
              className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition
                ${completado ? 'bg-hoja border-hoja text-white' : ''}
                ${activo ? 'bg-white border-hoja text-hoja ring-4 ring-hoja/20' : ''}
                ${!completado && !activo ? 'bg-white border-gray-300 text-gray-400' : ''}`}
            >
              {completado ? '✓' : i + 1}
            </div>
            <span className={`mt-1.5 text-[11px] font-medium ${activo ? 'text-bosque font-semibold' : completado ? 'text-bosque' : 'text-gray-400'}`}>
              {e.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export { ETAPAS };
