"use client";

import { useEffect, useState } from "react";
import { TicketPreview } from "@/components/TicketPreview";
import { Film } from "lucide-react";

interface Ticket {
  _id: string;
  movieTitle: string;
  posterUrl: string;
  recipientName: string;
  message: string;
  seatNumber: string;
  barcodeWord: string;
  createdAt: string;
}

function SectionHeading() {
  return (
    <div className="mb-10 flex items-center gap-4">
      <span className="hidden h-px flex-1 bg-ink/15 sm:block" />
      <h2 className="flex items-center gap-2.5 whitespace-nowrap font-serif text-2xl text-ink sm:text-3xl">
        <Film className="h-5 w-5 text-burgundy" />
        Now Showing
      </h2>
      <span className="h-px flex-1 bg-ink/15" />
    </div>
  );
}

export function NowShowingSection(): React.ReactElement {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchTickets = async () => {
      try {
        const response = await fetch("/api/tickets?limit=21");
        const data = await response.json();
        if (!cancelled) {
          setTickets((data.tickets ?? []).slice(0, 21));
        }
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTickets();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="w-full border-y border-ink/10 bg-paper py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHeading />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-[230px] w-[300px] flex-shrink-0 animate-pulse rounded-xl bg-cream"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (tickets.length === 0) {
    return (
      <section className="w-full border-y border-ink/10 bg-paper py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHeading />
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/20 bg-cream py-16 text-center">
            <Film className="mb-3 h-8 w-8 text-burgundy/60" />
            <p className="text-ink-soft">No tickets yet — be the first to send one.</p>
          </div>
        </div>
      </section>
    );
  }

  const rowOne = tickets.slice(0, Math.ceil(tickets.length / 2));
  const rowTwo = tickets.slice(Math.ceil(tickets.length / 2));

  const renderRow = (row: Ticket[], direction: "left" | "right", keySuffix: string) => (
    <div className="relative w-full overflow-hidden">
      <div
        className={`flex gap-3 ${direction === "left" ? "animate-scroll-left" : "animate-scroll-right"} hover:[animation-play-state:paused]`}
      >
        {[...row, ...row].map((ticket, i) => (
          <div key={`${ticket._id}-${keySuffix}-${i}`} className="flex flex-shrink-0 items-center justify-center">
            <div className="w-auto overflow-hidden rounded-lg shadow-sm">
              <TicketPreview
                movieTitle={ticket.movieTitle}
                posterUrl={ticket.posterUrl || ""}
                recipientName={ticket.recipientName}
                message={ticket.message}
                seatNumber={ticket.seatNumber}
                barcodeWord={ticket.barcodeWord || ""}
                width={320}
                height={129}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-paper to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-paper to-transparent" />
    </div>
  );

  return (
    <section className="w-full border-y border-ink/10 bg-paper py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeading />
        <div className="flex flex-col gap-4">
          {renderRow(rowOne, "left", "r1")}
          {rowTwo.length > 0 && renderRow(rowTwo, "right", "r2")}
        </div>
      </div>
    </section>
  );
}
