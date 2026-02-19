import { NextResponse } from "next/server";
import { rateLimit, getClientIdentifier, RateLimitResult } from "./rate-limit";

export function createRateLimitMiddleware(
  maxRequests: number,
  windowMs: number = 60000,
) {
  return (req: Request): RateLimitResult | null => {
    const identifier = getClientIdentifier(req);
    const result = rateLimit(identifier, maxRequests, windowMs);

    if (!result.allowed) {
      return result;
    }

    return null; // Erlaubt
  };
}

export function rateLimitResponse(result: RateLimitResult): NextResponse {
  const resetSeconds = Math.ceil((result.resetAt - Date.now()) / 1000);

  return NextResponse.json(
    {
      error: "Zu viele Anfragen. Bitte versuche es später erneut.",
      retryAfter: resetSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": resetSeconds.toString(),
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
      },
    },
  );
}
