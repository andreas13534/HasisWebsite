import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col gap-6 px-4 py-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Bilder posten, die nach 1 Stunde verschwinden.
        </h1>
        <p className="max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
          Lade Bilder hoch, teile sie mit anderen und überlasse der App die
          Aufräumarbeit: jedes Bild wird exakt 60 Minuten nach dem Upload
          automatisch gelöscht – Datei und Datenbankeintrag.
        </p>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-200"
        >
          Jetzt starten
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-900"
        >
          Ich habe schon einen Account
        </Link>
      </section>

      <section className="mt-4 grid gap-4 text-sm text-neutral-600 dark:text-neutral-400 md:grid-cols-3">
        <div className="rounded-lg border p-4 dark:border-neutral-800">
          <h2 className="mb-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            Ephemere Bilder
          </h2>
          <p>Alle Uploads verschwinden automatisch nach genau 1 Stunde.</p>
        </div>
        <div className="rounded-lg border p-4 dark:border-neutral-800">
          <h2 className="mb-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            Geschützter Feed
          </h2>
          <p>Nur eingeloggte Nutzer sehen den Feed und können hochladen.</p>
        </div>
        <div className="rounded-lg border p-4 dark:border-neutral-800">
          <h2 className="mb-1 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            Privacy by Design
          </h2>
          <p>Strikte Ablaufzeit, kein Tracking, kein offener Storage-Bucket.</p>
        </div>
      </section>
    </div>
  );
}
