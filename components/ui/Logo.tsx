import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)} aria-label="Next Solutions home">
      <span className="relative grid size-9 place-items-center rounded-xl bg-brand-gradient font-display text-lg font-bold text-white shadow-glow transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
        N
      </span>
      <span className="font-display text-lg font-semibold text-white">
        Next<span className="text-gradient">Solutions</span>
      </span>
    </Link>
  );
}
