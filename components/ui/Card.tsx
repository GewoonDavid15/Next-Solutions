import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds the lime glow + scale-105 hover state. */
  interactive?: boolean;
}

export function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "glass relative overflow-hidden rounded-3xl p-6 sm:p-8",
        interactive &&
          "transition-all duration-300 ease-out hover:z-10 hover:scale-105 hover:border-brand-500/40 hover:bg-white/[0.05] hover:shadow-glow-lg",
        className,
      )}
      {...props}
    />
  );
}
