"use client";

import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";

/** Appears once you are well down the page. */
export function BackToTop() {
  const { locale } = useI18n();
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setVisible(y > 800));

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          whileHover={{ y: -3 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={locale === "en" ? "Back to top" : "Terug naar boven"}
          className="glass fixed bottom-20 right-6 z-50 grid size-12 place-items-center rounded-2xl text-white transition-colors hover:border-brand-500/50 hover:shadow-glow"
        >
          <ArrowUp className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
