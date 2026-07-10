// Reportes de Sostenibilidad (stub visual segun mockup).
// Los datos del grafico son estaticos: pantalla secundaria, no es el foco de la demo.
// TODO(produccion): alimentar con datos reales del backend y exportar PDF/Excel.
import AppShell from '../components/layout/AppShell.jsx';
import { Card, Button, Badge } from '../components/ui/index.jsx';
import { IconShield, IconPin, IconGlobe, IconClock, IconDownload } from '../components/icons.jsx';

const MESES = [
  { m: 'Ene', v: 10 }, { m: 'Feb', v: 15 }, { m: 'Mar', v: 12 }, { m: 'Abr', v: 8 },
  { m: 'May', v: 13 }, { m: 'Jun', v: 10 }, { m: 'Jul', v: 15 }, { m: 'Ago', v: 15 },
  { m: 'Sep', v: 14 }, { m: 'Oct', v: 13 }, { m: 'Nov', v: 16 }, { m: 'Dic', v: 18 },
];
const MAX = Math.max(...MESES.map((x) => x.v));

export default function Reportes() {
  return (
    <AppShell headerVariant="light" title="Reportes de Sostenibilidad">
      <div className="mb-4"><Badge estado="validado">Período 2026 · Listo para exportar</Badge></div>

      {/* Grafico de barras (estatico) */}
      <Card className="mb-4 p-4">
        <p className="mb-3 text-sm font-semibold text-gray-700">Lotes certificados por mes</p>
        <div className="flex h-40 items-end justify-between gap-1">
          {MESES.map((x) => (
            <div key={x.m} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[9px] text-gray-400">{x.v}</span>
              <div
                className="w-full rounded-t bg-gradient-to-t from-bosque to-hoja"
                style={{ height: `${(x.v / MAX) * 100}%` }}
              />
              <span className="text-[9px] text-gray-400">{x.m}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Indicadores */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Indicador Icon={IconShield} label="Cumplimiento EUDR" valor="94%" />
        <Indicador Icon={IconPin} label="Lotes certificados" valor="127" />
        <Indicador Icon={IconGlobe} label="Kg exportados" valor="245,000" />
        <Indicador Icon={IconClock} label="Tiempo prom. certificación" valor="4.2 min" />
      </div>

      <Button className="mb-2 w-full" onClick={() => alert('Demo: aquí se generaría el reporte PDF.')}>
        <IconDownload width={20} height={20} /> Generar reporte PDF
      </Button>
      <Button variant="outline" className="w-full" onClick={() => alert('Demo: aquí se exportaría a Excel.')}>
        <IconDownload width={20} height={20} /> Exportar Excel
      </Button>

      <p className="mt-4 text-center text-[11px] text-gray-400">
        Generado automáticamente por AGRO-TRACE
      </p>
    </AppShell>
  );
}

function Indicador({ Icon, label, valor }) {
  return (
    <Card className="p-3.5">
      <div className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-hoja/12 text-bosque">
        <Icon width={20} height={20} />
      </div>
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="font-display text-xl font-bold text-bosque">{valor}</p>
    </Card>
  );
}
