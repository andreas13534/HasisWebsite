import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";
import Image from "next/image";
import Link from "next/link";

export default async function ProfileSettingsPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id as string;

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

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col gap-6 px-4 py-8">
      <div>
        <Link
          href="/profile"
          className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          ← Zurück zum Profil
        </Link>
        <h1 className="text-2xl font-semibold">Profil bearbeiten</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Verwalte dein Profilbild und Account-Einstellungen
        </p>
      </div>

      <div className="space-y-6 rounded-lg border bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
        {/* Profilbild-Sektion */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Profilbild</h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-2 border-neutral-200 dark:border-neutral-700">
              {user.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl}
                  alt="Profilbild"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-4xl font-semibold text-neutral-400 dark:bg-neutral-900 dark:text-neutral-600">
                  {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <ProfileImageUpload currentImageUrl={user.profileImageUrl} />
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                Empfohlene Größe: 200x200px. Max. 2 MB. Unterstützte Formate:
                JPEG, PNG, GIF, WebP.
              </p>
            </div>
          </div>
        </div>

        {/* Account-Info */}
        <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <h2 className="mb-4 text-lg font-semibold">Account-Informationen</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                E-Mail
              </label>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {user.email}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Anzeigename
              </label>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {user.name || "Nicht gesetzt"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Mitglied seit
              </label>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {new Date(user.createdAt).toLocaleDateString("de-DE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
