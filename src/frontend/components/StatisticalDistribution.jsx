import React from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartContainer from "./ChartContainer";

/**
 * StatisticalDistribution
 * Purpose: Display profit distribution as histogram and box-style summary stats.
 * Styling: Histogram paired with compact statistical cards.
 */
function StatisticalDistribution({ histogram, stats, isDark = false, animationKey }) {
  const tickColor = isDark ? "#94a3b8" : "#475569";
  return (
    <ChartContainer title="Statistical Distribution" subtitle="Profit histogram and five-number style summary" isDark={isDark} animationKey={animationKey}>
      <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogram}>
              <XAxis dataKey="bucket" tick={{ fill: tickColor, fontSize: 11 }} />
              <YAxis tick={{ fill: tickColor, fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Stat label="Min" value={stats.min} isDark={isDark} />
          <Stat label="Q1" value={stats.q1} isDark={isDark} />
          <Stat label="Median" value={stats.median} isDark={isDark} />
          <Stat label="Q3" value={stats.q3} isDark={isDark} />
          <Stat label="Max" value={stats.max} isDark={isDark} />
          <Stat label="Std Dev" value={stats.stdDev} isDark={isDark} />
        </div>
      </div>
    </ChartContainer>
  );
}

function Stat({ label, value, isDark = false }) {
  return (
    <div className={`rounded-lg border p-2 ${isDark ? "border-slate-700 bg-slate-800/80" : "border-slate-200 bg-white/80"}`}>
      <p className={`text-xs uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
      <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{value}</p>
    </div>
  );
}

export default StatisticalDistribution;
