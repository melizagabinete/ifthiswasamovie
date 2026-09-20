"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Search, Film, Ticket as TicketIcon, X } from "lucide-react";
import { TicketPreview } from "./TicketPreview";

const TicketSchema = z.object({
  movieTitle: z.string().min(1, "Movie title is required"),
  moviePoster: z.string().optional(),
  recipientName: z.string().min(1, "Recipient name is required"),
  message: z.string().min(1, "Message is required"),
  number: z
    .string()
    .min(1, "Ticket number is required")
    .max(4, "Ticket number must be at most 4 digits")
    .regex(/^\d+$/, "Ticket number must contain only digits"),

  barcodeWord: z.string().min(1, "Barcode word is required").max(14, "Barcode word must be 14 characters or less"),
});

type TicketFormData = z.infer<typeof TicketSchema>;

interface MovieResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

export function TicketForm() {
  const [movieSuggestions, setMovieSuggestions] = useState<MovieResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedMoviePoster, setSelectedMoviePoster] = useState<string>("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<TicketFormData>({
    resolver: zodResolver(TicketSchema),
    defaultValues: {
      movieTitle: "",
      moviePoster: "",
      recipientName: "",
      message: "",
      number: "",
      barcodeWord: "",
    },
  });

  const { formState: { isSubmitting } } = form;

  const searchMovies = async (query: string) => {
    if (query.length < 2) {
      setMovieSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/movies?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to search movies");
      }

      if (data.results) {
        setMovieSuggestions(data.results.slice(0, 8));
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error searching movies:", error);
      toast.error(error instanceof Error ? error.message : "Failed to search movies");
    } finally {
      setSearching(false);
    }
  };

  // Debounce movie search as the user types
  const handleTitleChange = (value: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchMovies(value), 300);
  };

  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  const handleMovieSelect = (movie: MovieResult) => {
    form.setValue("movieTitle", movie.title, { shouldValidate: true });
    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "";
    form.setValue("moviePoster", posterUrl);
    setSelectedMoviePoster(posterUrl);
    setShowSuggestions(false);
    setMovieSuggestions([]);
  };

  const handleSubmit = async (data: TicketFormData) => {
    try {
      const response = await fetch("/api/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieTitle: data.movieTitle,
          posterUrl: data.moviePoster,
          recipientName: data.recipientName,
          message: data.message,
          seatNumber: data.number,
          barcodeWord: data.barcodeWord,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send ticket");
      }

      form.reset();
      setSelectedMoviePoster("");
      toast.success("Ticket sent successfully!");
    } catch (error) {
      console.error("Error sending ticket:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send ticket");
    }
  };

  const watchTitle = form.watch("movieTitle");
  const watchRecipient = form.watch("recipientName");
  const showPreview = Boolean(watchTitle && watchRecipient);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        {/* ===== Form card ===== */}
        <div className="rounded-2xl border border-ink/10 bg-paper p-6 shadow-sm sm:p-8">
          <div className="mb-7 flex items-center gap-3 border-b border-dashed border-ink/20 pb-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-burgundy text-cream">
              <TicketIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-serif text-xl text-ink">Create Your Ticket</h2>
              <p className="text-xs uppercase tracking-wide text-ink-muted">Movie · Moment · Message</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-5" noValidate>
              {/* Movie title with search */}
              <FormField
                control={form.control}
                name="movieTitle"
                render={({ field }) => (
                  <FormItem className="relative space-y-1.5">
                    <FormLabel className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                      Movie Title
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                        <Input
                          placeholder="Search for a movie..."
                          {...field}
                          autoComplete="off"
                          onChange={(e) => {
                            field.onChange(e);
                            handleTitleChange(e.target.value);
                          }}
                          onFocus={() => movieSuggestions.length > 0 && setShowSuggestions(true)}
                          className="h-11 rounded-lg border-ink/15 bg-cream pl-9 pr-9 text-sm text-ink placeholder:text-ink-muted focus-visible:ring-burgundy/40"
                        />
                        {searching && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Spinner size="sm" className="text-burgundy" />
                          </span>
                        )}
                      </div>
                    </FormControl>

                    {/* Suggestions dropdown */}
                    {showSuggestions && movieSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-64 overflow-y-auto rounded-lg border border-ink/10 bg-cream shadow-lg">
                        {movieSuggestions.map((movie) => (
                          <button
                            key={movie.id}
                            type="button"
                            onClick={() => handleMovieSelect(movie)}
                            className="flex w-full items-center gap-3 border-b border-ink/5 px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-burgundy/5"
                          >
                            {movie.poster_path ? (
                              <Image
                                src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                alt=""
                                width={30}
                                height={44}
                                className="rounded shadow-sm"
                              />
                            ) : (
                              <span className="flex h-11 w-[30px] items-center justify-center rounded bg-paper text-ink-muted">
                                <Film className="h-4 w-4" />
                              </span>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-ink">{movie.title}</p>
                              <p className="text-xs text-ink-muted">
                                {movie.release_date ? new Date(movie.release_date).getFullYear() : "—"}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />

              {/* Selected poster chip */}
              {selectedMoviePoster && (
                <div className="flex items-center gap-3 rounded-lg border border-ink/10 bg-cream px-3 py-2">
                  <Image
                    src={selectedMoviePoster}
                    alt="Selected movie poster"
                    width={36}
                    height={54}
                    className="rounded shadow-sm"
                  />
                  <span className="flex-1 truncate text-sm text-ink-soft">{watchTitle}</span>
                  <button
                    type="button"
                    aria-label="Remove selected poster"
                    onClick={() => {
                      setSelectedMoviePoster("");
                      form.setValue("moviePoster", "");
                    }}
                    className="text-ink-muted transition-colors hover:text-burgundy"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="recipientName"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5 sm:col-span-2">
                      <FormLabel className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                        Recipient
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Who is this ticket for?"
                          {...field}
                          className="h-11 rounded-lg border-ink/15 bg-cream text-sm text-ink placeholder:text-ink-muted focus-visible:ring-burgundy/40"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                        Seat No.
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 1234"
                          {...field}
                          inputMode="numeric"
                          maxLength={4}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                            field.onChange(value);
                          }}
                          className="h-11 rounded-lg border-ink/15 bg-cream text-sm text-ink placeholder:text-ink-muted focus-visible:ring-burgundy/40"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="barcodeWord"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                        Barcode Word
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., MOVIENIGHT"
                          {...field}
                          maxLength={14}
                          className="h-11 rounded-lg border-ink/15 bg-cream text-sm text-ink placeholder:text-ink-muted focus-visible:ring-burgundy/40"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                      Message
                    </FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Write your personal message..."
                        {...field}
                        rows={4}
                        className="w-full resize-none rounded-lg border border-ink/15 bg-cream px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-burgundy/40"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 h-12 w-full rounded-lg bg-burgundy text-sm font-semibold text-cream shadow-sm transition-all hover:bg-burgundy-dark hover:shadow-md active:scale-[0.99] disabled:opacity-60"
              >
                {isSubmitting && <Spinner size="sm" />}
                {isSubmitting ? "Sending..." : "Send Ticket"}
              </Button>
            </form>
          </Form>
        </div>

        {/* ===== Live preview ===== */}
        <div className="lg:sticky lg:top-24">
          <p className="mb-3 text-center text-sm  uppercase tracking-[0.1em] text-ink-muted lg:text-left">
            Live Preview
          </p>
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-ink/15 bg-cream-soft p-6 sm:p-8">
            {showPreview ? (
              <TicketPreview
                movieTitle={watchTitle}
                posterUrl={form.watch("moviePoster") || ""}
                recipientName={watchRecipient}
                message={form.watch("message")}
                seatNumber={form.watch("number")}
                barcodeWord={form.watch("barcodeWord")}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <TicketIcon className="h-8 w-8 text-burgundy/50" />
                <p className="max-w-[220px] text-sm text-ink-muted">
                  Add a movie title and recipient to view your ticket.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
