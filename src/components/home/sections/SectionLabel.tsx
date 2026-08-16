import React from "react";
import { motion } from "framer-motion";
import { C, mono } from "../theme";

export function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="flex items-center gap-4 text-[10px] uppercase tracking-[0.45em]"
      style={{ ...mono, color: C.teal }}
    >
      <span className="h-px w-10" style={{ background: C.teal }} />
      {label}
    </motion.div>
  );
}

