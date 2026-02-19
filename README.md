# Temp Image App

Eine moderne Web-App, bei der User Bilder posten können. Jedes Bild wird exakt 1 Stunde nach Upload automatisch gelöscht (Datei + Datenbankeintrag).

## ✨ Features

- 🔐 **Authentication**: Registrierung, Login, Logout mit NextAuth.js
- 📤 **Bild-Upload**: Drag & Drop, Preview, MIME-Type & Größen-Validierung
- 📱 **Feed**: Zeigt alle nicht-abgelaufenen Bilder
- ⏰ **Automatische Löschung**: Cleanup-Worker löscht abgelaufene Bilder jede Minute
- 🛡️ **Security**: Rate Limiting, Input Validation, sichere Uploads
- 🎨 **Moderne UI**: Tailwind CSS, Dark Mode, Responsive Design

## Tech-Stack

- **Next.js 14** (App Router) mit TypeScript
- **Prisma** als ORM
- **PostgreSQL** als Datenbank
- **NextAuth.js** für Authentication (Credentials Provider)
- **Tailwind CSS** für Styling
- **bcryptjs** für Password Hashing
- **node-cron** für Cleanup-Scheduling

## Projektstruktur

```
hh/
├── app/
│   ├── (protected)/       # Geschützte Routes
│   │   ├── feed/         # Bild-Feed
│   │   └── upload/       # Upload-Seite
│   ├── api/
│   │   ├── auth/         # NextAuth Routes
│   │   ├── register/     # Registrierung
│   │   ├── upload/       # Upload-Endpoint
│   │   ├── cleanup/      # Cleanup API (optional)
│   │   └── uploads/      # Bild-Serving
│   ├── login/            # Login-Seite
│   ├── register/         # Registrierungs-Seite
│   └── ...
├── components/
│   ├── NavBar.tsx        # Navigation
│   └── SessionProvider.tsx
├── lib/
│   ├── auth.ts           # NextAuth Config
│   ├── prisma.ts         # Prisma Client
│   ├── upload.ts         # Upload Utilities
│   ├── rate-limit.ts     # Rate Limiting
│   └── rate-limit-middleware.ts
├── scripts/
│   ├── cleanup.ts        # Cleanup-Logik
│   └── cleanup-worker.ts # Cleanup-Worker
├── prisma/
│   └── schema.prisma     # Datenbank Schema
└── ...
```

## Setup - Schritt 1

### 1. Dependencies installieren

```bash
npm install
```

### 2. PostgreSQL Datenbank einrichten

Stelle sicher, dass PostgreSQL läuft und erstelle eine Datenbank:

```bash
# PostgreSQL starten (je nach Installation)
# Windows: Services → PostgreSQL starten
# Oder: pg_ctl start

# Datenbank erstellen
createdb image_temp_db

# Oder via psql:
psql -U postgres
CREATE DATABASE image_temp_db;
```

### 3. Environment Variables

Kopiere `.env.example` zu `.env` und passe die Werte an:

```bash
cp .env.example .env
```

Bearbeite `.env`:
- `DATABASE_URL`: Deine PostgreSQL Connection String
- `NEXTAUTH_SECRET`: Generiere einen sicheren Secret (min. 32 Zeichen)
  ```bash
  # Linux/Mac:
  openssl rand -base64 32
  
  # Windows PowerShell:
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
  ```

### 4. Prisma Setup

```bash
# Prisma Client generieren
npm run db:generate

# Datenbank Schema pushen (erstellt Tabellen)
npm run db:push

# Oder Migration erstellen (für Version Control)
npm run db:migrate
```

### 5. App starten

```bash
npm run dev
```

Die App läuft dann auf `http://localhost:3000`

### 6. Cleanup Worker starten (optional, für automatische Löschung)

In einem separaten Terminal:

```bash
npm run cleanup:worker
```

Der Worker läuft dann jede Minute und löscht abgelaufene Bilder automatisch.

## Verfügbare Scripts

- `npm run dev` - Development Server
- `npm run build` - Production Build
- `npm run start` - Production Server
- `npm run cleanup` - Einmaliger Cleanup (manuell)
- `npm run cleanup:worker` - Cleanup-Worker (läuft kontinuierlich)
- `npm run db:generate` - Prisma Client generieren
- `npm run db:push` - Schema zur DB pushen
- `npm run db:migrate` - Migration erstellen

## Dokumentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Cleanup Worker Deployment-Anleitung
- **[DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)** - Deployment-Checkliste
- **[SECURITY.md](./SECURITY.md)** - Security-Best-Practices

## Production Deployment

Siehe `DEPLOYMENT-CHECKLIST.md` für eine vollständige Checkliste.

**Kurze Übersicht:**

1. Environment Variables setzen (siehe `.env.example`)
2. Datenbank migrieren: `npm run db:migrate`
3. Build erstellen: `npm run build`
4. Cleanup Worker einrichten (siehe `DEPLOYMENT.md`)

**Empfohlene Platforms:**
- **Vercel** (mit externem PostgreSQL)
- **Render.com** (mit Scheduled Jobs)
- **Railway.app** (mit Background Workers)
- **Fly.io** (mit separater Worker-App)

## Security Features

- ✅ Password Hashing (bcryptjs)
- ✅ Rate Limiting (Register, Upload)
- ✅ Input Validation (Client + Server)
- ✅ MIME-Type & Größen-Checks
- ✅ Session-basierte Auth
- ✅ Protected Routes
- ✅ Sichere Dateinamen (kein User-Input)

Siehe `SECURITY.md` für Details.

## License

MIT
