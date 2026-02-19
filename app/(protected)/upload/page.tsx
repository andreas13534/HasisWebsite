"use client";

import { FormEvent, useState, useRef, DragEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setSuccess(null);

    // Validierung Client-seitig (zusätzlich zu Server)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Nur Bildformate erlaubt: JPEG, PNG, GIF, WebP");
      return;
    }

    const maxSizeMB = 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setError(`Datei zu groß. Maximum: ${maxSizeMB} MB`);
      return;
    }

    setFile(selectedFile);

    // Preview erstellen
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Bitte wähle eine Datei aus");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        retryAfter?: number;
        image?: { id: string; expiresAt: string };
      };

      if (!res.ok) {
        if (res.status === 429) {
          // Rate Limit Error
          const retrySeconds = data.retryAfter || 60;
          setError(
            `Zu viele Uploads. Bitte warte ${retrySeconds} Sekunden und versuche es erneut.`,
          );
        } else {
          setError(data.error ?? "Upload fehlgeschlagen");
        }
        setLoading(false);
        return;
      }

      setSuccess("Bild erfolgreich hochgeladen! Wird nach 1 Stunde automatisch gelöscht.");
      setLoading(false);

      // Reset und zum Feed navigieren
      setTimeout(() => {
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        router.push("/feed");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Unerwarteter Fehler. Bitte versuche es erneut.");
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Bild hochladen</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Lade ein Bild hoch. Es wird automatisch nach genau 1 Stunde gelöscht.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-lg border-2 border-dashed p-8 transition ${
            isDragging
              ? "border-neutral-900 bg-neutral-50 dark:border-neutral-100 dark:bg-neutral-900"
              : "border-neutral-300 dark:border-neutral-700"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
            id="file-input"
            disabled={loading}
          />

          {!preview ? (
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <svg
                className="h-12 w-12 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <label
                  htmlFor="file-input"
                  className="cursor-pointer text-sm font-medium text-neutral-900 underline-offset-2 hover:underline dark:text-neutral-100"
                >
                  Datei auswählen
                </label>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {" "}
                  oder hierher ziehen
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                JPEG, PNG, GIF, WebP • Max. 10 MB
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative mx-auto aspect-video max-w-md overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                <p className="font-medium">{file?.name}</p>
                <p className="text-xs">
                  {(file?.size ? file.size / 1024 / 1024 : 0).toFixed(2)} MB
                </p>
              </div>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded border border-neutral-300 px-3 py-1 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-900"
                  disabled={loading}
                >
                  Zurücksetzen
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className="flex w-full items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-200"
        >
          {loading ? "Wird hochgeladen..." : "Bild hochladen"}
        </button>
      </form>
    </div>
  );
}
