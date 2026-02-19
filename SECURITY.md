# Security Checklist

## ✅ Implementierte Security-Features

### Authentication & Authorization

- ✅ **Password Hashing**: bcryptjs mit Cost-Faktor 12
- ✅ **Session Management**: NextAuth.js mit JWT
- ✅ **Protected Routes**: Server-side Session-Check
- ✅ **Secure Cookies**: NextAuth konfiguriert automatisch
- ✅ **CSRF Protection**: NextAuth schützt automatisch

### Input Validation

- ✅ **Client-side**: Zod Schema Validation
- ✅ **Server-side**: Zod Schema Validation (immer!)
- ✅ **File Upload**: MIME-Type Check (nur Bilder)
- ✅ **File Upload**: Größenlimit (10 MB)
- ✅ **Email Validation**: Zod Email Schema
- ✅ **Password Requirements**: Min. 8 Zeichen

### Rate Limiting

- ✅ **Register**: Max 5 Versuche pro Stunde pro IP
- ✅ **Upload**: Max 20 Uploads pro Stunde pro IP
- ✅ **In-Memory Store**: Für Development (Production: Redis empfohlen)

### File Upload Security

- ✅ **MIME-Type Validation**: Nur erlaubte Bildformate
- ✅ **Size Limits**: Max 10 MB (konfigurierbar)
- ✅ **Secure Filenames**: Eindeutige Hex-IDs (kein User-Input)
- ✅ **Path Traversal Protection**: `join()` verhindert `../` Angriffe
- ✅ **Storage Isolation**: Uploads in separatem Verzeichnis

### Database Security

- ✅ **SQL Injection Protection**: Prisma ORM (automatisch)
- ✅ **Parameterized Queries**: Prisma macht das automatisch
- ✅ **Connection String Security**: Keine Credentials im Code

### API Security

- ✅ **Session-Check**: Alle geschützten Endpoints prüfen Session
- ✅ **Error Messages**: Keine sensiblen Daten in Fehlermeldungen
- ✅ **CORS**: Next.js konfiguriert automatisch (falls nötig)

### Cleanup & Data Retention

- ✅ **Automatic Deletion**: Bilder nach exakt 1 Stunde gelöscht
- ✅ **File + DB Cleanup**: Beides wird gelöscht
- ✅ **Expired Image Serving**: Abgelaufene Bilder werden nicht serviert

---

## ⚠️ Production Considerations

### Rate Limiting

**Aktuell**: In-Memory Store (funktioniert nur auf einem Server)

**Für Production empfohlen**:
- Redis für verteiltes Rate Limiting
- Oder: Nutze einen Reverse Proxy (nginx, Cloudflare)

**Migration zu Redis**:
```typescript
// lib/rate-limit-redis.ts (Beispiel)
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function rateLimitRedis(
  identifier: string,
  maxRequests: number,
  windowMs: number
) {
  const key = `rate_limit:${identifier}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.pexpire(key, windowMs);
  }
  
  return {
    allowed: count <= maxRequests,
    remaining: Math.max(0, maxRequests - count),
  };
}
```

### File Storage

**Aktuell**: Lokales Verzeichnis

**Für Production empfohlen**:
- **S3** (AWS, DigitalOcean Spaces, etc.)
- **Vercel Blob Storage** (falls auf Vercel)
- **Cloudflare R2**

**Migration zu S3** (Beispiel):
```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function saveToS3(file: File, key: string) {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
  }));
}

export async function deleteFromS3(key: string) {
  await s3.send(new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  }));
}
```

### Environment Variables

**Nie commit**:
- `.env`
- `.env.local`
- `.env.production`

**Immer commit**:
- `.env.example` (ohne echte Werte)

**Production Secrets**:
- Nutze die Secrets-Verwaltung deiner Platform (Vercel, Render, etc.)
- Oder: Nutze einen Password Manager für Team-Sharing

### HTTPS

**Development**: HTTP ist OK (`localhost`)

**Production**: **IMMER HTTPS**
- Vercel: Automatisch
- Render: Automatisch
- Railway: Automatisch
- Fly.io: Automatisch
- Self-hosted: Nutze Let's Encrypt

### Database

**Connection Security**:
- Nutze SSL/TLS für Database-Verbindungen
- Prisma unterstützt `?sslmode=require` in `DATABASE_URL`

**Backup**:
- Tägliche Backups empfohlen
- Automatische Backups (Platform-Feature nutzen)

### Monitoring & Logging

**Was loggen**:
- ✅ Errors (mit Stack Traces)
- ✅ Rate Limit Violations
- ✅ Failed Login Attempts
- ✅ Cleanup Stats

**Was NICHT loggen**:
- ❌ Passwörter
- ❌ Session Tokens
- ❌ API Keys
- ❌ Sensible User-Daten

### Cleanup API Security

**Aktuell**: `/api/cleanup` ist öffentlich (mit optionalem API-Key)

**Empfohlen**:
- Nutze API-Key in Production (`CLEANUP_API_KEY`)
- Oder: Mache die Route nur intern erreichbar (nicht öffentlich)
- Oder: Nutze Platform-spezifische Cron-Jobs (keine HTTP-Route nötig)

---

## 🔒 Security Headers

Next.js setzt bereits viele Security Headers automatisch. Für zusätzliche kannst du `next.config.js` erweitern:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

---

## 🧪 Security Testing

### Manuelle Tests

1. **SQL Injection**: Versuche `' OR '1'='1` in Formularen
   - ✅ Sollte durch Prisma blockiert werden

2. **XSS**: Versuche `<script>alert('XSS')</script>` in Inputs
   - ✅ Sollte durch React/Next.js escaped werden

3. **File Upload**: Versuche `.exe` oder `.php` Dateien hochzuladen
   - ✅ Sollte durch MIME-Type Check blockiert werden

4. **Rate Limiting**: Mache viele Requests schnell hintereinander
   - ✅ Sollte nach Limit blockieren

5. **Session Hijacking**: Versuche ohne Session auf geschützte Routes zuzugreifen
   - ✅ Sollte redirecten zu `/login`

### Automatisierte Tests (Optional)

Nutze Tools wie:
- **OWASP ZAP**: Für Web-App Security Scanning
- **Snyk**: Für Dependency Vulnerabilities
- **npm audit**: Für bekannte Vulnerabilities in Dependencies

```bash
npm audit
npm audit fix
```

---

## 📋 Security Checklist vor Production

- [ ] Alle Environment Variables gesetzt und sicher gespeichert
- [ ] HTTPS aktiviert
- [ ] Rate Limiting konfiguriert
- [ ] File Upload Limits gesetzt
- [ ] Database Backups eingerichtet
- [ ] Logging konfiguriert (ohne sensible Daten)
- [ ] Monitoring eingerichtet
- [ ] Security Headers konfiguriert (falls nötig)
- [ ] Dependencies aktualisiert (`npm audit`)
- [ ] Cleanup Worker läuft und funktioniert
- [ ] Error Messages enthalten keine sensiblen Daten

---

## 🚨 Incident Response

Bei einem Security-Incident:

1. **Sofort**: Betroffene Services isolieren/deaktivieren
2. **Analysieren**: Logs prüfen, Angriffsvektor identifizieren
3. **Patchen**: Vulnerability beheben
4. **Kommunizieren**: Betroffene User informieren (falls nötig)
5. **Dokumentieren**: Incident dokumentieren für zukünftige Prävention

---

**Wichtig**: Security ist ein kontinuierlicher Prozess. Regelmäßige Reviews und Updates sind essentiell!
