"use client";

import { useState, FormEvent, useRef } from "react";
import Image from "next/image";

interface ProfileImageUploadProps {
  currentImageUrl: string | null;
}

export function ProfileImageUpload({
  currentImageUrl,
}: ProfileImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);
    setSuccess(null);

    // Validierung
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Nur Bildformate erlaubt: JPEG, PNG, GIF, WebP");
      return;
    }

    const maxSizeMB = 2;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`Datei zu groß. Maximum: ${maxSizeMB} MB`);
      return;
    }

    // Preview erstellen
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.[0] || loading) return;

    const file = fileInputRef.current.files[0];
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        profileImageUrl?: string;
      };

      if (res.ok && data.success) {
        setSuccess("Profilbild erfolgreich aktualisiert!");
        if (data.profileImageUrl) {
          setPreview(data.profileImageUrl);
        }
        // Seite neu laden nach kurzer Verzögerung
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError(data.error || "Fehler beim Hochladen");
      }
    } catch (err) {
      console.error(err);
      setError("Unerwarteter Fehler");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Möchtest du dein Profilbild wirklich löschen?")) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/profile/avatar", {
        method: "DELETE",
      });

      if (res.ok) {
        setSuccess("Profilbild gelöscht");
        setPreview(null);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error || "Fehler beim Löschen");
      }
    } catch (err) {
      console.error(err);
      setError("Unerwarteter Fehler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
          id="profile-image-input"
          disabled={loading}
        />
        <label
          htmlFor="profile-image-input"
          className="inline-block cursor-pointer rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          {preview && preview !== currentImageUrl
            ? "Anderes Bild auswählen"
            : "Bild auswählen"}
        </label>

        {preview && preview !== currentImageUrl && (
          <button
            type="submit"
            disabled={loading}
            className="ml-2 rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-200"
          >
            {loading ? "Wird hochgeladen..." : "Speichern"}
          </button>
        )}

        {currentImageUrl && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="ml-2 rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:bg-neutral-900 dark:text-red-400 dark:hover:bg-red-950"
          >
            Löschen
          </button>
        )}
      </form>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          {success}
        </div>
      )}
    </div>
  );
}
