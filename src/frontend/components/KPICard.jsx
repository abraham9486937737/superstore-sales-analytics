import React from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

/**
 * KPICard
 * Purpose: Reusable metric card for key business KPIs.
 * Styling: Gradient accent, soft shadows, scale hover animation.
 */
function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient = "from-cyan-500 to-blue-600",
  isActive = false,
  onClick,
  trend,
  isDark = false,
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      className={`group rounded-2xl border bg-white/85 p-4 shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl ${
        isActive
          ? isDark
            ? "border-cyan-500 ring-2 ring-cyan-900 bg-slate-800"
            : "border-blue-500 ring-2 ring-blue-200 bg-white/85"
          : isDark
          ? "border-slate-700/60 bg-slate-800/80"
          : "border-white/30 bg-white/85"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className={`inline-flex rounded-lg bg-gradient-to-r ${gradient} px-3 py-1 text-xs font-semibold text-white`}>
          {title}
        </div>
        {Icon && (
          <span className={`rounded-lg p-2 ${isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-700"}`} aria-hidden="true">
            <Icon size={16} />
          </span>
        )}
      </div>
      <h3 className={`text-3xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{value}</h3>
      <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{subtitle}</p>
      {trend && (
        <div className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${trend.positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {trend.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend.label}
        </div>
      )}
    </motion.article>
  );
}

export default KPICard;
