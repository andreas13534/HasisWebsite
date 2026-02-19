# ⚠️ WICHTIG: Datenbank-Migration erforderlich

Wenn du die Fehlermeldung "Fehler beim Liken/Disliken" oder "Fehler beim Erstellen des Kommentars" siehst, liegt das wahrscheinlich daran, dass die neuen Datenbank-Tabellen noch nicht existieren.

## Lösung

Führe diese Befehle in deinem Terminal aus:

```bash
cd c:\Users\andreas\Desktop\hh

# 1. Prisma Client neu generieren (mit neuen Models)
npm run db:generate

# 2. Schema zur Datenbank pushen (erstellt neue Tabellen)
npm run db:push
```

Nach diesen Befehlen sollten die Tabellen `likes` und `comments` in deiner Datenbank existieren.

## Prüfen ob es funktioniert hat

Nach `npm run db:push` solltest du sehen:
```
✔ Generated Prisma Client
✔ Pushed to database
```

## Falls es immer noch nicht funktioniert

1. **Prüfe die Browser-Konsole** (F12 → Console) für detaillierte Fehlermeldungen
2. **Prüfe die Server-Logs** im Terminal wo `npm run dev` läuft
3. **Stelle sicher**, dass die Datenbank läuft und `DATABASE_URL` in `.env` korrekt ist

## Häufige Fehler

### "Table 'likes' does not exist"
→ Führe `npm run db:push` aus

### "Cannot find module '@prisma/client'"
→ Führe `npm install` aus

### "Connection refused"
→ Prüfe ob PostgreSQL läuft und `DATABASE_URL` korrekt ist
