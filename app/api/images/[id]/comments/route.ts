import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1).max(500),
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
    const parsed = commentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Kommentar muss zwischen 1 und 500 Zeichen lang sein" },
        { status: 400 },
      );
    }

    const { content } = parsed.data;

    // Kommentar erstellen
    const comment = await prisma.comment.create({
      data: {
        userId,
        imageId,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            profileImageUrl: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        comment: {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
          user: {
            id: comment.user.id,
            email: comment.user.email,
            name: comment.user.name,
            profileImageUrl: comment.user.profileImageUrl,
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[COMMENT]", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unbekannter Fehler";
    return NextResponse.json(
      {
        error: "Fehler beim Erstellen des Kommentars",
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

    const comments = await prisma.comment.findMany({
      where: {
        imageId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      comments: comments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        user: {
          id: c.user.id,
          email: c.user.email,
          name: c.user.name,
          profileImageUrl: c.user.profileImageUrl,
        },
      })),
    });
  } catch (error) {
    console.error("[COMMENT_GET]", error);
    return NextResponse.json(
      { error: "Fehler beim Abrufen der Kommentare" },
      { status: 500 },
    );
  }
}
