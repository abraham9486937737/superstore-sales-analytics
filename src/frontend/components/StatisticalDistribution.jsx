import React from "react";
import { Bar, Cell, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartContainer from "./ChartContainer";

/**
 * StatisticalDistribution
 * Purpose: Display profit distribution as histogram and box-style summary stats.
 * Styling: Histogram paired with compact statistical cards.
 */
function StatisticalDistribution({ histogram, stats, isDark = false, animationKey }) {
  const tickColor = isDark ? "#94a3b8" : "#475569";
  const palette = ["#0ea5e9", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#14b8a6", "#ec4899", "#3b82f6", "#f97316", "#6366f1"];

  const distributionWithCurve = React.useMemo(() => {
    if (!histogram?.length) {
      return [];
    }

    const rawValues = histogram.map((x) => Number.parseFloat(String(x.bucket).replace(/[^\d.-]/g, "")) || 0);
    const counts = histogram.map((x) => Number(x.count) || 0);
    const totalCount = counts.reduce((acc, c) => acc + c, 0) || 1;
    const width = Math.max(1, rawValues.length > 1 ? Math.abs(rawValues[1] - rawValues[0]) : 1);

    const weightedMean = rawValues.reduce((acc, value, idx) => acc + value * counts[idx], 0) / totalCount;
    const variance = rawValues.reduce((acc, value, idx) => acc + ((value - weightedMean) ** 2) * counts[idx], 0) / totalCount;
    const stdDev = Math.max(Math.sqrt(variance), 1e-6);

    return histogram.map((row, idx) => {
      const x = rawValues[idx];
      const z = (x - weightedMean) / stdDev;
      const pdf = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
      const expected = pdf * totalCount * width;
      return {
        ...row,
        expected,
      };
    });
  }, [histogram]);

  return (
    <ChartContainer title="Statistical Distribution" subtitle="Profit histogram and five-number style summary" isDark={isDark} animationKey={animationKey}>
      <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={distributionWithCurve}>
              <XAxis dataKey="bucket" tick={{ fill: tickColor, fontSize: 11 }} />
              <YAxis tick={{ fill: tickColor, fontSize: 11 }} />
              <YAxis yAxisId="curve" orientation="right" hide />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "expected") {
                    return [Number(value).toFixed(1), "Bell curve"];
                  }
                  return [value, "Count"];
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={600}>
                {distributionWithCurve.map((_, idx) => (
                  <Cell key={`hist-cell-${idx}`} fill={palette[idx % palette.length]} />
                ))}
              </Bar>
              <Line
                yAxisId="curve"
                type="monotone"
                dataKey="expected"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive
                animationDuration={700}
              />
            </ComposedChart>
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
