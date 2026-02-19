import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } },
) {
  try {
    const filename = params.filename;

    // Sicherheitscheck: Nur nicht-abgelaufene Bilder servieren
    const now = new Date();
    const image = await prisma.image.findFirst({
      where: {
        filename,
        expiresAt: {
          gt: now,
        },
      },
    });

    if (!image) {
      return new NextResponse("Bild nicht gefunden oder abgelaufen", {
        status: 404,
      });
    }

    // Datei lesen
    const uploadDir = process.env.UPLOAD_DIR || "./uploads";
    const filePath = join(process.cwd(), uploadDir, filename);

    try {
      const fileBuffer = await readFile(filePath);

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": image.mimeType,
          "Content-Length": image.size.toString(),
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch (fileError) {
      console.error("[IMAGE_SERVE]", fileError);
      return new NextResponse("Datei nicht gefunden", { status: 404 });
    }
  } catch (error) {
    console.error("[IMAGE_SERVE]", error);
    return new NextResponse("Interner Fehler", { status: 500 });
  }
}
