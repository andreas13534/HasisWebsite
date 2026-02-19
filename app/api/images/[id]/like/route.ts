import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const likeSchema = z.object({
  type: z.enum(["like", "dislike"]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 },
      );
    }

    const resolvedParams = await Promise.resolve(params);
    const imageId = resolvedParams.id;
    const userId = session.user.id as string;

    // Prüfe ob Bild existiert und nicht abgelaufen ist
    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return NextResponse.json(
        { error: "Bild nicht gefunden" },
        { status: 404 },
      );
    }

    const now = new Date();
    if (image.expiresAt <= now) {
      return NextResponse.json(
        { error: "Bild ist bereits abgelaufen" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const parsed = likeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabe" },
        { status: 400 },
      );
    }

    const { type } = parsed.data;

    // Prüfe ob User bereits ein Like/Dislike für dieses Bild hat
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_imageId: {
          userId,
          imageId,
        },
      },
    });

    if (existingLike) {
      if (existingLike.type === type) {
        // Gleicher Typ: Entferne Like/Dislike
        await prisma.like.delete({
          where: { id: existingLike.id },
        });
        return NextResponse.json({
          success: true,
          action: "removed",
          type: null,
        });
      } else {
        // Anderer Typ: Update
        const updated = await prisma.like.update({
          where: { id: existingLike.id },
          data: { type },
        });
        return NextResponse.json({
          success: true,
          action: "updated",
          type: updated.type,
        });
      }
    } else {
      // Neues Like/Dislike erstellen
      await prisma.like.create({
        data: {
          userId,
          imageId,
          type,
        },
      });
      return NextResponse.json({
        success: true,
        action: "created",
        type,
      });
    }
  } catch (error) {
    console.error("[LIKE]", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unbekannter Fehler";
    return NextResponse.json(
      {
        error: "Fehler beim Liken/Disliken",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const imageId = resolvedParams.id;

    // Zähle Likes und Dislikes
    const [likes, dislikes] = await Promise.all([
      prisma.like.count({
        where: {
          imageId,
          type: "like",
        },
      }),
      prisma.like.count({
        where: {
          imageId,
          type: "dislike",
        },
      }),
    ]);

    // Prüfe ob User eingeloggt ist und bereits geliked hat
    const session = await getAuthSession();
    let userLike: { type: string } | null = null;

    if (session?.user?.id) {
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_imageId: {
            userId: session.user.id as string,
            imageId,
          },
        },
        select: {
          type: true,
        },
      });
      if (existingLike) {
        userLike = existingLike;
      }
    }

    return NextResponse.json({
      likes,
      dislikes,
      userLike: userLike?.type || null,
    });
  } catch (error) {
    console.error("[LIKE_GET]", error);
    return NextResponse.json(
      { error: "Fehler beim Abrufen der Likes" },
      { status: 500 },
    );
  }
}
