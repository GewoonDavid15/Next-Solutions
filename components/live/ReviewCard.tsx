import { Quote, Star } from "lucide-react";
import Image from "next/image";
import { formatDate, type Review } from "@/lib/live";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function Stars({ value, className, locale = "nl" }: { value: number; className?: string; locale?: Locale }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} role="img" aria-label={locale === "en" ? `${value} out of 5 stars` : `${value.toString().replace(".", ",")} van 5 sterren`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn("size-4", n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-zinc-600")} />
      ))}
    </span>
  );
}

export function ReviewCard({ review, locale = "nl" }: { review: Review; locale?: Locale }) {
  return (
    <figure className="glass flex h-full flex-col rounded-3xl p-6">
      <div className="flex items-center justify-between gap-3">
        <Stars value={review.sterren} locale={locale} />
        <Quote className="size-5 text-brand-400/60" />
      </div>
      <blockquote className="mt-4 flex-1 whitespace-pre-line text-sm leading-relaxed text-zinc-300">{review.tekst}</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        {review.avatar ? (
          <Image src={review.avatar} alt="" width={36} height={36} className="size-9 rounded-full" />
        ) : (
          <span className="grid size-9 place-items-center rounded-full bg-brand-gradient text-sm text-white">{review.naam.charAt(0)}</span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{review.naam}</p>
          <p className="truncate text-xs text-zinc-500">
            {review.bron === "project" ? `Project: ${review.context}` : review.context} • {formatDate(review.t, false, locale)}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
