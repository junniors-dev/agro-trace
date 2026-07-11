// Logo oficial de AGRO-TRACE: escudo con hoja+QR y checkmark.
// Importa los SVG como assets para que Vite genere la ruta correcta tanto en
// GitHub Pages (base /agro-trace/) como en el APK, y en cualquier ruta anidada.
// variant: 'full' (icono + wordmark) | 'icon' (solo icono) | 'wordmark'
// tone: 'dark' (verde sobre claro) | 'light' (blanco, para headers verdes)
import logoDark from '../assets/logo.svg';
import logoWhite from '../assets/logo-white.svg';

export function LogoIcon({ size = 40, tone = 'dark', className = '' }) {
  const src = tone === 'light' ? logoWhite : logoDark;
  return (
    <img
      src={src}
      alt="AGRO-TRACE"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}

export default function Logo({ variant = 'full', tone = 'dark', size = 40, className = '' }) {
  const wordColor = tone === 'light' ? 'text-white' : 'text-bosque';

  if (variant === 'icon') return <LogoIcon size={size} tone={tone} className={className} />;

  if (variant === 'wordmark') {
    return (
      <span className={`font-display font-bold tracking-tight ${wordColor} ${className}`}>
        AGRO-TRACE
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoIcon size={size} tone={tone} />
      <span className={`font-display font-bold tracking-tight ${wordColor}`} style={{ fontSize: size * 0.5 }}>
        AGRO-TRACE
      </span>
    </div>
  );
}
