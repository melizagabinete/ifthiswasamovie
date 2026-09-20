import { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import BrowseTicketsClient from './BrowseTicketsClient';

function BrowseFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-3 text-ink-soft">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-burgundy border-r-transparent" />
        <p className="text-sm">Loading tickets...</p>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <>
      <Navbar currentPage="browse" />
      <Suspense fallback={<BrowseFallback />}>
        <BrowseTicketsClient />
      </Suspense>
    </>
  );
}
