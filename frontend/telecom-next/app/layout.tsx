import type { Metadata } from "next";
import "./globals.css";
import LogoHeaderNodes from "@/components/logo/LogoHeaderNodes";

export const metadata: Metadata = {
  title: "TelecoSmart — Billing Platform",
  description: "Enterprise Telecom Billing Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-display bg-surface-950 text-slate-100 antialiased">
        <header className="mb-8">
          <LogoHeaderNodes />
        </header>
        {children}
      </body>
    </html>
  );
}