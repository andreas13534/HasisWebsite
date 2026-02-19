import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ImageCard } from "@/components/ImageCard";

export default async function FeedPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Nur nicht-abgelaufene Bilder abrufen
  const now = new Date();
  const images = await prisma.image.findMany({
    where: {
      expiresAt: {
        gt: now, // expiresAt > now()
      },
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

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dein Feed</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Alle Bilder, die noch nicht abgelaufen sind
          </p>
        </div>
        <Link
          href="/upload"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-200"
        >
          Neues Bild hochladen
        </Link>
      </div>

      {images.length === 0 ? (
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
              Noch keine Bilder
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
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              currentUserId={session.user.id as string}
            />
          ))}
        </div>
      )}
    </div>
  );
}
