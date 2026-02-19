import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateImageFile, saveUploadedFile } from "@/lib/upload";

export async function POST(req: Request) {
  try {
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

    // Validierung (nur Bilder, kleiner als normale Uploads)
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 },
      );
    }

    // Profilbilder sollten kleiner sein (max 2 MB)
    const maxSizeBytes = 2 * 1024 * 1024; // 2 MB
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: "Profilbild zu groß. Maximum: 2 MB" },
        { status: 400 },
      );
    }

    const userId = session.user.id as string;

    // Altes Profilbild löschen (falls vorhanden)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileImageUrl: true },
    });

    if (user?.profileImageUrl) {
      // Altes Profilbild löschen (optional, kann auch behalten werden)
      // Hier könnten wir die alte Datei löschen, aber lassen wir sie erstmal
    }

    // Neues Profilbild speichern
    const { filename, storageKey } = await saveUploadedFile(file, userId);

    // Profilbild-URL in DB speichern
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profileImageUrl: `/uploads/${filename}`,
      },
      select: {
        id: true,
        email: true,
        name: true,
        profileImageUrl: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        profileImageUrl: updatedUser.profileImageUrl,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[PROFILE_AVATAR]", error);
    return NextResponse.json(
      { error: "Fehler beim Hochladen des Profilbilds" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 },
      );
    }

    const userId = session.user.id as string;

    // Profilbild entfernen
    await prisma.user.update({
      where: { id: userId },
      data: {
        profileImageUrl: null,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[PROFILE_AVATAR_DELETE]", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen des Profilbilds" },
      { status: 500 },
    );
  }
}
