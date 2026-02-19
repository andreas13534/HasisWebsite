import { prisma } from "../lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";

interface CleanupStats {
  found: number;
  deleted: number;
  errors: number;
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
}

export async function cleanupExpiredImages(): Promise<CleanupStats> {
  const stats: CleanupStats = {
    found: 0,
    deleted: 0,
    errors: 0,
    startTime: new Date(),
  };

  try {
    const now = new Date();
    const uploadDir = process.env.UPLOAD_DIR || "./uploads";

    // Finde alle abgelaufenen Bilder (expiresAt <= now)
    const expiredImages = await prisma.image.findMany({
      where: {
        expiresAt: {
          lte: now, // expiresAt <= now
        },
      },
      select: {
        id: true,
        filename: true,
        storageKey: true,
        expiresAt: true,
      },
    });

    stats.found = expiredImages.length;

    if (expiredImages.length === 0) {
      stats.endTime = new Date();
      stats.durationMs = stats.endTime.getTime() - stats.startTime.getTime();
      console.log(
        `[CLEANUP] ${new Date().toISOString()} - Keine abgelaufenen Bilder gefunden`,
      );
      return stats;
    }

    console.log(
      `[CLEANUP] ${new Date().toISOString()} - Gefunden: ${expiredImages.length} abgelaufene Bilder`,
    );

    // Lösche jede Datei und DB-Row
    for (const image of expiredImages) {
      try {
        // 1. Datei löschen
        const filePath = join(process.cwd(), image.storageKey);
        try {
          await unlink(filePath);
          console.log(`[CLEANUP] Datei gelöscht: ${image.filename}`);
        } catch (fileError: unknown) {
          // Datei existiert nicht mehr oder kann nicht gelöscht werden
          const error = fileError as { code?: string };
          if (error.code !== "ENOENT") {
            // ENOENT = Datei existiert nicht, das ist OK
            console.error(
              `[CLEANUP] Fehler beim Löschen der Datei ${image.filename}:`,
              fileError,
            );
          }
        }

        // 2. DB-Row löschen
        await prisma.image.delete({
          where: { id: image.id },
        });

        stats.deleted++;
        console.log(
          `[CLEANUP] DB-Eintrag gelöscht: ${image.id} (${image.filename})`,
        );
      } catch (error) {
        stats.errors++;
        console.error(
          `[CLEANUP] Fehler beim Löschen von Bild ${image.id}:`,
          error,
        );
      }
    }

    stats.endTime = new Date();
    stats.durationMs = stats.endTime.getTime() - stats.startTime.getTime();

    console.log(
      `[CLEANUP] ${stats.endTime.toISOString()} - Abgeschlossen: ${stats.deleted}/${stats.found} gelöscht, ${stats.errors} Fehler (${stats.durationMs}ms)`,
    );

    return stats;
  } catch (error) {
    stats.errors++;
    stats.endTime = new Date();
    stats.durationMs = stats.endTime.getTime() - stats.startTime.getTime();
    console.error(`[CLEANUP] Kritischer Fehler:`, error);
    return stats;
  }
}

// Wenn direkt ausgeführt (nicht importiert)
if (require.main === module) {
  cleanupExpiredImages()
    .then((stats) => {
      process.exit(stats.errors > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error("[CLEANUP] Unerwarteter Fehler:", error);
      process.exit(1);
    });
}
