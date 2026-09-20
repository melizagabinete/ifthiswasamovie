'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Search, Eye, X, Film, ChevronLeft, ChevronRight } from 'lucide-react';
import { TicketPreview } from '@/components/TicketPreview';
import bwipjs from 'bwip-js/browser';

interface TicketRecord {
  _id: string;
  movieTitle: string;
  recipientName: string;
  message: string;
  seatNumber: string;
  imageData: string;
  createdAt: string;
  posterUrl?: string;
  barcodeWord?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface TicketsResponse {
  tickets: TicketRecord[];
  pagination: PaginationInfo;
}

const normalizeCreatedAt = (value: string) => {
  const numericValue = Number(value);
  if (!Number.isNaN(numericValue) && value.trim().length > 0) {
    const milliseconds = numericValue < 1e10 ? numericValue * 1000 : numericValue;
    return new Date(milliseconds);
  }

  return new Date(value);
};

const formatDate = (isoDate: string) => {
  const date = normalizeCreatedAt(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const year = date.getUTCFullYear().toString().slice(-2);
  return `${month}/${day}/${year}`;
};

function TicketCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-ink/10 bg-paper">
      <div className="h-[170px] w-full bg-cream" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-3/4 rounded bg-cream" />
        <div className="h-3 w-1/2 rounded bg-cream" />
        <div className="h-3 w-full rounded bg-cream" />
      </div>
    </div>
  );
}

export default function BrowseTicketsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateSearchUrl = useCallback((nextSearch: string, nextPage: number = 1) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextSearch.trim()) {
      params.set('search', nextSearch.trim());
    } else {
      params.delete('search');
    }

    if (nextPage > 1) {
      params.set('page', nextPage.toString());
    } else {
      params.delete('page');
    }

    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const loadTickets = useCallback(async (search: string, page: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '21');
      if (search.trim()) {
        params.set('search', search.trim());
      }
      const response = await fetch(`/api/tickets?${params.toString()}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Tickets API failed: ${response.status} ${response.statusText}`, {
          url: response.url,
          body: errorText,
        });
        throw new Error(`Failed to load tickets: ${response.status} ${response.statusText}`);
      }

      const data: TicketsResponse = await response.json();
      setTickets(data.tickets);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error(`Failed to load tickets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    setSearchQuery(urlSearch);
    loadTickets(urlSearch, currentPage);
  }, [searchParams, currentPage, loadTickets]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('page');
        router.push(`?${params.toString()}`);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [searchParams, router]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (selectedTicket && barcodeCanvasRef.current && selectedTicket.barcodeWord) {
      try {
        bwipjs.toCanvas(barcodeCanvasRef.current, {
          bcid: 'code128',
          text: selectedTicket.barcodeWord,
          scale: 2,
          height: 8,
          includetext: true,
        });
      } catch (err) {
        console.error('Barcode error:', err);
      }
    }
  }, [selectedTicket]);

  // Close modal on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedTicket(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const hasActiveSearch = Boolean(searchQuery.trim());
  const trimmedSearch = searchQuery.trim();
  const headingLabel = hasActiveSearch
    ? `${pagination?.totalCount ?? tickets.length} ticket${(pagination?.totalCount ?? tickets.length) === 1 ? '' : 's'} found for “${trimmedSearch}”`
    : 'Latest Tickets';

  const onSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => updateSearchUrl(value, 1), 350);
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <main className="mx-auto w-full max-w-7xl flex-grow px-5 py-14 sm:px-6 md:py-20 lg:px-8">
        {/* Heading */}
        <div className="mb-10 text-center">
          <h1 className="mt-3 font-serif text-3xl text-ink sm:text-4xl ">{headingLabel}</h1>
          <p className="mt-2 text-sm text-ink-soft sm:text-base">Search by recipient name or just browse tickets.</p>
        </div>

        {/* Search */}
        <div className="mb-10 flex justify-center">
          <div className="w-full max-w-xl">
            <div className="flex items-center gap-3 rounded-xl border border-ink/15 bg-paper px-4 py-3 shadow-sm transition-colors focus-within:border-burgundy/50">
              <Search className="h-4.5 w-4.5 flex-shrink-0 text-burgundy" />
              <input
                type="text"
                placeholder="Search by recipient name..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="flex-1 bg-transparent text-sm font-medium text-ink outline-none placeholder:text-ink-muted"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    updateSearchUrl('', 1);
                  }}
                  aria-label="Clear search"
                  className="text-ink-muted transition-colors hover:text-burgundy"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Grid / states */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <TicketCardSkeleton key={i} />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/20 bg-paper py-20 text-center">
            <Film className="mb-3 h-8 w-8 text-burgundy/60" />
            <p className="text-lg text-ink-soft">
              {searchQuery ? 'No tickets found.' : 'No tickets yet. Create one to get started!'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="group overflow-hidden rounded-xl border border-ink/10 bg-paper transition-all duration-300 hover:-translate-y-1 hover:border-burgundy/30 hover:shadow-lg"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(ticket)}
                    className="flex w-full items-center justify-center overflow-hidden bg-cream-soft py-4"
                    aria-label={`View ticket for ${ticket.recipientName}`}
                  >
                    <TicketPreview
                      movieTitle={ticket.movieTitle}
                      posterUrl={ticket.posterUrl || ''}
                      recipientName={ticket.recipientName}
                      message={ticket.message}
                      seatNumber={ticket.seatNumber}
                      barcodeWord={ticket.barcodeWord || ''}
                      width={isMobile ? 300 : 340}
                      height={isMobile ? 121 : 137}
                    />
                  </button>
                  <div className="p-4">
                    <h3 className="mb-1 truncate text-sm font-bold uppercase tracking-wide text-ink">
                      {ticket.movieTitle}
                    </h3>
                    <p className="mb-1.5 truncate text-xs font-semibold text-burgundy">
                      To: {ticket.recipientName}
                    </p>
                    <p className="mb-3 line-clamp-2 text-xs text-ink-soft">{ticket.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-ink-muted">Seat No. {ticket.seatNumber}</span>
                      <Button
                        onClick={() => setSelectedTicket(ticket)}
                        size="sm"
                        className="h-8 gap-1.5 rounded-md bg-burgundy px-3 text-xs font-semibold text-cream hover:bg-burgundy-dark"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-14 flex flex-col items-center gap-4">
                <p className="text-sm text-ink-muted">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSearchUrl(trimmedSearch, pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="gap-1 rounded-md border-burgundy/40 text-burgundy hover:bg-burgundy hover:text-cream disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSearchUrl(trimmedSearch, pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="gap-1 rounded-md border-burgundy/40 text-burgundy hover:bg-burgundy hover:text-cream disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Ticket modal */}
        {selectedTicket && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm animate-fadeIn"
            onClick={() => setSelectedTicket(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative flex max-h-[90vh] w-full max-w-[400px] flex-col overflow-hidden rounded-2xl bg-cream shadow-2xl animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedTicket(null)}
                aria-label="Close ticket details"
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-paper text-ink transition-colors hover:bg-burgundy hover:text-cream"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex justify-center bg-cream-soft pb-4 pt-8">
                <TicketPreview
                  movieTitle={selectedTicket.movieTitle}
                  posterUrl={selectedTicket.posterUrl || ""}
                  recipientName={selectedTicket.recipientName}
                  message={selectedTicket.message}
                  seatNumber={selectedTicket.seatNumber}
                  barcodeWord={selectedTicket.barcodeWord || ""}
                  width={isMobile ? 260 : 320}
                  height={isMobile ? 105 : 129}
                />
              </div>

              <div className="border-t border-dashed border-ink/20 mx-6" />

              <div className="flex-1 overflow-y-auto px-6 py-6 text-center">
                <h2 className="mb-2 font-serif text-xl text-ink">
                  {selectedTicket.recipientName || "Recipient"}
                </h2>
                <p className="mb-6 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                  {selectedTicket.message}
                </p>

                <div className="my-4 border-t border-dashed border-ink/20" />

                {selectedTicket.barcodeWord && (
                  <div className="mb-4 flex justify-center">
                    <canvas
                      ref={barcodeCanvasRef}
                      className="rounded border border-ink/10 p-2"
                    />
                  </div>
                )}

                <p className="text-xs text-ink-muted">
                  {selectedTicket.createdAt ? formatDate(selectedTicket.createdAt) : ''}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
