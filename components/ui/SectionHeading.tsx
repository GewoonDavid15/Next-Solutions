import { FadeUp } from "@/components/motion/FadeUp";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "center", className }: SectionHeadingProps) {
  return (
    <FadeUp className={cn("mb-12 max-w-2xl sm:mb-16", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Badge className="mb-4">{eyebrow}</Badge>}
      <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:text-lg">{description}</p>}
    </FadeUp>
  );
}
