// Exportación a Excel en el navegador con SheetJS (queda dentro del APK).
import * as XLSX from 'xlsx';

// Exporta el detalle de lotes certificados + un resumen a un archivo .xlsx
export function descargarReporteExcel(rep) {
  const wb = XLSX.utils.book_new();

  // Hoja 1: Resumen
  const resumen = [
    ['AGRO-TRACE — Reporte de Sostenibilidad'],
    ['Cooperativa', rep.resumen.cooperativa],
    ['Generado', rep.resumen.generado],
    [],
    ['Indicador', 'Valor'],
    ['Lotes certificados', rep.resumen.lotesCertificados],
    ['Cumplimiento EUDR (%)', rep.resumen.cumplimientoEudr],
    ['Kg exportados', rep.resumen.kgExportados],
    ['Tiempo promedio certificación', rep.resumen.tiempoPromedio],
  ];
  const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
  wsResumen['!cols'] = [{ wch: 28 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

  // Hoja 2: Detalle de lotes
  const detalle = rep.detalle.map((d) => ({
    Código: d.codigo,
    Producto: d.producto,
    Parcela: d.parcela,
    Distrito: d.distrito,
    'Peso (kg)': d.peso_kg,
    'Estado EUDR': d.estado_eudr,
    Emitido: d.emitido,
    'Hash SHA-256': d.hash,
  }));
  const wsDetalle = XLSX.utils.json_to_sheet(detalle);
  wsDetalle['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 66 }];
  XLSX.utils.book_append_sheet(wb, wsDetalle, 'Lotes certificados');

  // Hoja 3: Certificados por mes
  const porMes = [['Mes', 'Lotes certificados'], ...rep.porMes.map((x) => [x.mes, x.valor])];
  const wsMes = XLSX.utils.aoa_to_sheet(porMes);
  wsMes['!cols'] = [{ wch: 8 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsMes, 'Por mes');

  XLSX.writeFile(wb, `Reporte_Sostenibilidad_${rep.resumen.generado}.xlsx`);
}
