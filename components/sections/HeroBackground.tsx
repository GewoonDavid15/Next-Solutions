"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Bot, Code2, Gamepad2, Sparkles } from "lucide-react";
import { useEffect } from "react";

const shapes = [
  { icon: Code2, className: "left-[6%] top-[22%] size-16 sm:size-20", depth: 30, anim: "animate-float" },
  { icon: Gamepad2, className: "right-[8%] top-[18%] size-20 sm:size-24", depth: 50, anim: "animate-float-slow" },
  { icon: Sparkles, className: "left-[12%] bottom-[14%] size-14 sm:size-16", depth: 40, anim: "animate-float-slow" },
  { icon: Bot, className: "right-[14%] bottom-[18%] size-16 sm:size-20", depth: 25, anim: "animate-float" },
];

/** Animated gradient blobs + floating "3D" glass tiles that react to the mouse. */
export function HeroBackground() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]" />

      <motion.div
        className="absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-brand-600/30 blur-[110px]"
        animate={{ x: [0, 80, -20, 0], y: [0, 40, 90, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-24 top-20 h-[26rem] w-[26rem] rounded-full bg-fuchsia-600/20 blur-[110px]"
        animate={{ x: [0, -70, 30, 0], y: [0, 60, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-[22rem] w-[30rem] rounded-full bg-indigo-700/25 blur-[120px]"
        animate={{ x: [0, 60, -60, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      {shapes.map(({ icon: Icon, className, depth, anim }, i) => (
        <ParallaxTile key={i} sx={sx} sy={sy} depth={depth} className={className}>
          <div className={`${anim} size-full`} style={{ animationDelay: `${i * -1.7}s` }}>
            <div className="glass grid size-full place-items-center rounded-3xl [transform:perspective(600px)_rotateX(12deg)_rotateY(-14deg)]">
              <Icon className="size-1/2 text-brand-300 drop-shadow-[0_0_12px_rgba(167,139,250,0.8)]" />
            </div>
          </div>
        </ParallaxTile>
      ))}

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
    </div>
  );
}

function ParallaxTile({
  sx,
  sy,
  depth,
  className,
  children,
}: {
  sx: ReturnType<typeof useSpring>;
  sy: ReturnType<typeof useSpring>;
  depth: number;
  className: string;
  children: React.ReactNode;
}) {
  const x = useTransform(sx, (v) => v * depth);
  const y = useTransform(sy, (v) => v * depth);
  return (
    <motion.div style={{ x, y }} className={`absolute hidden opacity-70 md:block ${className}`}>
      {children}
    </motion.div>
  );
}
