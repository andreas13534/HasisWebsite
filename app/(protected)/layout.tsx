import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}

