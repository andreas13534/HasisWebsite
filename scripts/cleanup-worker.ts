import cron from "node-cron";
import { cleanupExpiredImages } from "./cleanup";

const CLEANUP_INTERVAL = process.env.CLEANUP_INTERVAL || "*/1 * * * *"; // Standard: jede Minute

console.log(
  `[CLEANUP_WORKER] Starte Cleanup-Worker mit Intervall: ${CLEANUP_INTERVAL}`,
);
console.log(
  `[CLEANUP_WORKER] Umgebungsvariablen: UPLOAD_DIR=${process.env.UPLOAD_DIR || "./uploads"}`,
);

// Cleanup-Job planen
cron.schedule(CLEANUP_INTERVAL, async () => {
  console.log(`[CLEANUP_WORKER] ${new Date().toISOString()} - Starte Cleanup...`);
  await cleanupExpiredImages();
});

// Sofort beim Start einmal ausführen (optional)
if (process.env.CLEANUP_ON_START === "true") {
  console.log("[CLEANUP_WORKER] Führe sofortigen Cleanup beim Start aus...");
  cleanupExpiredImages().catch((error) => {
    console.error("[CLEANUP_WORKER] Fehler beim Start-Cleanup:", error);
  });
}

console.log("[CLEANUP_WORKER] Worker läuft. Drücke Ctrl+C zum Beenden.");

// Graceful Shutdown
process.on("SIGINT", () => {
  console.log("\n[CLEANUP_WORKER] Beende Worker...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n[CLEANUP_WORKER] Beende Worker...");
  process.exit(0);
});
