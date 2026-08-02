import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppLayout } from "@/components/layout";
import { PROJECT_IDENTITY } from "@/lib/projectIdentity";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PhotoAtlas — Le copilote intelligent des photographes",
  description:
    "PhotoAtlas, imaginé et développé par Sébastien Lallemand, aide les photographes de paysage et d'astrophotographie à préparer leurs prises de vue.",
  authors: [{ name: PROJECT_IDENTITY.creator }],
  creator: PROJECT_IDENTITY.creator,
  keywords: [
    "photographie de paysage",
    "astrophotographie",
    "météo photo",
    "planification photographique",
    "PhotoAtlas",
  ],
  openGraph: {
    title: "PhotoAtlas — Le copilote intelligent des photographes",
    description:
      "Un outil de préparation photo imaginé et développé par le photographe Sébastien Lallemand.",
    type: "website",
    locale: "fr_FR",
    siteName: PROJECT_IDENTITY.name,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}>
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
