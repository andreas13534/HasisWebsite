# 🚀 Kostenloses Hosting - Schritt für Schritt

## Übersicht der kostenlosen Optionen

### Option 1: Vercel (Empfohlen für Next.js) ⭐
- **Next.js**: Perfekt optimiert
- **PostgreSQL**: Extern (Neon/Supabase)
- **Kostenlos**: Ja (mit Limits)
- **Einfachheit**: ⭐⭐⭐⭐⭐

### Option 2: Render.com
- **Next.js**: Gut unterstützt
- **PostgreSQL**: Integriert (kostenlos)
- **Kostenlos**: Ja (mit Limits)
- **Einfachheit**: ⭐⭐⭐⭐

### Option 3: Railway.app
- **Next.js**: Gut unterstützt
- **PostgreSQL**: Integriert (kostenlos)
- **Kostenlos**: Ja ($5 Credit/Monat)
- **Einfachheit**: ⭐⭐⭐⭐

---

## 🎯 Option 1: Vercel + Neon (Empfohlen)

### Schritt 1: PostgreSQL Datenbank einrichten (Neon)

1. **Gehe zu**: https://neon.tech
2. **Erstelle kostenlosen Account** (mit GitHub/Email)
3. **Erstelle neues Projekt**:
   - Name: `image-temp-app`
   - Region: Wähle die nächstgelegene (z.B. `Frankfurt`)
   - PostgreSQL Version: 15 oder 16
4. **Kopiere die Connection String**:
   - Im Dashboard → "Connection Details"
   - Kopiere den "Connection string" (beginnt mit `postgresql://...`)
   - **Wichtig**: Ersetze `[YOUR-PASSWORD]` mit deinem Passwort!

### Schritt 2: Datenbank-Migration

**Lokal ausführen:**

```bash
cd C:\Users\andreas\Desktop\hh

# .env Datei öffnen und DATABASE_URL setzen:
# DATABASE_URL="postgresql://neondb_owner:DEIN_PASSWORT@ep-xxx-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Migration ausführen
npm run db:push
```

### Schritt 3: Vercel Account erstellen

1. **Gehe zu**: https://vercel.com
2. **Sign Up** mit GitHub (empfohlen) oder Email
3. **Import Project** klicken

### Schritt 4: Projekt zu GitHub pushen

**Falls noch nicht geschehen:**

```bash
cd C:\Users\andreas\Desktop\hh

# Git initialisieren (falls noch nicht)
git init

# .gitignore sollte bereits existieren (prüfe ob .env drin ist!)

# Alles committen
git add .
git commit -m "Initial commit"

# GitHub Repository erstellen:
# 1. Gehe zu https://github.com/new
# 2. Erstelle neues Repository (z.B. "image-temp-app")
# 3. Kopiere die URL

# Remote hinzufügen und pushen
git remote add origin https://github.com/DEIN_USERNAME/image-temp-app.git
git branch -M main
git push -u origin main
```

### Schritt 5: Vercel Deployment

1. **In Vercel Dashboard**:
   - Klicke "Add New" → "Project"
   - Wähle dein GitHub Repository
   - Klicke "Import"

2. **Konfiguration**:
   - **Framework Preset**: Next.js (automatisch erkannt)
   - **Root Directory**: `./` (Standard)
   - **Build Command**: `npm run build` (Standard)
   - **Output Directory**: `.next` (Standard)
   - **Install Command**: `npm install` (Standard)

3. **Environment Variables** hinzufügen:
   ```
   DATABASE_URL=postgresql://neondb_owner:PASSWORT@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   NEXTAUTH_URL=https://deine-app.vercel.app
   NEXTAUTH_SECRET=dein-sicherer-secret-min-32-zeichen
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE_MB=10
   CLEANUP_INTERVAL=*/1 * * * *
   CLEANUP_API_KEY=ein-sicherer-api-key
   ```

   **Wichtig**: 
   - `NEXTAUTH_URL` wird nach dem ersten Deploy automatisch gesetzt (kannst du dann anpassen)
   - `NEXTAUTH_SECRET`: Generiere einen neuen Secret (nicht den lokalen verwenden!)
   - `CLEANUP_API_KEY`: Für den Cleanup-Worker

4. **Deploy** klicken

### Schritt 6: Cleanup Worker einrichten

**Option A: Vercel Cron Jobs (Vercel Pro - nicht kostenlos)**

**Option B: Externer Cron-Service (Kostenlos)**

1. **Gehe zu**: https://cron-job.org (kostenlos)
2. **Erstelle Account**
3. **Neuen Cron-Job erstellen**:
   - **Title**: Image Cleanup
   - **Address**: `https://deine-app.vercel.app/api/cleanup`
   - **Schedule**: Jede Minute (`*/1 * * * *`)
   - **Request Method**: POST
   - **Request Headers**: 
     ```
     Authorization: Bearer DEIN_CLEANUP_API_KEY
     ```

**Oder nutze EasyCron**: https://www.easycron.com (auch kostenlos)

---

## 🎯 Option 2: Render.com (Alles in einem)

### Schritt 1: Render Account erstellen

1. **Gehe zu**: https://render.com
2. **Sign Up** mit GitHub

### Schritt 2: PostgreSQL Datenbank erstellen

1. **Dashboard** → "New +" → "PostgreSQL"
2. **Konfiguration**:
   - **Name**: `image-temp-db`
   - **Database**: `image_temp_db`
   - **User**: `image_user`
   - **Region**: Wähle die nächstgelegene
   - **Plan**: Free
3. **Create Database**
4. **Kopiere "Internal Database URL"** (für später)

### Schritt 3: Web Service erstellen

1. **Dashboard** → "New +" → "Web Service"
2. **Connect Repository**: Wähle dein GitHub Repo
3. **Konfiguration**:
   - **Name**: `image-temp-app`
   - **Region**: Gleiche wie Datenbank
   - **Branch**: `main`
   - **Root Directory**: `./`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run db:generate && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Environment Variables**:
   ```
   DATABASE_URL=<Internal Database URL von Schritt 2>
   NEXTAUTH_URL=https://image-temp-app.onrender.com
   NEXTAUTH_SECRET=dein-sicherer-secret-min-32-zeichen
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE_MB=10
   CLEANUP_INTERVAL=*/1 * * * *
   CLEANUP_ON_START=false
   ```

5. **Create Web Service**

### Schritt 4: Cleanup Worker (Scheduled Job)

1. **Dashboard** → "New +" → "Scheduled Job"
2. **Konfiguration**:
   - **Name**: `image-cleanup-worker`
   - **Command**: `npm run cleanup`
   - **Schedule**: `*/1 * * * *` (jede Minute)
   - **Environment**: Gleiche wie Web Service
   - **Plan**: Free

3. **Create Scheduled Job**

### Schritt 5: Migration ausführen

**Via Render Shell** (im Web Service Dashboard):
- Klicke "Shell" Tab
- Führe aus:
  ```bash
  npm run db:push
  ```

**Oder lokal** (mit Render's External Database URL):
- Kopiere "External Database URL" aus PostgreSQL Dashboard
- Setze lokal in `.env`: `DATABASE_URL=<External URL>`
- Führe aus: `npm run db:push`

---

## 🎯 Option 3: Railway.app

### Schritt 1: Railway Account erstellen

1. **Gehe zu**: https://railway.app
2. **Sign Up** mit GitHub

### Schritt 2: Neues Projekt erstellen

1. **"New Project"** klicken
2. **"Deploy from GitHub repo"** wählen
3. **Wähle dein Repository**

### Schritt 3: PostgreSQL hinzufügen

1. **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. **Kopiere die DATABASE_URL** (wird automatisch als Environment Variable gesetzt)

### Schritt 4: Web Service konfigurieren

1. **Klicke auf deinen Service**
2. **Settings** → **Variables**:
   ```
   NEXTAUTH_URL=https://deine-app.up.railway.app
   NEXTAUTH_SECRET=dein-sicherer-secret-min-32-zeichen
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE_MB=10
   CLEANUP_INTERVAL=*/1 * * * *
   CLEANUP_ON_START=false
   ```

3. **Settings** → **Deploy**:
   - **Build Command**: `npm install && npm run db:generate && npm run build`
   - **Start Command**: `npm start`

### Schritt 5: Cleanup Worker

1. **"+ New"** → **"Empty Service"**
2. **Settings** → **Generate Domain** (optional)
3. **Settings** → **Variables**: Gleiche wie Web Service
4. **Settings** → **Deploy**:
   - **Start Command**: `npm run cleanup:worker`

**Oder nutze Railway Cron** (falls verfügbar):
- Erstelle `railway.json`:
  ```json
  {
    "cron": [
      {
        "command": "npm run cleanup",
        "schedule": "*/1 * * * *"
      }
    ]
  }
  ```

---

## ⚠️ Wichtige Hinweise

### Upload-Verzeichnis Problem

**Vercel/Render/Railway haben ephemeral Storage** - Uploads werden bei jedem Deploy gelöscht!

**Lösungen:**

1. **S3/Cloud Storage nutzen** (nicht kostenlos, aber günstig):
   - AWS S3 (kostenlos für 5 GB im ersten Jahr)
   - DigitalOcean Spaces ($5/Monat)
   - Cloudflare R2 (kostenlos bis 10 GB)

2. **Für Testing**: Lokale Uploads funktionieren, werden aber bei Deploy gelöscht

### Kostenlose Limits

**Vercel Free:**
- 100 GB Bandwidth/Monat
- Unbegrenzte Requests
- Serverless Functions: 100 GB-Hours/Monat

**Render Free:**
- Web Service: Spindown nach 15 Min Inaktivität
- PostgreSQL: 90 Tage kostenlos, dann $7/Monat
- 750 Stunden/Monat

**Railway Free:**
- $5 Credit/Monat
- Danach Pay-as-you-go

---

## 🎯 Empfehlung für den Start

**Für den einfachsten Start: Render.com**

- Alles in einem (DB + Web Service)
- Einfaches Setup
- 90 Tage kostenlos PostgreSQL
- Scheduled Jobs für Cleanup

**Für beste Performance: Vercel + Neon**

- Schnellste Next.js Performance
- Kostenlos PostgreSQL (Neon)
- Aber: Externer Cron nötig für Cleanup

---

## 📋 Pre-Deployment Checklist

- [ ] Code zu GitHub gepusht
- [ ] `.env` ist NICHT im Git (prüfe `.gitignore`)
- [ ] `NEXTAUTH_SECRET` neu generiert (nicht den lokalen verwenden!)
- [ ] `DATABASE_URL` für Production vorbereitet
- [ ] Cleanup Worker geplant (Cron oder Scheduled Job)
- [ ] Upload-Storage geplant (S3 oder lokal für Testing)

---

## 🚀 Nach dem Deployment

1. **Teste die App**: Öffne die Production-URL
2. **Registriere einen Test-Account**
3. **Lade ein Bild hoch**
4. **Teste Likes/Kommentare**
5. **Prüfe ob Cleanup läuft** (nach 1 Stunde sollte Bild gelöscht sein)

---

**Viel Erfolg beim Deployment! 🎉**
