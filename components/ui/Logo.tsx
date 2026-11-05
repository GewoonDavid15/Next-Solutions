import Link from "next/link";
import { cn } from "@/lib/utils";

/** The chevron mark from the logo pack (lime tile, dark chevrons). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 52 52" aria-hidden className={cn("size-9 shrink-0", className)}>
      <rect width="52" height="52" rx="12" fill="#C6F432" />
      <path d="M17 15 L29 26 L17 37 M27 15 L39 26 L27 37" fill="none" stroke="#0A0C10" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className, href = "/", byline = false }: { className?: string; href?: string; byline?: boolean }) {
  return (
    <Link href={href} className={cn("group flex items-center gap-2.5", className)}>
      <LogoMark className="transition-transform duration-300 group-hover:scale-105" />
      <span className="flex flex-col leading-none">
        <span className="whitespace-nowrap font-display text-[13px] font-extrabold uppercase tracking-tight text-white [font-stretch:125%] min-[400px]:text-[15px] sm:text-base">
          Next Solutions
        </span>
        {byline && <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-500">by Nexify</span>}
      </span>
    </Link>
  );
}
