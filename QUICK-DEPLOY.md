# ⚡ Quick Start: Kostenlos deployen in 10 Minuten

## 🎯 Empfohlener Weg: Render.com (Alles in einem)

### Schritt 1: Code zu GitHub (2 Min)

```bash
cd C:\Users\andreas\Desktop\hh

# Falls noch nicht geschehen:
git init
git add .
git commit -m "Ready for deployment"

# GitHub Repo erstellen: https://github.com/new
# Dann:
git remote add origin https://github.com/DEIN_USERNAME/image-temp-app.git
git branch -M main
git push -u origin main
```

### Schritt 2: Render Setup (5 Min)

1. **Gehe zu**: https://render.com → Sign Up (mit GitHub)

2. **PostgreSQL erstellen**:
   - "New +" → "PostgreSQL"
   - Name: `image-temp-db`
   - Plan: **Free**
   - Create
   - **Kopiere "Internal Database URL"**

3. **Web Service erstellen**:
   - "New +" → "Web Service"
   - Connect dein GitHub Repo
   - Name: `image-temp-app`
   - Plan: **Free**
   - Build Command: `npm install && npm run db:generate && npm run build`
   - Start Command: `npm start`

4. **Environment Variables** (im Web Service):
   ```
   DATABASE_URL=<Internal Database URL von oben>
   NEXTAUTH_URL=https://image-temp-app.onrender.com
   NEXTAUTH_SECRET=<Generiere neuen Secret: openssl rand -base64 32>
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE_MB=10
   CLEANUP_INTERVAL=*/1 * * * *
   CLEANUP_ON_START=false
   ```

5. **Create Web Service**

### Schritt 3: Datenbank-Migration (2 Min)

**Im Render Dashboard:**
- Klicke auf deinen Web Service
- Gehe zu "Shell" Tab
- Führe aus:
  ```bash
  npm run db:push
  ```

### Schritt 4: Cleanup Worker (1 Min)

1. **"New +"** → **"Scheduled Job"**
2. Name: `image-cleanup`
3. Command: `npm run cleanup`
4. Schedule: `*/1 * * * *`
5. Environment: Gleiche wie Web Service
6. **Create Scheduled Job**

### ✅ Fertig!

Deine App läuft jetzt auf: `https://image-temp-app.onrender.com`

---

## 🔧 Alternative: Vercel + Neon (Schneller, aber mehr Setup)

### Schritt 1: Neon PostgreSQL (2 Min)

1. https://neon.tech → Sign Up
2. Neues Projekt erstellen
3. **Kopiere Connection String**

### Schritt 2: Vercel (3 Min)

1. https://vercel.com → Sign Up (mit GitHub)
2. "Import Project" → Wähle dein Repo
3. **Environment Variables**:
   ```
   DATABASE_URL=<Neon Connection String>
   NEXTAUTH_URL=https://deine-app.vercel.app
   NEXTAUTH_SECRET=<Neuer Secret>
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE_MB=10
   CLEANUP_API_KEY=<Ein sicherer Key>
   ```
4. **Deploy**

### Schritt 3: Migration (1 Min)

**Lokal:**
```bash
# Setze DATABASE_URL in .env auf Neon URL
npm run db:push
```

### Schritt 4: Cleanup Cron (2 Min)

1. https://cron-job.org → Sign Up
2. Neuer Cron-Job:
   - URL: `https://deine-app.vercel.app/api/cleanup`
   - Method: POST
   - Header: `Authorization: Bearer DEIN_CLEANUP_API_KEY`
   - Schedule: `*/1 * * * *`

---

## ⚠️ Wichtige Hinweise

### Upload-Problem

**Render/Vercel löschen Uploads bei jedem Deploy!**

**Für Testing**: Funktioniert erstmal, aber Uploads verschwinden.

**Für Production**: Nutze S3/Cloud Storage (siehe `DEPLOYMENT-FREE.md`)

### Kostenlose Limits

- **Render**: 90 Tage kostenlos PostgreSQL, dann $7/Monat
- **Vercel**: Kostenlos, aber externer Cron nötig
- **Neon**: Kostenlos bis 0.5 GB

---

## 🎯 Welche Option wählen?

**Render.com** wenn du:
- ✅ Alles in einem haben willst
- ✅ Einfaches Setup bevorzugst
- ✅ Scheduled Jobs brauchst

**Vercel + Neon** wenn du:
- ✅ Beste Performance willst
- ✅ Mehr Kontrolle brauchst
- ✅ Bereit bist für etwas mehr Setup

---

**Viel Erfolg! 🚀**
