"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/feed";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    setLoading(false);

    if (result?.error) {
      setError("Login fehlgeschlagen. Bitte überprüfe deine Daten.");
      return;
    }

    router.push(callbackUrl);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h1 className="mb-1 text-center text-2xl font-semibold">
          Willkommen zurück
        </h1>
        <p className="mb-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Melde dich an, um Bilder hochzuladen und den Feed zu sehen.
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
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor="password"
            >
              Passwort
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-0 transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-200"
          >
            {loading ? "Wird eingeloggt..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-neutral-600 dark:text-neutral-400">
          Noch kein Account?{" "}
          <Link
            href="/register"
            className="font-medium text-neutral-900 underline-offset-2 hover:underline dark:text-neutral-200"
          >
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}

