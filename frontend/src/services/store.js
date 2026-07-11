// Capa de datos 100% client-side (sin backend).
// Persiste en localStorage del dispositivo y reproduce la logica que antes vivia
// en el servidor Express: usuarios, parcelas, lotes, etapas, certificados y
// notificaciones. El hash SHA-256 y el QR se generan en el propio dispositivo.
import { sha256Hex } from './hash.js';
import { generarQrDataUrl, construirUrlVerificacion, decodePayload } from './qr.js';

// Al cambiar la estructura del seed (p.ej. agregar DNI) se sube la version
// para forzar una recarga limpia de los datos de demo.
const KEY = 'agrotrace_db_v2';

// ---------------- Semilla inicial ----------------
function semilla() {
  return {
    seq: { lote: 1, etapa: 0, notif: 0, cert: 0 },
    usuarios: [
      { id: 1, nombre: 'Juan Pérez López', celular: '987654321', dni: '44556677', password: 'agro2026', rol: 'agricultor', cooperativa: 'APROPAL', avatar_iniciales: 'JP' },
      { id: 2, nombre: 'Diego Rivas Chávez', celular: '976543210', dni: '40112233', password: 'coop2026', rol: 'gerente', cooperativa: 'APROPAL', avatar_iniciales: 'DR' },
      { id: 3, nombre: 'María Torres Gil', celular: '965432109', dni: '45998877', password: 'gore2026', rol: 'gore', cooperativa: 'GORE Lambayeque', avatar_iniciales: 'MT' },
    ],
    parcelas: [
      { id: 1, codigo: 'P-042', nombre: 'Finca El Amanecer', agricultor_id: 1, distrito: 'Olmos', lat: -5.9860, lng: -79.7460, area_ha: 3.5, estado_satelital: 'validado' },
      { id: 2, codigo: 'P-038', nombre: 'Fundo Santa Rosa', agricultor_id: 1, distrito: 'Motupe', lat: -6.1490, lng: -79.7140, area_ha: 2.8, estado_satelital: 'validado' },
      { id: 3, codigo: 'P-031', nombre: 'Predio La Esperanza', agricultor_id: 1, distrito: 'Jayanca', lat: -6.3560, lng: -79.8130, area_ha: 4.1, estado_satelital: 'alerta' },
      { id: 4, codigo: 'P-027', nombre: 'Chacra Los Faiques', agricultor_id: 1, distrito: 'Olmos', lat: -5.9980, lng: -79.7020, area_ha: 1.9, estado_satelital: 'validado' },
      { id: 5, codigo: 'P-019', nombre: 'Finca San Isidro', agricultor_id: 1, distrito: 'Ferreñafe', lat: -6.6380, lng: -79.7890, area_ha: 2.4, estado_satelital: 'validado' },
    ],
    lotes: [
      { id: 1, codigo: 'AT-2026-0001', parcela_id: 1, producto: 'Palta Hass', etapa_actual: 'certificado', estado: 'certificado', creado_por: 1, creado_en: '2026-04-25 10:00' },
    ],
    etapas: [
      { id: 1, lote_id: 1, tipo_etapa: 'siembra', responsable: 'Juan Pérez López', ubicacion: 'Finca El Amanecer, Olmos', fecha: '2026-01-15', peso_kg: null, gps_lat: -5.9860, gps_lng: -79.7460, foto_url: 'evidencia-siembra.jpg', extra: null },
      { id: 2, lote_id: 1, tipo_etapa: 'cosecha', responsable: 'Juan Pérez López', ubicacion: 'Finca El Amanecer, Olmos', fecha: '2026-04-20', peso_kg: 3200, gps_lat: -5.9861, gps_lng: -79.7462, foto_url: 'evidencia-cosecha.jpg', extra: { condicion: 'Óptima' } },
      { id: 3, lote_id: 1, tipo_etapa: 'acopio', responsable: 'Centro de Acopio Lambayeque S.A.', ubicacion: 'Centro de Acopio Lambayeque', fecha: '2026-04-22', peso_kg: 3180, gps_lat: -6.7100, gps_lng: -79.8300, foto_url: 'evidencia-acopio.jpg', extra: null },
      { id: 4, lote_id: 1, tipo_etapa: 'packing', responsable: 'Empacadora Frutos del Norte', ubicacion: 'Empacadora Frutos del Norte', fecha: '2026-04-25', peso_kg: 2400, gps_lat: -6.6500, gps_lng: -79.8000, foto_url: 'evidencia-packing.jpg', extra: { cajas: 240, calibre: '14', destino: 'Unión Europea', contenedor: 'MSKU-7841203' } },
    ],
    certificados: [], // el del lote demo se completa en init() (necesita hash+QR async)
    notificaciones: [
      { id: 1, usuario_id: 2, categoria: 'urgente', titulo: 'Incumplimiento EUDR detectado en parcela P-031', mensaje: 'Se ha detectado una no-conformidad en la validación satelital. Revisar de inmediato.', leida: false, creada_en: 'hace 2h' },
      { id: 2, usuario_id: 2, categoria: 'exito', titulo: 'Certificado QR generado exitosamente — Lote AT-2026-0001', mensaje: 'El lote ha sido validado y está listo para exportación. Ver certificado QR.', leida: false, creada_en: 'hace 5h' },
      { id: 3, usuario_id: 2, categoria: 'sistema', titulo: 'Actualización del sistema completada', mensaje: 'Nuevas características de mapeo y alertas de riesgo climático disponibles.', leida: false, creada_en: 'hace 10min' },
      { id: 4, usuario_id: 2, categoria: 'informativa', titulo: 'Lote pendiente de registro — Etapa Acopio', mensaje: 'El registro de acopio está incompleto. Favor de subir los documentos requeridos.', leida: false, creada_en: 'hace 1d' },
      { id: 5, usuario_id: 2, categoria: 'informativa', titulo: 'Actualización normativa EUDR disponible', mensaje: 'Nuevas regulaciones de la UE para la trazabilidad están en vigor. Consultar guía.', leida: true, creada_en: 'hace 2d' },
    ],
  };
}

// ---------------- Persistencia ----------------
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}
function save(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

let _db = null;
let _initPromise = null;

async function init() {
  if (_db) return _db;
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    _db = load();
    if (!_db) {
      _db = semilla();
      // Completa el certificado del lote demo (hash + QR reales)
      const cert = await construirCertificado(_db, 1, 'AT-2026-0001');
      _db.certificados.push(cert);
      _db.seq.cert = 1;
      save(_db);
    }
    return _db;
  })();
  return _initPromise;
}

// ---------------- Helpers de dominio ----------------
function ahora() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function loteCompleto(db, id) {
  const lote = db.lotes.find((l) => l.id === id);
  if (!lote) return null;
  const parcela = db.parcelas.find((p) => p.id === lote.parcela_id) || {};
  const etapas = db.etapas.filter((e) => e.lote_id === id).sort((a, b) => a.id - b.id);
  const certificado = db.certificados.find((c) => c.lote_id === id) || null;
  return {
    ...lote,
    parcela_codigo: parcela.codigo, parcela_nombre: parcela.nombre,
    distrito: parcela.distrito, parcela_lat: parcela.lat, parcela_lng: parcela.lng,
    area_ha: parcela.area_ha, parcela_estado_satelital: parcela.estado_satelital,
    etapas, certificado,
  };
}

// Construye el payload publico de verificacion de un lote
function payloadVerificacion(db, loteId, codigo, hash, estadoSatelital) {
  const lote = db.lotes.find((l) => l.id === loteId);
  const parcela = db.parcelas.find((p) => p.id === lote.parcela_id) || {};
  const etapas = db.etapas.filter((e) => e.lote_id === loteId).sort((a, b) => a.id - b.id)
    .map((e) => ({
      tipo_etapa: e.tipo_etapa, responsable: e.responsable, ubicacion: e.ubicacion,
      fecha: e.fecha, peso_kg: e.peso_kg, gps_lat: e.gps_lat, gps_lng: e.gps_lng,
    }));
  return {
    codigo,
    producto: lote.producto,
    cooperativa: 'APROPAL',
    parcela: { codigo: parcela.codigo, nombre: parcela.nombre, distrito: parcela.distrito, area_ha: parcela.area_ha },
    estado_satelital: estadoSatelital,
    cumple_eudr: estadoSatelital === 'validado',
    hash_sha256: hash,
    emitido_en: ahora(),
    etapas,
  };
}

// Crea un certificado completo (hash + QR con datos embebidos)
async function construirCertificado(db, loteId, codigoForzado) {
  const lote = db.lotes.find((l) => l.id === loteId);
  const parcela = db.parcelas.find((p) => p.id === lote.parcela_id) || {};
  const estadoSatelital = parcela.estado_satelital === 'alerta' ? 'alerta' : 'validado';

  const etapas = db.etapas.filter((e) => e.lote_id === loteId).sort((a, b) => a.id - b.id);
  const hash = await sha256Hex({
    producto: lote.producto,
    parcela: parcela.codigo,
    etapas: etapas.map((e) => ({
      tipo_etapa: e.tipo_etapa, responsable: e.responsable, ubicacion: e.ubicacion,
      fecha: e.fecha, peso_kg: e.peso_kg, gps_lat: e.gps_lat, gps_lng: e.gps_lng,
    })),
  });

  const codigo = codigoForzado || siguienteCodigo(db);
  const payload = payloadVerificacion(db, loteId, codigo, hash, estadoSatelital);
  const url = construirUrlVerificacion(codigo, payload);
  const qr = await generarQrDataUrl(url);

  return {
    id: (db.seq.cert || 0) + (codigoForzado ? 1 : 1),
    lote_id: loteId, codigo, hash_sha256: hash, qr_dataurl: qr,
    url_verificacion: url, estado_satelital: estadoSatelital,
    cumple_eudr: estadoSatelital === 'validado', emitido_en: payload.emitido_en,
    payload, // guardamos el payload para reconstruir la verificacion en-app
  };
}

function siguienteCodigo(db) {
  const n = (db.seq.cert || 0) + 1;
  return `AT-2026-${String(n).padStart(4, '0')}`;
}

// ---------------- API publica (misma forma que el antiguo cliente HTTP) ----------------
export const api = {
  // Acepta celular O DNI como identificador (segun el Excel: DNI; segun la app: celular).
  async login(identificador, password) {
    const db = await init();
    const id = String(identificador).trim();
    const u = db.usuarios.find((x) => (x.celular === id || x.dni === id) && x.password === String(password));
    if (!u) throw new Error('Credenciales incorrectas. Verifica tu celular/DNI y contraseña.');
    const { password: _, ...usuario } = u;
    return { usuario };
  },

  async usuariosDemo() {
    const db = await init();
    return { usuarios: db.usuarios.map((u) => ({ nombre: u.nombre, celular: u.celular, rol: u.rol })) };
  },

  // Crear cuenta: valida y agrega un usuario nuevo al almacenamiento local.
  async registrar({ nombre, celular, dni, rol, password, confirmar, acepta }) {
    const db = await init();
    nombre = (nombre || '').trim();
    celular = (celular || '').trim();
    dni = (dni || '').trim();

    if (!nombre || !celular || !dni || !rol || !password) throw new Error('Completa todos los campos.');
    if (!/^\d{9}$/.test(celular)) throw new Error('El celular debe tener 9 dígitos.');
    if (!/^\d{8}$/.test(dni)) throw new Error('El DNI debe tener 8 dígitos.');
    if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');
    if (password !== confirmar) throw new Error('Las contraseñas no coinciden.');
    if (!acepta) throw new Error('Debes aceptar los términos y condiciones.');
    if (db.usuarios.some((u) => u.celular === celular)) throw new Error('Ya existe una cuenta con ese número de celular.');

    const iniciales = nombre.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || 'US';
    const coop = rol === 'gore' ? 'GORE Lambayeque' : 'APROPAL';
    const id = Math.max(0, ...db.usuarios.map((u) => u.id)) + 1;
    const nuevo = { id, nombre, celular, password: String(password), rol, dni, cooperativa: coop, avatar_iniciales: iniciales };
    db.usuarios.push(nuevo);
    save(db);
    const { password: _, ...usuario } = nuevo;
    return { usuario };
  },

  // Recuperar contrasena (simulado). TODO(produccion): enviar SMS real (ej. Twilio).
  async recuperarPassword(celular) {
    const db = await init();
    const existe = db.usuarios.some((u) => u.celular === String(celular).trim());
    // No revelamos si existe o no (buena practica). Simulamos envio.
    return { ok: true, existe };
  },

  async parcelas() {
    const db = await init();
    return { parcelas: db.parcelas.map((p) => ({ ...p, agricultor_nombre: db.usuarios.find((u) => u.id === p.agricultor_id)?.nombre })) };
  },

  // Detalle de una parcela + historial de validaciones satelitales (simulado).
  // TODO(produccion): el historial vendria de analisis reales de Google Earth Engine.
  async parcela(id) {
    const db = await init();
    const p = db.parcelas.find((x) => x.id === Number(id));
    if (!p) throw new Error('Parcela no encontrada.');
    const propietario = db.usuarios.find((u) => u.id === p.agricultor_id)?.nombre || '—';
    // Historial: 4 analisis recientes; el mas reciente refleja el estado actual.
    const fechas = ['25/04/2026', '10/04/2026', '05/04/2026', '01/04/2026'];
    const historial = fechas.map((fecha, i) => ({
      fecha,
      area_ha: p.area_ha,
      estado: i === 0 ? p.estado_satelital : 'validado',
    }));
    return { parcela: { ...p, propietario, fuente: 'Google Earth Engine', fecha_analisis: fechas[0], historial } };
  },

  async dashboard() {
    const db = await init();
    const lotesCertificados = db.lotes.filter((l) => l.estado === 'certificado').length;
    const kgTrazados = db.etapas.filter((e) => e.tipo_etapa === 'cosecha').reduce((s, e) => s + (e.peso_kg || 0), 0);
    const alertasEudr = db.parcelas.filter((p) => p.estado_satelital === 'alerta').length;
    const certificadosQr = db.certificados.length;
    const lotesEnProceso = db.lotes.filter((l) => l.estado === 'en_progreso').length;

    const actividad = [...db.lotes].sort((a, b) => b.id - a.id).slice(0, 6).map((l) => {
      const parcela = db.parcelas.find((p) => p.id === l.parcela_id) || {};
      const packing = db.etapas.find((e) => e.lote_id === l.id && e.tipo_etapa === 'packing');
      const cosecha = db.etapas.find((e) => e.lote_id === l.id && e.tipo_etapa === 'cosecha');
      return {
        id: l.id, codigo: l.codigo, producto: l.producto, estado: l.estado, etapa_actual: l.etapa_actual,
        creado_en: l.creado_en, parcela_codigo: parcela.codigo, distrito: parcela.distrito,
        peso_packing: packing?.peso_kg || null, peso_cosecha: cosecha?.peso_kg || null,
      };
    });

    return {
      kpis: { lotesCertificados, kgTrazados: Math.round(kgTrazados), alertasEudr, certificadosQr, lotesEnProceso },
      actividad,
    };
  },

  async lotes() {
    const db = await init();
    return { lotes: [...db.lotes].sort((a, b) => b.id - a.id) };
  },

  // Reporte de sostenibilidad calculado a partir de los lotes/certificados reales.
  async reporteSostenibilidad() {
    const db = await init();
    const certificados = db.certificados;
    const total = certificados.length;
    const validados = certificados.filter((c) => c.estado_satelital === 'validado').length;
    const cumplimientoEudr = total ? Math.round((validados / total) * 100) : 100;

    // Kg exportados = suma del peso de packing de los lotes certificados
    const kgExportados = db.etapas
      .filter((e) => e.tipo_etapa === 'packing' && db.lotes.find((l) => l.id === e.lote_id)?.estado === 'certificado')
      .reduce((s, e) => s + (e.peso_kg || 0), 0);

    // Lotes certificados por mes (del año 2026), a partir de la fecha de packing
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const porMes = Array(12).fill(0);
    for (const c of certificados) {
      const packing = db.etapas.find((e) => e.lote_id === c.lote_id && e.tipo_etapa === 'packing');
      const fecha = packing?.fecha || '';
      const m = parseInt((fecha.split('-')[1] || '0'), 10);
      if (m >= 1 && m <= 12) porMes[m - 1] += 1;
    }

    // Detalle por lote (para el Excel)
    const detalle = certificados.map((c) => {
      const lote = db.lotes.find((l) => l.id === c.lote_id) || {};
      const parcela = db.parcelas.find((p) => p.id === lote.parcela_id) || {};
      const packing = db.etapas.find((e) => e.lote_id === c.lote_id && e.tipo_etapa === 'packing') || {};
      return {
        codigo: c.codigo, producto: lote.producto || 'Palta Hass',
        parcela: parcela.codigo || '', distrito: parcela.distrito || '',
        peso_kg: packing.peso_kg || 0, estado_eudr: c.estado_satelital === 'validado' ? 'Validado' : 'Alerta',
        emitido: (c.emitido_en || '').split(' ')[0], hash: c.hash_sha256,
      };
    });

    return {
      resumen: {
        lotesCertificados: total,
        cumplimientoEudr,
        kgExportados: Math.round(kgExportados),
        tiempoPromedio: '4.2 min', // simulado (no se mide el tiempo real de certificacion)
        cooperativa: 'APROPAL',
        generado: ahora().split(' ')[0],
      },
      porMes: meses.map((m, i) => ({ mes: m, valor: porMes[i] })),
      detalle,
    };
  },

  async lote(id) {
    const db = await init();
    const l = loteCompleto(db, Number(id));
    if (!l) throw new Error('Lote no encontrado.');
    return { lote: l };
  },

  async crearLote(parcela_id, creado_por) {
    const db = await init();
    const id = (db.seq.lote || 0) + 1;
    db.seq.lote = id;
    db.lotes.push({ id, codigo: null, parcela_id: Number(parcela_id), producto: 'Palta Hass', etapa_actual: 'siembra', estado: 'en_progreso', creado_por: creado_por || null, creado_en: ahora() });
    save(db);
    return { lote: loteCompleto(db, id) };
  },

  async guardarEtapa(loteId, etapa) {
    const db = await init();
    loteId = Number(loteId);
    const lote = db.lotes.find((l) => l.id === loteId);
    if (!lote) throw new Error('Lote no encontrado.');

    const orden = ['siembra', 'cosecha', 'acopio', 'packing'];
    if (!orden.includes(etapa.tipo_etapa)) throw new Error('Etapa inválida.');

    let existente = db.etapas.find((e) => e.lote_id === loteId && e.tipo_etapa === etapa.tipo_etapa);
    if (existente) {
      Object.assign(existente, {
        responsable: etapa.responsable ?? null, ubicacion: etapa.ubicacion ?? null,
        fecha: etapa.fecha ?? null, peso_kg: etapa.peso_kg ?? null,
        gps_lat: etapa.gps_lat ?? null, gps_lng: etapa.gps_lng ?? null,
        foto_url: etapa.foto_url ?? null, extra: etapa.extra ?? null,
      });
    } else {
      const id = (db.seq.etapa || 0) + 1;
      db.seq.etapa = id;
      db.etapas.push({ id, lote_id: loteId, tipo_etapa: etapa.tipo_etapa, responsable: etapa.responsable ?? null, ubicacion: etapa.ubicacion ?? null, fecha: etapa.fecha ?? null, peso_kg: etapa.peso_kg ?? null, gps_lat: etapa.gps_lat ?? null, gps_lng: etapa.gps_lng ?? null, foto_url: etapa.foto_url ?? null, extra: etapa.extra ?? null });
    }

    if (lote.estado !== 'certificado') {
      const idx = orden.indexOf(etapa.tipo_etapa);
      lote.etapa_actual = orden[idx + 1] || 'packing';
    }
    save(db);
    return { lote: loteCompleto(db, loteId) };
  },

  async generarCertificado(lote_id) {
    const db = await init();
    lote_id = Number(lote_id);
    const lote = db.lotes.find((l) => l.id === lote_id);
    if (!lote) throw new Error('Lote no encontrado.');

    const existente = db.certificados.find((c) => c.lote_id === lote_id);
    if (existente) return { certificado: existente, yaExistia: true };

    const tienePacking = db.etapas.some((e) => e.lote_id === lote_id && e.tipo_etapa === 'packing');
    if (!tienePacking) throw new Error('Falta registrar la etapa de Packing antes de certificar.');

    const cert = await construirCertificado(db, lote_id);
    db.seq.cert = (db.seq.cert || 0) + 1;
    cert.id = db.seq.cert;
    db.certificados.push(cert);

    lote.estado = 'certificado';
    lote.etapa_actual = 'certificado';
    lote.codigo = cert.codigo;

    // Notificacion
    db.seq.notif = (db.seq.notif || 0) + 1;
    db.notificaciones.unshift({
      id: db.seq.notif, usuario_id: lote.creado_por,
      categoria: cert.estado_satelital === 'validado' ? 'exito' : 'urgente',
      titulo: cert.estado_satelital === 'validado'
        ? `Certificado QR generado exitosamente — Lote ${cert.codigo}`
        : `Alerta EUDR en el lote ${cert.codigo}`,
      mensaje: cert.estado_satelital === 'validado'
        ? 'El lote ha sido validado y está listo para exportación. Ver certificado QR.'
        : 'La validación satelital detectó una posible no-conformidad. Revisar antes de exportar.',
      leida: false, creada_en: 'ahora',
    });

    save(db);
    return { certificado: cert };
  },

  async certificado(codigo) {
    const db = await init();
    const c = db.certificados.find((x) => x.codigo === codigo);
    if (!c) throw new Error('Certificado no encontrado.');
    return { certificado: c };
  },

  // Verificacion: primero intenta leer datos del fragmento (#...) del QR;
  // si no hay, busca en el almacenamiento local por codigo.
  async verificar(codigo, fragmento) {
    if (fragmento) {
      try {
        return { verificacion: decodePayload(fragmento) };
      } catch {}
    }
    const db = await init();
    const c = db.certificados.find((x) => x.codigo === codigo);
    if (!c) throw new Error('Certificado no encontrado o inválido.');
    return { verificacion: c.payload };
  },

  async notificaciones() {
    const db = await init();
    const notificaciones = [...db.notificaciones];
    const nuevas = notificaciones.filter((n) => !n.leida).length;
    return { notificaciones, nuevas };
  },

  async leerTodasNotificaciones() {
    const db = await init();
    db.notificaciones.forEach((n) => { n.leida = true; });
    save(db);
    return { ok: true };
  },
};
