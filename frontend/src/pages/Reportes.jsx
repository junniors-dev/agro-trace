// Reportes de Sostenibilidad con datos REALES (calculados de los lotes certificados)
// y exportación funcional a PDF y Excel (client-side, dentro del APK).
import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import AppShell from '../components/layout/AppShell.jsx';
import { Card, Button, Badge } from '../components/ui/index.jsx';
import { IconShield, IconPin, IconGlobe, IconClock, IconDownload } from '../components/icons.jsx';
import { descargarReportePDF } from '../services/pdf.js';
import { descargarReporteExcel } from '../services/excel.js';

export default function Reportes() {
  const [rep, setRep] = useState(null);

  useEffect(() => {
    api.reporteSostenibilidad().then(setRep).catch(() => {});
  }, []);

  if (!rep) {
    return (
      <AppShell headerVariant="light" title="Reportes de Sostenibilidad">
        <p className="py-10 text-center text-sm text-gray-400">Generando reporte…</p>
      </AppShell>
    );
  }

  const max = Math.max(1, ...rep.porMes.map((x) => x.valor));

  return (
    <AppShell headerVariant="light" title="Reportes de Sostenibilidad">
      <div className="mb-4"><Badge estado="validado">Generado {rep.resumen.generado} · datos reales</Badge></div>

      {/* Gráfico de barras (datos reales por mes) */}
      <Card className="mb-4 p-4">
        <p className="mb-3 text-sm font-semibold text-gray-700">Lotes certificados por mes</p>
        <div className="flex h-40 items-end justify-between gap-1">
          {rep.porMes.map((x) => (
            <div key={x.mes} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[9px] text-gray-400">{x.valor || ''}</span>
              <div
                className="w-full rounded-t bg-gradient-to-t from-bosque to-hoja"
                style={{ height: `${Math.max(2, (x.valor / max) * 100)}%`, opacity: x.valor ? 1 : 0.25 }}
              />
              <span className="text-[9px] text-gray-400">{x.mes}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Indicadores reales */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Indicador Icon={IconShield} label="Cumplimiento EUDR" valor={`${rep.resumen.cumplimientoEudr}%`} />
        <Indicador Icon={IconPin} label="Lotes certificados" valor={String(rep.resumen.lotesCertificados)} />
        <Indicador Icon={IconGlobe} label="Kg exportados" valor={rep.resumen.kgExportados.toLocaleString('es-PE')} />
        <Indicador Icon={IconClock} label="Tiempo prom. certificación" valor={rep.resumen.tiempoPromedio} />
      </div>

      <Button className="mb-2 w-full" onClick={() => descargarReportePDF(rep)}>
        <IconDownload width={20} height={20} /> Generar reporte PDF
      </Button>
      <Button variant="outline" className="w-full" onClick={() => descargarReporteExcel(rep)}>
        <IconDownload width={20} height={20} /> Exportar Excel
      </Button>

      <p className="mt-4 text-center text-[11px] text-gray-400">
        Generado automáticamente por AGRO-TRACE · {rep.resumen.cooperativa}
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
