import type { Metadata } from "next";
import { IBM_Plex_Mono, Sora } from "next/font/google";
import type { ReactNode } from "react";

import { AdminProviders } from "@/components/admin-providers";
import { AdminShell } from "@/components/admin-shell";

import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-admin-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Proworkio Admin",
    template: "%s | Proworkio Admin",
  },
  description: "Prevádzkový admin panel Proworkio pre dopyty, firmy, platby a audit.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="sk" className={`${sora.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-screen bg-slate-950 text-slate-950">
        <AdminProviders>
          <AdminShell>{children}</AdminShell>
        </AdminProviders>
      </body>
    </html>
  );
}
