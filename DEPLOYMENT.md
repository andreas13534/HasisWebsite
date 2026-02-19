# Deployment-Anleitung - Cleanup Worker

Der Cleanup-Worker löscht automatisch abgelaufene Bilder (Datei + DB-Eintrag). Hier sind die Optionen für verschiedene Deployment-Plattformen.

## Lokale Entwicklung

### Option 1: Worker als separater Prozess (empfohlen)

```bash
# Terminal 1: Next.js App
npm run dev

# Terminal 2: Cleanup Worker
npm run cleanup:worker
```

Der Worker läuft dann jede Minute und löscht abgelaufene Bilder.

### Option 2: Einmaliger Cleanup (manuell)

```bash
npm run cleanup
```

### Option 3: Via API (nur Development)

```bash
curl -X POST http://localhost:3000/api/cleanup
```

---

## Production Deployment

### Option A: Render.com

**1. Scheduled Jobs (empfohlen)**

Erstelle einen neuen "Scheduled Job" in Render:

- **Name**: `image-cleanup-worker`
- **Command**: `npm run cleanup`
- **Schedule**: `*/1 * * * *` (jede Minute)
- **Environment**: Gleiche ENV-Variablen wie die Web-App

**2. Background Worker**

Erstelle einen "Background Worker":

- **Build Command**: `npm install && npm run db:generate`
- **Start Command**: `npm run cleanup:worker`
- **Environment**: Gleiche ENV-Variablen wie die Web-App

---

### Option B: Railway.app

**1. Scheduled Cron Job**

In `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Dann in Railway Dashboard:
- Neue Service erstellen: "Scheduled Task"
- Command: `npm run cleanup`
- Schedule: `*/1 * * * *`

**2. Separate Worker Service**

- Neuer Service: "Background Worker"
- Start Command: `npm run cleanup:worker`

---

### Option C: Fly.io

**1. Separate App für Worker**

Erstelle `fly.worker.toml`:

```toml
app = "image-temp-app-worker"
primary_region = "fra"

[build]
  builder = "paketobuildpacks/builder:base"

[env]
  NODE_ENV = "production"

[[services]]
  internal_port = 8080
  protocol = "tcp"
```

Dann deploye den Worker:

```bash
fly launch --config fly.worker.toml
fly scale count 1 --app image-temp-app-worker
```

**2. Cron-Job via Fly.io Cron**

In `fly.toml` der Haupt-App:

```toml
[[services]]
  [[services.checks]]
    grace_period = "10s"
    interval = "1m"
    method = "GET"
    timeout = "5s"
    path = "/api/cleanup"
```

Oder nutze Fly.io's Cron-Feature (falls verfügbar).

---

### Option D: Docker + Docker Compose

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - UPLOAD_DIR=/app/uploads
    volumes:
      - ./uploads:/app/uploads

  cleanup-worker:
    build: .
    command: npm run cleanup:worker
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - UPLOAD_DIR=/app/uploads
      - CLEANUP_INTERVAL=*/1 * * * *
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - app
```

**Dockerfile:**

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run db:generate

EXPOSE 3000

CMD ["npm", "start"]
```

---

### Option E: Vercel + Separate Worker (Serverless)

**Problem**: Vercel ist serverless und unterstützt keine langlaufenden Prozesse.

**Lösung**: Nutze Vercel Cron Jobs (Vercel Pro) oder externe Service:

**1. Vercel Cron Jobs (Vercel Pro)**

Erstelle `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cleanup",
      "schedule": "*/1 * * * *"
    }
  ]
}
```

**2. Externer Service**

Nutze einen externen Cron-Service (z.B. cron-job.org, EasyCron) der regelmäßig `https://deine-app.vercel.app/api/cleanup` aufruft.

**Wichtig**: Setze `CLEANUP_API_KEY` in `.env` und nutze ihn in der API Route!

---

## Environment Variables

Für den Cleanup-Worker benötigst du:

```env
DATABASE_URL="postgresql://..."
UPLOAD_DIR="./uploads"
CLEANUP_INTERVAL="*/1 * * * *"  # Optional, Standard: jede Minute
CLEANUP_ON_START="true"          # Optional, Cleanup beim Start
CLEANUP_API_KEY="dein-secret-key"  # Für API Route (Production)
```

---

## Monitoring & Logging

Der Worker loggt alle Aktionen:

```
[CLEANUP_WORKER] Starte Cleanup-Worker mit Intervall: */1 * * * *
[CLEANUP] 2024-01-01T12:00:00.000Z - Gefunden: 5 abgelaufene Bilder
[CLEANUP] Datei gelöscht: abc123.jpg
[CLEANUP] DB-Eintrag gelöscht: clx123...
[CLEANUP] 2024-01-01T12:00:01.234Z - Abgeschlossen: 5/5 gelöscht, 0 Fehler (1234ms)
```

**Monitoring-Tipps:**

- Logs in Production: Nutze die Logging-Features deiner Platform (Render Logs, Railway Logs, etc.)
- Alerts: Setze Alerts bei `errors > 0` im Cleanup-Stats
- Health Check: Die API Route `/api/cleanup` gibt Stats zurück

---

## Fehlerbehandlung

Der Worker behandelt folgende Fehler:

- **Datei existiert nicht** (ENOENT): Wird ignoriert, DB-Eintrag wird trotzdem gelöscht
- **DB-Fehler**: Wird geloggt, Worker läuft weiter
- **Kritische Fehler**: Werden geloggt, Worker beendet sich nicht

Der Worker ist **resilient** und läuft auch bei einzelnen Fehlern weiter.

---

## Testing

**Manuell testen:**

1. Lade ein Bild hoch
2. Setze `expiresAt` in der DB auf Vergangenheit:
   ```sql
   UPDATE images SET expires_at = NOW() - INTERVAL '1 hour' WHERE id = '...';
   ```
3. Führe Cleanup aus: `npm run cleanup`
4. Prüfe: Datei und DB-Eintrag sollten gelöscht sein

**Via API testen:**

```bash
curl -X POST http://localhost:3000/api/cleanup
```
