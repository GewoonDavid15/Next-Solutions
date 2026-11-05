"use client";

import { animate, useInView, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

/** Counts up from 0 to `value` once it enters the viewport and re-animates when `value` changes. */
export function AnimatedCounter({ value, decimals = 0, suffix = "", prefix = "", duration = 2 }: AnimatedCounterProps) {
  const { locale } = useI18n();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionValue, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [inView, value, duration, motionValue]);

  useEffect(
    () =>
      motionValue.on("change", (v) =>
        setDisplay(v.toLocaleString(locale === "en" ? "en-GB" : "nl-NL", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })),
      ),
    [motionValue, decimals, locale],
  );

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
