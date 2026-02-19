// Einfaches In-Memory Rate Limiting
// Für Production: Nutze Redis oder einen dedizierten Rate-Limiting-Service

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const DEFAULT_WINDOW_MS = parseInt(
  process.env.RATE_LIMIT_WINDOW_MS || "60000",
  10,
); // 1 Minute
const DEFAULT_MAX_REQUESTS = parseInt(
  process.env.RATE_LIMIT_REQUESTS || "10",
  10,
);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  identifier: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
  windowMs: number = DEFAULT_WINDOW_MS,
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  // Cleanup alte Einträge (alle 5 Minuten)
  if (Math.random() < 0.01) {
    // 1% Chance bei jedem Request
    cleanupOldEntries();
  }

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    // Neuer Eintrag oder abgelaufen
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, newEntry);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // Eintrag existiert und ist noch gültig
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Erhöhe Counter
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Helper: IP aus Request extrahieren
export function getClientIdentifier(req: Request): string {
  // Versuche verschiedene Header (für Proxies/Load Balancer)
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback: Nutze User-Agent + andere Header als Identifier
  // (weniger zuverlässig, aber besser als nichts)
  const ua = req.headers.get("user-agent") || "unknown";
  return ua.substring(0, 50);
}
