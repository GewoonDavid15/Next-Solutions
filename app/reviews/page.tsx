import type { Metadata } from "next";
import { Star } from "lucide-react";
import { FadeUp } from "@/components/motion/FadeUp";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { ReviewCard, Stars } from "@/components/live/ReviewCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPublicData } from "@/lib/bot-api";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Echte reviews van klanten van Next Solutions, verzameld na elk ticket en project.",
};

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = (await getPublicData())?.reviews ?? null;
  const total = reviews?.aantal ?? 0;

  return (
    <>
      <PageHeader
        eyebrow="Reviews"
        title={<>Wat <span className="text-gradient">klanten</span> zeggen</>}
        description="Na elk ticket en elk opgeleverd project vragen we klanten om een eerlijke review. Dit is wat ze zeggen."
      />

      <section className="pb-16">
        <div className="container">
          {!reviews || total === 0 || reviews.gemiddelde === null ? (
            <div className="glass mx-auto max-w-xl rounded-3xl p-8 text-center">
              <Star className="mx-auto size-8 text-amber-400" />
              <p className="mt-3 font-display text-xl text-white">Nog geen reviews</p>
              <p className="mt-2 text-sm text-zinc-400">De eerste reviews komen binnen zodra klanten hun ticket of project afronden.</p>
            </div>
          ) : (
            <>
              <FadeUp>
                <div className="glass mx-auto grid max-w-3xl gap-8 rounded-3xl p-6 sm:grid-cols-[auto_1fr] sm:p-8">
                  <div className="text-center sm:pr-4">
                    <p className="font-display text-6xl font-semibold text-white">{reviews.gemiddelde.toFixed(1).replace(".", ",")}</p>
                    <Stars value={reviews.gemiddelde} className="mt-2" />
                    <p className="mt-2 text-sm text-zinc-400">{total} reviews</p>
                  </div>
                  <ul className="space-y-2 self-center" aria-label="Verdeling van de sterren">
                    {[5, 4, 3, 2, 1].map((n) => {
                      const count = reviews.verdeling[n - 1] ?? 0;
                      return (
                        <li key={n} className="flex items-center gap-3 text-sm">
                          <span className="w-12 text-zinc-400">{n} ster{n > 1 ? "ren" : ""}</span>
                          <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                            <span className="block h-full rounded-full bg-amber-400" style={{ width: `${total ? (count / total) * 100 : 0}%` }} />
                          </span>
                          <span className="w-8 text-right tabular-nums text-zinc-400">{count}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </FadeUp>

              {reviews.recent.length > 0 && (
                <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {reviews.recent.map((r) => (
                    <StaggerItem key={r.id}>
                      <ReviewCard review={r} />
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
