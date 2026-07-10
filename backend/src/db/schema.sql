-- Esquema de base de datos AGRO-TRACE (SQLite)
-- Trazabilidad agricola: usuarios, parcelas, lotes, etapas, certificados y notificaciones.

PRAGMA foreign_keys = ON;

-- Usuarios del sistema (login simulado con celular + contrasena)
CREATE TABLE IF NOT EXISTS usuarios (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre     TEXT NOT NULL,
  celular    TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,               -- texto plano: SOLO para demo, nunca en produccion
  rol        TEXT NOT NULL,               -- 'agricultor' | 'gerente' | 'gore'
  cooperativa TEXT,
  avatar_iniciales TEXT
);

-- Parcelas georreferenciadas
CREATE TABLE IF NOT EXISTS parcelas (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo        TEXT NOT NULL UNIQUE,      -- ej. P-042
  nombre        TEXT NOT NULL,
  agricultor_id INTEGER,
  distrito      TEXT,                      -- Olmos | Motupe | Jayanca | Ferrenafe
  lat           REAL NOT NULL,
  lng           REAL NOT NULL,
  area_ha       REAL,
  estado_satelital TEXT DEFAULT 'validado', -- 'validado' | 'alerta'
  FOREIGN KEY (agricultor_id) REFERENCES usuarios(id)
);

-- Lotes de produccion
CREATE TABLE IF NOT EXISTS lotes (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo        TEXT UNIQUE,              -- AT-2026-XXXX (se asigna al certificar)
  parcela_id    INTEGER,
  producto      TEXT DEFAULT 'Palta Hass',
  etapa_actual  TEXT DEFAULT 'siembra',  -- siembra | cosecha | acopio | packing | certificado
  estado        TEXT DEFAULT 'en_progreso', -- 'en_progreso' | 'certificado'
  creado_por    INTEGER,
  creado_en     TEXT DEFAULT (datetime('now','localtime')),
  FOREIGN KEY (parcela_id) REFERENCES parcelas(id),
  FOREIGN KEY (creado_por) REFERENCES usuarios(id)
);

-- Cada etapa registrada de un lote (siembra, cosecha, acopio, packing)
CREATE TABLE IF NOT EXISTS etapas_lote (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  lote_id     INTEGER NOT NULL,
  tipo_etapa  TEXT NOT NULL,             -- siembra | cosecha | acopio | packing
  responsable TEXT,
  ubicacion   TEXT,                      -- nombre del lugar (finca, centro de acopio, planta)
  fecha       TEXT,
  peso_kg     REAL,
  gps_lat     REAL,
  gps_lng     REAL,
  foto_url    TEXT,                       -- placeholder de la foto de evidencia
  extra       TEXT,                       -- JSON con datos adicionales (nro cajas, calibre, destino...)
  registrado_en TEXT DEFAULT (datetime('now','localtime')),
  FOREIGN KEY (lote_id) REFERENCES lotes(id),
  UNIQUE (lote_id, tipo_etapa)
);

-- Certificados de Origen Digital
CREATE TABLE IF NOT EXISTS certificados (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  lote_id          INTEGER NOT NULL UNIQUE,
  codigo           TEXT NOT NULL UNIQUE,  -- AT-2026-XXXX
  hash_sha256      TEXT NOT NULL,         -- hash real del JSON del lote
  qr_dataurl       TEXT,                  -- QR en base64 (data URL)
  url_verificacion TEXT,
  estado_satelital TEXT DEFAULT 'validado', -- 'validado' | 'alerta'
  cumple_eudr      INTEGER DEFAULT 1,
  emitido_en       TEXT DEFAULT (datetime('now','localtime')),
  FOREIGN KEY (lote_id) REFERENCES lotes(id)
);

-- Notificaciones / centro de alertas
CREATE TABLE IF NOT EXISTS notificaciones (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id  INTEGER,
  categoria   TEXT DEFAULT 'informativa', -- 'urgente' | 'exito' | 'informativa' | 'sistema'
  titulo      TEXT NOT NULL,
  mensaje     TEXT,
  leida       INTEGER DEFAULT 0,
  creada_en   TEXT DEFAULT (datetime('now','localtime')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
