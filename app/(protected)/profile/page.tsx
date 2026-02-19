import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ImageCard } from "@/components/ImageCard";
import Link from "next/link";
import Image from "next/image";

export default async function ProfilePage() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id as string;

  // User-Daten abrufen
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      profileImageUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Alle eigenen Bilder abrufen (auch abgelaufene)
  const myImages = await prisma.image.findMany({
    where: {
      ownerId: userId,
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
    orderBy: {
      createdAt: "desc",
    },
  });

  const now = new Date();
  const activeImages = myImages.filter((img) => img.expiresAt > now);
  const expiredImages = myImages.filter((img) => img.expiresAt <= now);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col gap-6 px-4 py-8">
      {/* Profil-Header */}
      <div className="flex flex-col gap-4 rounded-lg border bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950 sm:flex-row sm:items-center">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-neutral-200 dark:border-neutral-700">
          {user.profileImageUrl ? (
            <Image
              src={user.profileImageUrl}
              alt="Profilbild"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-2xl font-semibold text-neutral-400 dark:bg-neutral-900 dark:text-neutral-600">
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-semibold">
            {user.name || user.email}
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {user.email}
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
            Mitglied seit{" "}
            {new Date(user.createdAt).toLocaleDateString("de-DE", {
              year: "numeric",
              month: "long",
            })}
          </p>
        </div>

        <Link
          href="/profile/settings"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-900"
        >
          Profil bearbeiten
        </Link>
      </div>

      {/* Statistiken */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="text-2xl font-semibold">{myImages.length}</div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400">
            Gesamt Bilder
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {activeImages.length}
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400">
            Aktive Bilder
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="text-2xl font-semibold text-neutral-400">
            {expiredImages.length}
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400">
            Abgelaufene Bilder
          </div>
        </div>
      </div>

      {/* Aktive Bilder */}
      {activeImages.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Aktive Bilder</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                currentUserId={userId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Abgelaufene Bilder */}
      {expiredImages.length > 0 && (
        <div>
          <details className="group">
            <summary className="cursor-pointer text-lg font-semibold text-neutral-600 dark:text-neutral-400">
              Abgelaufene Bilder ({expiredImages.length})
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {expiredImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-lg border bg-white opacity-60 dark:border-neutral-800 dark:bg-neutral-950"
                >
                  <div className="relative aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                    <Image
                      src={`/uploads/${image.filename}`}
                      alt={image.originalName}
                      fill
                      className="object-cover grayscale"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="text-sm font-medium text-white">
                        Abgelaufen
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-xs font-medium text-neutral-900 dark:text-neutral-100">
                      {image.originalName}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                      Abgelaufen am{" "}
                      {new Date(image.expiresAt).toLocaleDateString("de-DE")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Empty State */}
      {myImages.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
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
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Noch keine Bilder hochgeladen
            </p>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              Lade dein erstes Bild hoch, um zu beginnen
            </p>
          </div>
          <Link
            href="/upload"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-200"
          >
            Bild hochladen
          </Link>
        </div>
      )}
    </div>
  );
}
