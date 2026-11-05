import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-display font-medium transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-gradient bg-[length:200%_auto] font-semibold text-ink shadow-glow hover:-translate-y-0.5 hover:bg-right hover:shadow-glow-lg active:translate-y-0",
        secondary:
          "glass text-white hover:-translate-y-0.5 hover:border-brand-500/50 hover:bg-white/[0.06] hover:shadow-glow",
        ghost: "text-zinc-300 hover:bg-white/5 hover:text-white",
        discord:
          "bg-[#5865F2] text-white shadow-[0_0_24px_-4px_rgba(88,101,242,0.7)] hover:-translate-y-0.5 hover:bg-[#4752c4] hover:shadow-[0_0_40px_-4px_rgba(88,101,242,0.9)]",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-base",
        lg: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = "Button";
