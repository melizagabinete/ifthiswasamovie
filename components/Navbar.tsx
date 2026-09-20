"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Send, Ticket as TicketIcon } from "lucide-react";

interface NavbarProps {
  currentPage?: "home" | "send" | "browse";
}

export function Navbar({ currentPage }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home", show: currentPage !== "home" },
    { href: "/browse", label: "Browse Tickets", show: currentPage !== "browse" },
    { href: "/#about", label: "How It Works", show: currentPage === "home" || currentPage === undefined },
  ].filter((l) => l.show);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-ink/10 bg-cream/90 backdrop-blur supports-[backdrop-filter]:bg-cream/75">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2" onClick={() => setOpen(false)}>
          <Image
            src="/logo-ifthiswasamovie.png"
            alt="ifthiswasamovie"
            width={712}
            height={173}
            priority
            className="h-auto w-[50px] transition-transform duration-300 group-hover:-rotate-2 sm:w-[88px]"
          />
          <span className="font-serif text-lg tracking-wide text-ink">
            ifthiswas<span className="text-burgundy">amovie</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium uppercase tracking-wide text-ink-soft hover:text-burgundy transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-burgundy transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          {currentPage !== "send" && (
            <Link
              href="/send"
              className="inline-flex items-center gap-2 rounded-md bg-burgundy px-4 py-2 text-sm font-semibold text-cream shadow-sm transition-all hover:bg-burgundy-dark hover:shadow-md active:scale-[0.98]"
            >
              <Send className="h-4 w-4" />
              Send a Ticket
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-ink hover:bg-ink/5 transition-colors"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-ink/10 bg-cream px-5 py-4 animate-fadeIn">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium uppercase tracking-wide text-ink-soft hover:bg-ink/5 hover:text-burgundy transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {currentPage !== "send" && (
              <Link
                href="/send"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-burgundy px-4 py-2.5 text-sm font-semibold text-cream shadow-sm transition-colors hover:bg-burgundy-dark"
              >
                <TicketIcon className="h-4 w-4" />
                Send a Ticket
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
