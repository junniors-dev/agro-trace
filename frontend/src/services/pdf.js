// Generación de PDF en el navegador con jsPDF (queda dentro del APK, sin servicios externos).
import { jsPDF } from 'jspdf';

const BOSQUE = [20, 83, 45];
const HOJA = [34, 197, 94];
const GRIS = [107, 114, 128];

// ---- Certificado de Origen Digital en PDF ----
export function descargarCertificadoPDF(cert, verificacion) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const m = 18;

  // Encabezado verde
  doc.setFillColor(...BOSQUE);
  doc.rect(0, 0, W, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('AGRO-TRACE', m, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Certificado de Origen Digital', m, 23);
  doc.setFontSize(10);
  doc.text(cert.codigo, W - m, 15, { align: 'right' });
  const valido = cert.estado_satelital === 'validado';
  doc.text(valido ? 'VALIDO - EUDR' : 'CON ALERTA', W - m, 23, { align: 'right' });

  // QR
  if (cert.qr_dataurl) {
    try { doc.addImage(cert.qr_dataurl, 'PNG', W - m - 42, 40, 42, 42); } catch {}
  }

  // Datos del lote
  let y = 46;
  doc.setTextColor(...BOSQUE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Resumen del lote', m, y);
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  const v = verificacion || {};
  const filas = [
    ['Producto', v.producto || 'Palta Hass'],
    ['Cooperativa', v.cooperativa || 'APROPAL'],
    ['Parcela', v.parcela ? `${v.parcela.codigo} - ${v.parcela.distrito} (${v.parcela.area_ha} ha)` : '-'],
    ['Estado satelital', valido ? 'Validado - Libre de deforestacion' : 'Alerta - Revisar parcela'],
    ['Cumple EUDR', valido ? 'Si (UE 2023/1115)' : 'Requiere revision'],
    ['Emitido', cert.emitido_en || ''],
  ];
  for (const [k, val] of filas) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${k}:`, m, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(val), m + 38, y, { maxWidth: 100 });
    y += 7;
  }

  // Timeline de etapas
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BOSQUE);
  doc.setFontSize(13);
  doc.text('Trazabilidad de la cadena', m, y);
  y += 7;
  doc.setFontSize(9.5);
  (v.etapas || []).forEach((e) => {
    doc.setFillColor(...HOJA);
    doc.circle(m + 1.5, y - 1.5, 1.5, 'F');
    doc.setTextColor(...BOSQUE);
    doc.setFont('helvetica', 'bold');
    const label = { siembra: 'Siembra', cosecha: 'Cosecha', acopio: 'Acopio', packing: 'Packing' }[e.tipo_etapa] || e.tipo_etapa;
    doc.text(`${label}  ${e.fecha || ''}`, m + 6, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRIS);
    const det = `${e.ubicacion || ''}  |  GPS ${e.gps_lat != null ? Number(e.gps_lat).toFixed(4) + ', ' + Number(e.gps_lng).toFixed(4) : 's/d'}${e.peso_kg ? '  |  ' + e.peso_kg + ' kg' : ''}`;
    doc.text(det, m + 6, y + 4.5, { maxWidth: 120 });
    y += 12;
  });

  // Hash
  y += 2;
  doc.setDrawColor(220, 220, 220);
  doc.line(m, y, W - m, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BOSQUE);
  doc.setFontSize(9);
  doc.text('Hash de verificacion (SHA-256):', m, y);
  y += 5;
  doc.setFont('courier', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(8);
  doc.text(doc.splitTextToSize(cert.hash_sha256 || '', W - 2 * m), m, y);

  // Pie
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRIS);
  doc.setFontSize(8);
  doc.text('Verifica este certificado escaneando el codigo QR o en:', m, 280);
  doc.setTextColor(...BOSQUE);
  doc.text(cert.url_verificacion || '', m, 285, { maxWidth: W - 2 * m });

  doc.save(`Certificado_${cert.codigo}.pdf`);
}

// ---- Reporte de sostenibilidad en PDF ----
export function descargarReportePDF(rep) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const m = 18;

  doc.setFillColor(...BOSQUE);
  doc.rect(0, 0, W, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('AGRO-TRACE', m, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Reporte de Sostenibilidad', m, 22);
  doc.setFontSize(9);
  doc.text(`${rep.resumen.cooperativa}  |  Generado ${rep.resumen.generado}`, W - m, 22, { align: 'right' });

  // Indicadores
  let y = 44;
  doc.setTextColor(...BOSQUE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Indicadores clave', m, y);
  y += 8;
  const kpis = [
    ['Lotes certificados', String(rep.resumen.lotesCertificados)],
    ['Cumplimiento EUDR', `${rep.resumen.cumplimientoEudr}%`],
    ['Kg exportados', rep.resumen.kgExportados.toLocaleString('es-PE')],
    ['Tiempo prom. certificacion', rep.resumen.tiempoPromedio],
  ];
  doc.setFontSize(10);
  kpis.forEach(([k, val], i) => {
    const x = m + (i % 2) * 90;
    if (i % 2 === 0 && i > 0) y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRIS);
    doc.text(k, x, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BOSQUE);
    doc.setFontSize(15);
    doc.text(val, x, y + 6);
    doc.setFontSize(10);
  });
  y += 18;

  // Tabla de lotes
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BOSQUE);
  doc.setFontSize(13);
  doc.text('Lotes certificados', m, y);
  y += 7;
  const cols = [['Codigo', m], ['Parcela', m + 42], ['Distrito', m + 74], ['Kg', m + 108], ['EUDR', m + 126], ['Emitido', m + 150]];
  doc.setFillColor(...HOJA);
  doc.rect(m - 2, y - 4, W - 2 * m + 4, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  cols.forEach(([t, x]) => doc.text(t, x, y));
  y += 7;
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'normal');
  rep.detalle.forEach((d) => {
    if (y > 275) { doc.addPage(); y = 20; }
    doc.text(String(d.codigo), m, y);
    doc.text(String(d.parcela), m + 42, y);
    doc.text(String(d.distrito), m + 74, y, { maxWidth: 30 });
    doc.text(String(d.peso_kg), m + 108, y);
    doc.setTextColor(...(d.estado_eudr === 'Validado' ? BOSQUE : [220, 38, 38]));
    doc.text(d.estado_eudr, m + 126, y);
    doc.setTextColor(30, 30, 30);
    doc.text(String(d.emitido), m + 150, y);
    y += 6;
  });

  doc.setTextColor(...GRIS);
  doc.setFontSize(8);
  doc.text('Generado automaticamente por AGRO-TRACE', m, 288);

  doc.save(`Reporte_Sostenibilidad_${rep.resumen.generado}.pdf`);
}
