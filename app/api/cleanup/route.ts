import { NextResponse } from "next/server";
import { cleanupExpiredImages } from "@/scripts/cleanup";

// Optional: API Route für manuelles Auslösen des Cleanups
// NUR FÜR DEVELOPMENT/TESTING - In Production sollte das deaktiviert werden!

export async function POST(req: Request) {
  // Security: Nur in Development erlauben (optional)
  if (process.env.NODE_ENV === "production") {
    // Optional: API Key Check für Production
    const authHeader = req.headers.get("authorization");
    const apiKey = process.env.CLEANUP_API_KEY;
    if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 },
      );
    }
  }

  try {
    console.log("[CLEANUP_API] Manueller Cleanup ausgelöst");
    const stats = await cleanupExpiredImages();

    return NextResponse.json({
      success: true,
      stats: {
        found: stats.found,
        deleted: stats.deleted,
        errors: stats.errors,
        durationMs: stats.durationMs,
      },
    });
  } catch (error) {
    console.error("[CLEANUP_API] Fehler:", error);
    return NextResponse.json(
      { error: "Cleanup fehlgeschlagen" },
      { status: 500 },
    );
  }
}
