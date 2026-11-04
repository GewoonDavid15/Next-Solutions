import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-600/10 px-3 py-1 text-xs font-medium text-brand-200",
        className,
      )}
      {...props}
    />
  );
}
