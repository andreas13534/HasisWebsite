"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name: name || undefined,
          password,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        success?: boolean;
        retryAfter?: number;
      };

      if (!res.ok) {
        if (res.status === 429) {
          // Rate Limit Error
          const retrySeconds = data.retryAfter || 3600;
          const retryMinutes = Math.ceil(retrySeconds / 60);
          setError(
            `Zu viele Registrierungsversuche. Bitte warte ${retryMinutes} Minute(n) und versuche es erneut.`,
          );
        } else {
          setError(data.error ?? "Registrierung fehlgeschlagen");
        }
        setLoading(false);
        return;
      }

      setSuccess("Account erstellt. Du kannst dich jetzt einloggen.");
      setLoading(false);

      setTimeout(() => {
        router.push("/login");
      }, 800);
    } catch (err) {
      console.error(err);
      setError("Unerwarteter Fehler. Bitte versuche es erneut.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h1 className="mb-1 text-center text-2xl font-semibold">
          Account erstellen
        </h1>
        <p className="mb-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Registriere dich, um Bilder zu posten, die nach 1 Stunde verschwinden.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="email">
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-0 transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="name">
              Anzeigename (optional)
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-0 transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor="password"
            >
              Passwort
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-0 transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-700 dark:bg-neutral-900"
            />
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Mindestens 8 Zeichen, wähle ein sicheres Passwort.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {success && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-200"
          >
            {loading ? "Wird erstellt..." : "Registrieren"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-neutral-600 dark:text-neutral-400">
          Bereits einen Account?{" "}
          <Link
            href="/login"
            className="font-medium text-neutral-900 underline-offset-2 hover:underline dark:text-neutral-200"
          >
            Zum Login
          </Link>
        </p>
      </div>
    </div>
  );
}

