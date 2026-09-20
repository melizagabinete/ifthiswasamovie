import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { NowShowingSection } from "@/components/NowShowingSection";
import { PlusCircle, Film, Send, Sparkles, ArrowRight } from "lucide-react";

const DATA = {
  footerLinks: {
    about: { text: "How It Works", href: "/#about" },
    supportus: { text: "Support Us", href: "https://www.facebook.com/profile.php?id=61586949183080" },
    tiktok: { text: "TikTok", href: "https://www.tiktok.com/@ifthiswasamovie.official" },
  },
};

export default function Home() {
  return (
    <div className="flex flex-col bg-cream">
      <Navbar currentPage="home" />

      <main className="flex flex-col">
        {/* ================= HERO ================= */}
        <section className="relative w-full overflow-hidden">
          {/* soft diagonal beige/paper backdrop, echoes the reference layout */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-cream" />
            <div className="absolute right-0 top-0 hidden h-full w-[58%] bg-paper/70 [clip-path:polygon(18%_0,100%_0,100%_100%,0_100%)] lg:block" />
          </div>

          <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-14 px-5 pb-20 pt-14 md:pt-20 lg:grid-cols-2 lg:gap-10 lg:pb-28">
            {/* Text column */}
            <div className="flex flex-col items-start">
              

              <h1 className="font-serif text-[2.75rem] leading-[1.08] text-ink sm:text-6xl lg:text-[3.6rem]">
                Your movie.
                <br />
                Your moment.
                <br />
                <span className="text-burgundy italic">Your message.</span>
              </h1>

              <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">
                Turn your message into a personalized movie ticket.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/send"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-burgundy px-7 py-3.5 text-sm font-semibold text-cream shadow-sm transition-all hover:bg-burgundy-dark hover:shadow-md active:scale-[0.98]"
                >
                  <Send className="h-4 w-4" />
                  Send a Ticket
                </Link>
                <Link
                  href="/browse"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-burgundy/40 bg-transparent px-7 py-3.5 text-sm font-semibold text-burgundy transition-all hover:bg-burgundy/5 active:scale-[0.98]"
                >
                  Browse Tickets
                </Link>
              </div>
            </div>

            {/* Ticket mockup column */}
            <div className="relative flex justify-center lg:justify-end">
              <HeroTicketMockup />
            </div>
          </div>
        </section>

        {/* ================= NOW SHOWING ================= */}
        <NowShowingSection />

        {/* ================= HOW IT WORKS ================= */}
        <section id="about" className="w-full bg-cream py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mb-14 text-center">
              <h2 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">
                How It Works
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                {
                  icon: PlusCircle,
                  title: "Create a Ticket",
                  desc: "Pick a movie, add a recipient, and write the message you actually want to say.",
                },
                {
                  icon: Film,
                  title: "Now Showing",
                  desc: "Browse tickets and discover moments shared by others.",
                },
                {
                  icon: Send,
                  title: "Send It",
                  desc: "Send a ticket to yourself or someone else. Stay anonymous or make it personal.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-ink/10 bg-paper p-7 transition-all duration-300 hover:-translate-y-1 hover:border-burgundy/30 hover:shadow-lg"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-burgundy/10 text-burgundy transition-colors group-hover:bg-burgundy group-hover:text-cream">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-ink">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-soft">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= SUPPORT ================= */}
        <section id="support" className="w-full border-y border-ink/10 bg-paper py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <h2 className="font-serif text-2xl text-ink sm:text-3xl">
              Enjoying <span className="text-burgundy">ifthiswasamovie</span>?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
              A quick like and follow means a lot. Your support is very much appreciated! Thank you!
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href={DATA.footerLinks.supportus.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-burgundy px-6 py-3 text-sm font-semibold text-cream transition-all hover:bg-burgundy-dark"
              >
                Follow on Facebook
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={DATA.footerLinks.tiktok.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-burgundy/40 px-6 py-3 text-sm font-semibold text-burgundy transition-all hover:bg-burgundy/5"
              >
                Follow on TikTok
              </a>
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="w-full bg-cream py-10">
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
      </main>
    </div>
  );
}

/**
 * Purely decorative hero ticket illustration — built with CSS, not the canvas
 * pipeline. It does not touch TicketPreview.tsx or lib/ticket-canvas.ts so the
 * real ticket rendering/preview/download logic stays untouched.
 */
function HeroTicketMockup() {
  return (
    <div className="relative w-full max-w-[420px]">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-burgundy/5 blur-2xl" />
      <div className="relative rotate-[-3deg] rounded-2xl border border-ink/10 bg-paper p-6 shadow-[0_20px_50px_-15px_rgba(33,23,18,0.35)] transition-transform duration-500 hover:rotate-0">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-burgundy/25 bg-cream">
            <Film className="h-5 w-5 text-burgundy" />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted">Seat No.</p>
            <p className="font-serif text-lg text-ink">31</p>
          </div>
        </div>

        <p className="mt-5 font-serif text-xl text-ink">ifthiswasamovie</p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-burgundy">Dedicate to anyone</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Each ticket includes a movie title, a message, and a seat number. Explore, create, and send tickets.
        </p>

        <div className="my-5 border-t border-dashed border-ink/20" />

        <div className="flex items-end justify-between">
          <div className="flex items-end gap-[3px]">
            {[3, 5, 2, 6, 4, 2, 5, 3, 6, 2, 4, 3, 5, 2, 6, 3].map((h, i) => (
              <span key={i} className="w-[3px] bg-ink/70" style={{ height: `${h * 4}px` }} />
            ))}
          </div>
          <span className="text-[10px] font-medium uppercase tracking-widest text-ink-muted">Admit One</span>
        </div>
      </div>
    </div>
  );
}
