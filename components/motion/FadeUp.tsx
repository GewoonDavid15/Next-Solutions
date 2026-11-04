"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

interface FadeUpProps extends HTMLMotionProps<"div"> {
  delay?: number;
  distance?: number;
  once?: boolean;
}

/** Fades an element upward as soon as it scrolls into view. */
export function FadeUp({ delay = 0, distance = 32, once = true, children, ...props }: FadeUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
