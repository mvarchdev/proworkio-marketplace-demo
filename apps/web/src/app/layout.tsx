import type { Metadata } from "next";
import { Sora } from "next/font/google";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";

import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.baseUrl),
  title: {
    default: "Proworkio | Overené firmy pre stavebné a domáce zákazky",
    template: "%s | Proworkio",
  },
  description: siteConfig.description,
  openGraph: {
    title: "Proworkio",
    description: siteConfig.description,
    locale: siteConfig.locale,
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="sk" className={sora.variable} data-scroll-behavior="smooth">
      <body className="bg-[#F0F0F7] font-sans text-[#1E1F48] antialiased">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ffffff,transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.72)_0%,rgba(240,240,247,1)_100%)]">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
