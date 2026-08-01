import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppLayout } from "@/components/layout";

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
    "PhotoAtlas aide les photographes de paysage, d'astrophotographie et de phénomènes météorologiques à trouver les meilleures conditions de prise de vue.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
    >
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}

