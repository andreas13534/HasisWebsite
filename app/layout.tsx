import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/SessionProvider";
import { NavBar } from "@/components/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Temp Image App",
  description: "Upload images that expire after 1 hour",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <AuthSessionProvider>
          <NavBar />
          <main className="min-h-screen bg-background text-foreground">
            {children}
          </main>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
