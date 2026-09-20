import Link from "next/link";
import { TicketForm } from "@/components/ticket-form";
import { Navbar } from "@/components/Navbar";

const DATA = {
  footerLinks: {
    about: { text: "How It Works", href: "/#about" },
    supportus: { text: "Support Us", href: "https://www.facebook.com/profile.php?id=61586949183080" },
  },
};

export default function SendPage() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Navbar currentPage="send" />

      <main className="flex flex-1 flex-col items-center px-5 py-14 md:py-20">
        <div className="mb-10 max-w-lg text-center">
          <h1 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">
            Turn your message into a movie ticket
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
            Pick a movie, write your message, and send your ticket now.
          </p>
        </div>

        <TicketForm />
      </main>

      <footer className="w-full border-t border-ink/10 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 md:flex-row">
          <p className="text-sm text-ink-muted">© 2026 ifthiswasamovie. All rights reserved.</p>
          <div className="flex items-center gap-7">
            <Link href={DATA.footerLinks.about.href} className="text-sm font-medium text-ink-soft transition-colors hover:text-burgundy">
              {DATA.footerLinks.about.text}
            </Link>
            <a
              href={DATA.footerLinks.supportus.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-ink-soft transition-colors hover:text-burgundy"
            >
              {DATA.footerLinks.supportus.text}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
