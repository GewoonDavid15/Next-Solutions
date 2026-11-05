import { FadeUp } from "@/components/motion/FadeUp";
import { Badge } from "@/components/ui/Badge";

interface PageHeaderProps {
  eyebrow: string;
  title: React.ReactNode;
  description: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden pb-12 pt-36 sm:pb-16 sm:pt-44">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid-pattern bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-10 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[120px]" />
      <div className="container relative text-center">
        <FadeUp>
          <Badge className="mb-5">{eyebrow}</Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">{title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">{description}</p>
          {children && <div className="mt-8">{children}</div>}
        </FadeUp>
      </div>
    </section>
  );
}
