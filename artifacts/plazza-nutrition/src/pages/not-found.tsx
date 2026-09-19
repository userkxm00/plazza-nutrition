import { Link } from 'wouter';
import { ArrowLeft, Home, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-9rem)] max-w-[900px] items-center px-5 py-16 lg:px-10">
      <section className="w-full border hairline bg-[hsl(var(--card))] p-7 sm:p-12" aria-labelledby="not-found-title">
        <div className="flex items-start gap-4">
          <SearchX className="mt-1 shrink-0 text-[hsl(var(--primary))]" size={28} aria-hidden="true" />
          <div>
            <p className="eyebrow">404 / Plazza Nutrition</p>
            <h1 id="not-found-title" className="display mt-2 text-5xl uppercase sm:text-7xl">Page introuvable</h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
              Cette page n’existe pas ou le lien a changé. Revenez à l’accueil ou parcourez le catalogue.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/" className="focus-ring inline-flex items-center gap-2 bg-[hsl(var(--secondary))] px-5 py-3 text-xs font-bold text-white">
                <Home size={15} aria-hidden="true" /> Accueil
              </Link>
              <Link href="/shop" className="focus-ring inline-flex items-center gap-2 border hairline px-5 py-3 text-xs font-bold">
                Catalogue <ArrowLeft size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
