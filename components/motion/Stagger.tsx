"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  show: (stagger: number = 0.1) => ({ transition: { staggerChildren: stagger } }),
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

interface StaggerProps extends HTMLMotionProps<"div"> {
  stagger?: number;
}

/** Parent that reveals its <StaggerItem> children one after another on scroll. */
export function Stagger({ stagger = 0.1, children, ...props }: StaggerProps) {
  return (
    <motion.div
      variants={container}
      custom={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={staggerItem} {...props}>
      {children}
    </motion.div>
  );
}
