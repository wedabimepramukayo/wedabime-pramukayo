/**
 * Home Page Loading Skeleton — Wedabime Pramukayo
 * Matches the homepage layout structure for smooth loading UX
 */

export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <section className="py-20 md:py-28 bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="h-6 w-40 bg-white/10 rounded-full" />
              <div className="h-14 w-full bg-white/10 rounded-lg" />
              <div className="h-14 w-3/4 bg-white/10 rounded-lg" />
              <div className="h-6 w-full bg-white/5 rounded" />
              <div className="h-6 w-2/3 bg-white/5 rounded" />
              <div className="flex gap-4 mt-4">
                <div className="h-12 w-40 bg-white/10 rounded-lg" />
                <div className="h-12 w-32 bg-white/10 rounded-lg" />
              </div>
              <div className="flex gap-6 mt-4">
                <div className="h-8 w-20 bg-white/5 rounded" />
                <div className="h-8 w-20 bg-white/5 rounded" />
                <div className="h-8 w-20 bg-white/5 rounded" />
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="w-80 h-80 rounded-3xl bg-white/5" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories skeleton */}
      <section className="py-16 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="h-10 w-60 bg-brand-emerald/10 rounded-lg mx-auto" />
            <div className="h-5 w-80 bg-brand-emerald/5 rounded mx-auto mt-3" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-5 rounded-xl border border-brand-emerald/10 bg-white">
                <div className="h-12 w-12 rounded-lg bg-brand-mint/20 mx-auto mb-3" />
                <div className="h-4 w-24 bg-brand-emerald/5 rounded mx-auto" />
                <div className="h-3 w-16 bg-brand-emerald/5 rounded mx-auto mt-2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured services skeleton */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-10 w-48 bg-brand-emerald/10 rounded-lg mb-10" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 rounded-xl border border-brand-emerald/10 bg-white">
                <div className="h-5 w-24 bg-brand-emerald/5 rounded mb-3" />
                <div className="h-6 w-full bg-brand-emerald/5 rounded mb-1" />
                <div className="h-4 w-3/4 bg-brand-emerald/5 rounded mb-4" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-brand-emerald/5 rounded" />
                  <div className="h-3 w-5/6 bg-brand-emerald/5 rounded" />
                  <div className="h-3 w-4/6 bg-brand-emerald/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages skeleton */}
      <section className="py-16 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="h-10 w-60 bg-brand-emerald/10 rounded-lg mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-6 rounded-xl border border-brand-emerald/10 bg-white text-center">
                <div className="h-14 w-14 rounded-xl bg-brand-mint/20 mx-auto mb-4" />
                <div className="h-5 w-32 bg-brand-emerald/5 rounded mx-auto mb-2" />
                <div className="h-3 w-full bg-brand-emerald/5 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
