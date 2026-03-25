import React from "react";
import { motion } from "framer-motion";

/**
 * ChartContainer
 * Purpose: Shared panel wrapper for charts to keep spacing and visual style uniform.
 * Styling: Elevated glass panel with title and subtle hover emphasis.
 */
function ChartContainer({ title, subtitle, children, containerId, isDark = false, animationKey }) {
  return (
    <motion.section
      id={containerId}
      key={animationKey}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      className={`rounded-2xl border p-4 shadow-md transition-all hover:shadow-xl ${
        isDark
          ? "border-slate-700/60 bg-slate-800/70"
          : "border-white/30 bg-white/75"
      }`}
    >
      <h3 className={`mb-1 text-2xl font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{title}</h3>
      {subtitle && <p className={`mb-3 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>{subtitle}</p>}
      {children}
    </motion.section>
  );
}

export default ChartContainer;
