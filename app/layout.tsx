import type { Metadata } from "next";
import "./globals.css";
import { inter, limelight, fraunces } from "./fonts";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "ifthiswasamovie",
  description: "Turn a message into a personalized movie ticket. Create, browse, and send tickets now.",
  icons: {
    icon: "/favicon.svg?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${limelight.variable} ${fraunces.variable}`}>
      <body className="bg-cream text-ink min-h-screen flex flex-col font-sans">
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
