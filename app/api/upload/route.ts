import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateImageFile, saveUploadedFile } from "@/lib/upload";
import {
  createRateLimitMiddleware,
  rateLimitResponse,
} from "@/lib/rate-limit-middleware";

// Rate Limiting: Max 20 Uploads pro Stunde pro IP
const uploadRateLimit = createRateLimitMiddleware(20, 60 * 60 * 1000);

export async function POST(req: Request) {
  // Rate Limiting Check
  const rateLimitResult = uploadRateLimit(req);
  if (rateLimitResult) {
    return rateLimitResponse(rateLimitResult);
  }

  try {
    // Session-Check
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Keine Datei hochgeladen" },
        { status: 400 },
      );
    }

    // Validierung
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 },
      );
    }

    // Datei speichern
    const { filename, storageKey } = await saveUploadedFile(file, session.user.id);

    // expiresAt = createdAt + 1 Stunde
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 60 * 60 * 1000); // +1h

    // DB Record erstellen
    const image = await prisma.image.create({
      data: {
        ownerId: session.user.id as string,
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        storageKey,
        expiresAt,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        image: {
          id: image.id,
          filename: image.filename,
          originalName: image.originalName,
          createdAt: image.createdAt.toISOString(),
          expiresAt: image.expiresAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[UPLOAD]", error);
    return NextResponse.json(
      { error: "Upload fehlgeschlagen" },
      { status: 500 },
    );
  }
}
