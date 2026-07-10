// Seed de datos de demo para AGRO-TRACE.
// Ejecutar con: npm run seed
// Crea 3 usuarios de prueba, parcelas en Lambayeque, un lote ya certificado
// (para que el dashboard tenga datos) y notificaciones iniciales.
import db, { aplicarEsquema, DB_PATH } from './index.js';
import { sha256DelLote } from '../services/blockchain.service.js';
import { generarQrDataUrl } from '../services/qr.service.js';

const BASE_URL = process.env.PUBLIC_URL || 'http://localhost:5173';

async function seed() {
  aplicarEsquema();

  // Limpieza para reseed idempotente
  db.exec(`
    DELETE FROM certificados;
    DELETE FROM etapas_lote;
    DELETE FROM lotes;
    DELETE FROM notificaciones;
    DELETE FROM parcelas;
    DELETE FROM usuarios;
    DELETE FROM sqlite_sequence;
  `);

  // ---- Usuarios de prueba (celular + password hardcodeados) ----
  const insUsuario = db.prepare(`
    INSERT INTO usuarios (nombre, celular, password, rol, cooperativa, avatar_iniciales)
    VALUES (@nombre, @celular, @password, @rol, @cooperativa, @iniciales)
  `);
  const agricultor = insUsuario.run({
    nombre: 'Juan Pérez López', celular: '987654321', password: 'agro2026',
    rol: 'agricultor', cooperativa: 'APROPAL', iniciales: 'JP'
  });
  const gerente = insUsuario.run({
    nombre: 'Diego Rivas Chávez', celular: '976543210', password: 'coop2026',
    rol: 'gerente', cooperativa: 'APROPAL', iniciales: 'DR'
  });
  insUsuario.run({
    nombre: 'María Torres Gil', celular: '965432109', password: 'gore2026',
    rol: 'gore', cooperativa: 'GORE Lambayeque', iniciales: 'MT'
  });

  // ---- Parcelas en distritos de Lambayeque ----
  const insParcela = db.prepare(`
    INSERT INTO parcelas (codigo, nombre, agricultor_id, distrito, lat, lng, area_ha, estado_satelital)
    VALUES (@codigo, @nombre, @agricultor, @distrito, @lat, @lng, @area, @estado)
  `);
  const parcelas = [
    { codigo: 'P-042', nombre: 'Finca El Amanecer', distrito: 'Olmos', lat: -5.9860, lng: -79.7460, area: 3.5, estado: 'validado' },
    { codigo: 'P-038', nombre: 'Fundo Santa Rosa', distrito: 'Motupe', lat: -6.1490, lng: -79.7140, area: 2.8, estado: 'validado' },
    { codigo: 'P-031', nombre: 'Predio La Esperanza', distrito: 'Jayanca', lat: -6.3560, lng: -79.8130, area: 4.1, estado: 'alerta' },
    { codigo: 'P-027', nombre: 'Chacra Los Faiques', distrito: 'Olmos', lat: -5.9980, lng: -79.7020, area: 1.9, estado: 'validado' },
    { codigo: 'P-019', nombre: 'Finca San Isidro', distrito: 'Ferreñafe', lat: -6.6380, lng: -79.7890, area: 2.4, estado: 'validado' },
  ];
  const parcelaIds = {};
  for (const p of parcelas) {
    const r = insParcela.run({ ...p, agricultor: agricultor.lastInsertRowid });
    parcelaIds[p.codigo] = r.lastInsertRowid;
  }

  // ---- Lote demo YA certificado (AT-2026-0001) para poblar dashboard/verificacion ----
  const insLote = db.prepare(`
    INSERT INTO lotes (codigo, parcela_id, producto, etapa_actual, estado, creado_por)
    VALUES (@codigo, @parcela, 'Palta Hass', 'certificado', 'certificado', @creador)
  `);
  const loteDemo = insLote.run({
    codigo: 'AT-2026-0001', parcela: parcelaIds['P-042'], creador: agricultor.lastInsertRowid
  });
  const loteId = loteDemo.lastInsertRowid;

  const insEtapa = db.prepare(`
    INSERT INTO etapas_lote (lote_id, tipo_etapa, responsable, ubicacion, fecha, peso_kg, gps_lat, gps_lng, foto_url, extra)
    VALUES (@lote, @tipo, @resp, @ubic, @fecha, @peso, @lat, @lng, @foto, @extra)
  `);
  insEtapa.run({ lote: loteId, tipo: 'siembra', resp: 'Juan Pérez López', ubic: 'Finca El Amanecer, Olmos', fecha: '2026-01-15', peso: null, lat: -5.9860, lng: -79.7460, foto: 'evidencia-siembra.jpg', extra: null });
  insEtapa.run({ lote: loteId, tipo: 'cosecha', resp: 'Juan Pérez López', ubic: 'Finca El Amanecer, Olmos', fecha: '2026-04-20', peso: 3200, lat: -5.9861, lng: -79.7462, foto: 'evidencia-cosecha.jpg', extra: JSON.stringify({ condicion: 'Óptima' }) });
  insEtapa.run({ lote: loteId, tipo: 'acopio', resp: 'Centro de Acopio Lambayeque S.A.', ubic: 'Centro de Acopio Lambayeque', fecha: '2026-04-22', peso: 3180, lat: -6.7100, lng: -79.8300, foto: 'evidencia-acopio.jpg', extra: null });
  insEtapa.run({ lote: loteId, tipo: 'packing', resp: 'Empacadora Frutos del Norte', ubic: 'Empacadora Frutos del Norte', fecha: '2026-04-25', peso: 2400, lat: -6.6500, lng: -79.8000, foto: 'evidencia-packing.jpg', extra: JSON.stringify({ cajas: 240, calibre: '14', destino: 'Unión Europea', contenedor: 'MSKU-7841203' }) });

  // Certificado del lote demo (hash real + QR real)
  const loteCompleto = construirLoteParaHash(loteId);
  const hash = sha256DelLote(loteCompleto);
  const url = `${BASE_URL}/verificar/AT-2026-0001`;
  const qr = await generarQrDataUrl(url);
  db.prepare(`
    INSERT INTO certificados (lote_id, codigo, hash_sha256, qr_dataurl, url_verificacion, estado_satelital, cumple_eudr)
    VALUES (@lote, 'AT-2026-0001', @hash, @qr, @url, 'validado', 1)
  `).run({ lote: loteId, hash, qr, url });

  // ---- Notificaciones iniciales (reflejan los mockups) ----
  const insNotif = db.prepare(`
    INSERT INTO notificaciones (usuario_id, categoria, titulo, mensaje, leida)
    VALUES (@usuario, @categoria, @titulo, @mensaje, @leida)
  `);
  const notifs = [
    { categoria: 'urgente', titulo: 'Incumplimiento EUDR detectado en parcela P-031', mensaje: 'Se ha detectado una no-conformidad en la validación satelital. Revisar de inmediato.', leida: 0 },
    { categoria: 'exito', titulo: 'Certificado QR generado exitosamente — Lote AT-2026-0001', mensaje: 'El lote ha sido validado y está listo para exportación. Ver certificado QR.', leida: 0 },
    { categoria: 'sistema', titulo: 'Actualización del sistema completada', mensaje: 'Nuevas características de mapeo y alertas de riesgo climático disponibles.', leida: 0 },
    { categoria: 'informativa', titulo: 'Lote pendiente de registro — Etapa Acopio', mensaje: 'El registro de acopio está incompleto. Favor de subir los documentos requeridos.', leida: 0 },
    { categoria: 'informativa', titulo: 'Actualización normativa EUDR disponible', mensaje: 'Nuevas regulaciones de la UE para la trazabilidad están en vigor. Consultar guía.', leida: 1 },
  ];
  for (const n of notifs) insNotif.run({ usuario: gerente.lastInsertRowid, ...n });

  console.log('✅ Seed completado.');
  console.log('   Base de datos:', DB_PATH);
  console.log('   Usuarios de prueba:');
  console.log('     Agricultor  → 987654321 / agro2026');
  console.log('     Gerente     → 976543210 / coop2026');
  console.log('     GORE        → 965432109 / gore2026');
}

// Reconstruye el objeto del lote para hashear (mismo formato que usa el endpoint de certificar)
function construirLoteParaHash(loteId) {
  const lote = db.prepare('SELECT * FROM lotes WHERE id = ?').get(loteId);
  const parcela = db.prepare('SELECT * FROM parcelas WHERE id = ?').get(lote.parcela_id);
  const etapas = db.prepare('SELECT tipo_etapa, responsable, ubicacion, fecha, peso_kg, gps_lat, gps_lng FROM etapas_lote WHERE lote_id = ? ORDER BY id').all(loteId);
  return { codigo: lote.codigo, producto: lote.producto, parcela: parcela.codigo, etapas };
}

seed().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
