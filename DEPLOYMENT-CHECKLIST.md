# Deployment-Checkliste

## Pre-Deployment Checklist

### ✅ Environment Variables

Stelle sicher, dass alle folgenden Variablen in deiner Production-Umgebung gesetzt sind:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

# NextAuth
NEXTAUTH_URL="https://deine-domain.com"
NEXTAUTH_SECRET="mindestens-32-zeichen-langer-sicherer-secret"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE_MB=10

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# Cleanup Worker
CLEANUP_INTERVAL="*/1 * * * *"
CLEANUP_ON_START="false"
CLEANUP_API_KEY="sicherer-api-key-fuer-production"
```

### ✅ Datenbank

- [ ] PostgreSQL Datenbank erstellt
- [ ] `DATABASE_URL` korrekt konfiguriert
- [ ] Migration ausgeführt: `npm run db:migrate` oder `npm run db:push`
- [ ] Prisma Client generiert: `npm run db:generate`

### ✅ Security

- [ ] `NEXTAUTH_SECRET` ist ein sicherer, zufälliger Wert (min. 32 Zeichen)
- [ ] `CLEANUP_API_KEY` gesetzt (falls `/api/cleanup` öffentlich erreichbar)
- [ ] `.env` Datei ist **NICHT** im Git Repository
- [ ] `.gitignore` enthält `.env*`
- [ ] HTTPS aktiviert (für Production)
- [ ] CORS konfiguriert (falls nötig)

### ✅ File Storage

- [ ] Upload-Verzeichnis existiert und ist beschreibbar
- [ ] Für Production: Überlege S3/Cloud Storage statt lokalem Verzeichnis
- [ ] Backup-Strategie für Uploads (optional, da Bilder eh nach 1h gelöscht werden)

### ✅ Cleanup Worker

- [ ] Cleanup Worker konfiguriert (siehe `DEPLOYMENT.md`)
- [ ] Worker läuft regelmäßig (jede Minute empfohlen)
- [ ] Logs werden überwacht

### ✅ Build & Test

- [ ] `npm run build` erfolgreich
- [ ] `npm run lint` ohne kritische Fehler
- [ ] Lokale Tests durchgeführt:
  - [ ] Registrierung funktioniert
  - [ ] Login funktioniert
  - [ ] Upload funktioniert
  - [ ] Feed zeigt Bilder
  - [ ] Cleanup löscht abgelaufene Bilder

---

## Platform-spezifische Checklisten

### Vercel

- [ ] Vercel Account erstellt
- [ ] Projekt mit Git Repository verbunden
- [ ] Environment Variables in Vercel Dashboard gesetzt
- [ ] PostgreSQL Add-on hinzugefügt (z.B. Vercel Postgres oder extern)
- [ ] Build Command: `npm run build` (Standard)
- [ ] Output Directory: `.next` (Standard)
- [ ] Install Command: `npm install` (Standard)
- [ ] Vercel Cron Jobs konfiguriert (für Cleanup, falls Pro Account)
- [ ] Oder: Externer Cron-Service für `/api/cleanup` eingerichtet

**Wichtig für Vercel:**
- Upload-Verzeichnis ist **ephemeral** (wird bei jedem Deploy gelöscht)
- Nutze **S3** oder ähnliches für Production!
- Oder: Nutze Vercel Blob Storage

### Render.com

- [ ] Render Account erstellt
- [ ] Web Service erstellt
- [ ] PostgreSQL Database erstellt
- [ ] Environment Variables gesetzt
- [ ] Build Command: `npm install && npm run db:generate && npm run build`
- [ ] Start Command: `npm start`
- [ ] Cleanup Worker als "Scheduled Job" oder "Background Worker" erstellt
- [ ] Upload-Verzeichnis: Nutze Render's persistent disk oder S3

### Railway.app

- [ ] Railway Account erstellt
- [ ] PostgreSQL Service erstellt
- [ ] Web Service erstellt
- [ ] Environment Variables gesetzt
- [ ] Cleanup Worker als separater Service erstellt
- [ ] Upload-Verzeichnis: Nutze Railway Volumes oder S3

### Fly.io

- [ ] Fly.io Account erstellt
- [ ] `fly.toml` konfiguriert
- [ ] PostgreSQL App erstellt (`fly postgres create`)
- [ ] Web App deployed (`fly deploy`)
- [ ] Cleanup Worker als separate App deployed
- [ ] Upload-Verzeichnis: Nutze Fly Volumes oder S3

### Docker

- [ ] Dockerfile erstellt
- [ ] `docker-compose.yml` konfiguriert
- [ ] PostgreSQL Container läuft
- [ ] Web Container läuft
- [ ] Cleanup Worker Container läuft
- [ ] Volumes für Uploads konfiguriert

---

## Post-Deployment Checklist

Nach dem Deployment:

- [ ] App ist erreichbar unter der Production-URL
- [ ] HTTPS funktioniert (keine Mixed Content Warnings)
- [ ] Registrierung funktioniert
- [ ] Login funktioniert
- [ ] Upload funktioniert
- [ ] Feed zeigt Bilder korrekt an
- [ ] Bilder werden nach 1 Stunde gelöscht (teste mit manuellem Cleanup)
- [ ] Rate Limiting funktioniert (teste mit vielen Requests)
- [ ] Error Pages funktionieren (404, 500, etc.)
- [ ] Logs werden gesammelt und überwacht

---

## Monitoring & Maintenance

### Logs überwachen

- [ ] Application Logs (Errors, Warnings)
- [ ] Cleanup Worker Logs
- [ ] Database Logs (falls verfügbar)

### Alerts einrichten

- [ ] Error Rate > Threshold
- [ ] Cleanup Worker läuft nicht
- [ ] Database Connection Errors
- [ ] Disk Space (falls lokale Uploads)

### Backup-Strategie

- [ ] Database Backups (täglich empfohlen)
- [ ] Environment Variables gesichert (Password Manager)
- [ ] Upload-Verzeichnis Backup (optional, da ephemeral)

---

## Troubleshooting

### Häufige Probleme

**Problem**: Bilder werden nicht angezeigt
- **Lösung**: Prüfe `/uploads/[filename]/route.ts` und Storage-Pfad

**Problem**: Cleanup Worker läuft nicht
- **Lösung**: Prüfe Worker-Logs und Schedule-Konfiguration

**Problem**: Rate Limiting zu strikt
- **Lösung**: Passe `RATE_LIMIT_REQUESTS` und `RATE_LIMIT_WINDOW_MS` an

**Problem**: Database Connection Errors
- **Lösung**: Prüfe `DATABASE_URL` und Firewall-Regeln

**Problem**: Uploads funktionieren nicht
- **Lösung**: Prüfe Upload-Verzeichnis-Berechtigungen und Disk Space

---

## Security Best Practices

- [ ] **Nie** commit `.env` Dateien
- [ ] Nutze starke Secrets (min. 32 Zeichen, zufällig generiert)
- [ ] HTTPS nur (kein HTTP in Production)
- [ ] Rate Limiting aktiviert
- [ ] Input Validation auf Client UND Server
- [ ] SQL Injection Protection (Prisma macht das automatisch)
- [ ] XSS Protection (Next.js macht das automatisch)
- [ ] CSRF Protection (NextAuth macht das automatisch)
- [ ] Secure Cookies (NextAuth konfiguriert das automatisch)

---

## Performance Optimierung

- [ ] Next.js Image Optimization aktiviert
- [ ] Database Indizes vorhanden (`expiresAt`, `ownerId`)
- [ ] Caching konfiguriert (falls nötig)
- [ ] CDN für statische Assets (Vercel macht das automatisch)

---

## Finale Checkliste vor Go-Live

- [ ] Alle Tests bestanden
- [ ] Security-Checkliste abgehakt
- [ ] Monitoring eingerichtet
- [ ] Backup-Strategie implementiert
- [ ] Dokumentation aktualisiert
- [ ] Team informiert über Deployment
- [ ] Rollback-Plan vorhanden

**Viel Erfolg beim Deployment! 🚀**
