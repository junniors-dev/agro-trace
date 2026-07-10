/** @type {import('tailwindcss').Config} */
// Paleta y tipografias oficiales de AGRO-TRACE (segun mockups del proyecto GEBT).
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bosque: '#14532D',   // primario - verde bosque oscuro
        hoja: '#22C55E',     // acento / exito - verde hoja
        crema: '#FAF9F5',    // fondo
        ambar: '#D97706',    // alerta modo offline / pendiente
        alerta: '#DC2626',   // alerta EUDR
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(20, 83, 45, 0.08)',
        tab: '0 -2px 16px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
