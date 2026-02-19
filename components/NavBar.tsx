"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export function NavBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const goToLogin = () => router.push("/login");
  const goToRegister = () => router.push("/register");

  return (
    <header className="border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold">
          Temp Image App
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {session && !isAuthPage && (
            <>
              <Link
                href="/feed"
                className="rounded px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Feed
              </Link>
              <Link
                href="/upload"
                className="rounded px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Upload
              </Link>
              <Link
                href="/profile"
                className="rounded px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Profil
              </Link>
            </>
          )}

          {status === "loading" ? null : session ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded bg-neutral-900 px-3 py-1 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-200"
            >
              Logout
            </button>
          ) : !isAuthPage ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToLogin}
                className="rounded px-3 py-1 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Login
              </button>
              <button
                type="button"
                onClick={goToRegister}
                className="rounded bg-neutral-900 px-3 py-1 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-200"
              >
                Registrieren
              </button>
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

