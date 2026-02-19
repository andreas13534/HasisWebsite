import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10);
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // MIME-Type Check
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return {
      valid: false,
      error: `Nur Bildformate erlaubt: JPEG, PNG, GIF, WebP. Erhalten: ${file.type}`,
    };
  }

  // Größen-Check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Datei zu groß. Maximum: ${MAX_FILE_SIZE_MB} MB`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: "Datei ist leer",
    };
  }

  return { valid: true };
}

export async function saveUploadedFile(
  file: File,
  userId: string,
): Promise<{ filename: string; storageKey: string }> {
  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  const uploadPath = join(process.cwd(), uploadDir);

  // Upload-Verzeichnis erstellen falls nicht vorhanden
  try {
    await mkdir(uploadPath, { recursive: true });
  } catch (error) {
    // Verzeichnis existiert bereits, ignorieren
  }

  // Eindeutigen Dateinamen generieren
  const ext = file.name.split(".").pop() || "jpg";
  const uniqueId = randomBytes(16).toString("hex");
  const filename = `${uniqueId}.${ext}`;
  const storageKey = join(uploadDir, filename);
  const fullPath = join(uploadPath, filename);

  // Datei speichern
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(fullPath, buffer);

  return { filename, storageKey };
}
