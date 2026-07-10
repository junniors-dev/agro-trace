# 🌱 AGRO-TRACE

**Plataforma de Trazabilidad Inteligente y Certificación Digital para la Agroexportación de palta en Lambayeque, Perú.**

MVP del proyecto universitario **GEBT (Grupo 6)**. App **mobile-first** que registra cada etapa de la cadena de producción (Siembra → Cosecha → Acopio → Packing), genera un **Certificado de Origen Digital** con **código QR real** y un **hash SHA-256 real**, y permite su **verificación pública** escaneando el QR desde cualquier celular — cumpliendo el enfoque del Reglamento europeo **EUDR** (no deforestación).

> **100% client-side:** la app NO necesita un servidor. Todos los datos viven en el dispositivo, y el QR lleva la información de verificación embebida, así que la página pública funciona desde cualquier celular y en cualquier red.

---

## 📱 Formas de usarla

| Formato | Cómo |
|--------|------|
| **APK Android** | Instala `AGRO-TRACE.apk` en tu celular (ver abajo). App autónoma, sin servidor. |
| **Web** | Abre la versión publicada en GitHub Pages (URL abajo). |
| **Verificación QR** | Escanea el QR de un certificado con la cámara → abre la verificación pública. |

- **Sitio publicado:** https://junniors-dev.github.io/agro-trace/
- **APK:** `AGRO-TRACE.apk` (en la raíz del proyecto)

---

## 🔑 Usuarios de prueba

| Rol | Celular | Contraseña |
|-----|---------|-----------|
| Agricultor | `987654321` | `agro2026` |
| Gerente de cooperativa | `976543210` | `coop2026` |
| Funcionario GORE | `965432109` | `gore2026` |

*(En la pantalla de login puedes tocar cada usuario para autocompletar.)*

---

## 🧭 Flujo de demo (punta a punta)

1. **Inicia sesión** con cualquier usuario de prueba.
2. **Dashboard:** mapa de parcelas de Lambayeque + indicadores (lotes certificados, kg trazados, alertas EUDR, certificados QR) + actividad reciente.
3. **Registrar lote** en 4 pasos (Siembra → Cosecha → Acopio → Packing). El progreso se guarda entre pasos.
4. Al finalizar Packing se genera automáticamente el **Certificado de Origen Digital**: código `AT-2026-XXXX`, **hash SHA-256 real** y **QR real**.
5. **Escanea el QR** con tu celular → se abre la **verificación pública** (timeline de las 4 etapas + estado satelital + hash). No requiere cuenta ni conexión al servidor.

---

## 💻 Correr en tu PC (desarrollo)

Requisitos: **Node.js 18+**.

```bash
cd frontend
npm install
npm run dev
```
Abre http://localhost:5173

> No hay backend que levantar. La app corre sola en el navegador.

---

## 📦 Generar el APK de Android

Requisitos: **Android Studio** instalado (incluye el JDK y el SDK). No necesitas abrir el IDE.

```bash
cd frontend
npm install
npm run build           # compila la web a dist/
npx cap sync android    # copia la web al proyecto Android
cd android
./gradlew.bat assembleDebug
```
El APK queda en:
`frontend/android/app/build/outputs/apk/debug/app-debug.apk`

**Instalar en el celular:**
1. Copia el `.apk` al teléfono (cable, WhatsApp, Drive…).
2. Ábrelo y permite **“Instalar apps de orígenes desconocidos”** cuando lo pida.
3. Listo: la app funciona sola, sin PC ni misma red WiFi.

> El código QR de los certificados apunta al sitio público (GitHub Pages) definido en `frontend/.env` (`VITE_PUBLIC_URL`). Los datos de verificación viajan dentro del QR, por lo que cualquier celular que lo escanee ve la trazabilidad sin conectarse a tu equipo.

---

## 🌐 Publicar la web (GitHub Pages)

```bash
cd frontend
npm run build:pages     # build con base /agro-trace/ y 404.html para SPA
# luego se publica el contenido de dist/ en la rama gh-pages
```
La rama `gh-pages` de este repo sirve el sitio en
`https://junniors-dev.github.io/agro-trace/`.

---

## 🏗️ Arquitectura

```
agro-trace/
├── frontend/                # App React + Vite + Tailwind (todo el producto)
│   ├── src/
│   │   ├── services/
│   │   │   ├── store.js      # "backend" en el dispositivo (localStorage)
│   │   │   ├── hash.js       # SHA-256 real (Web Crypto)
│   │   │   ├── qr.js         # QR real + datos embebidos en el enlace
│   │   │   └── api.js        # fachada que usan las pantallas
│   │   ├── pages/            # Login, Dashboard, RegistrarLote, Certificado,
│   │   │                     # VerificacionPublica, Notificaciones, Reportes, Perfil
│   │   └── components/       # UI, layout (tab bar), mapa Leaflet, logo
│   ├── android/             # Proyecto Android (Capacitor) → genera el APK
│   └── .env                 # VITE_PUBLIC_URL (URL pública del QR)
├── backend/                 # (LEGACY) versión anterior con Express+SQLite. Ya NO se usa.
└── AGRO-TRACE.apk           # APK instalable
```

### Partes simuladas (con TODO para producción)
- **Validación satelital (EUDR):** estado fijo por parcela. Ver `TODO` en `qr.js`/`store.js`.
  *En producción:* integrar **Google Earth Engine** para analizar deforestación.
- **Blockchain:** se calcula un **SHA-256 real** del lote (matemáticamente inmutable), pero no se ancla en una cadena real.
  *En producción:* anclar el hash en una red (ej. Polygon) y guardar el `txHash`.

---

## 🎨 Diseño
- Paleta: verde bosque `#14532D`, verde hoja `#22C55E`, crema `#FAF9F5`, ámbar `#D97706`, rojo EUDR `#DC2626`.
- Tipografías: **Space Grotesk** (títulos), **Inter** (texto).
- Mobile-first, pensado para celulares de gama baja en campo.

---

*Proyecto académico — Grupo 6, curso GEBT, 2026-I.*
