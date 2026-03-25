import React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartContainer from "./ChartContainer";

function ProfitTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }
  const profit = payload[0]?.value ?? 0;
  const level = profit >= 0 ? "Positive" : "Negative";

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm text-slate-700">Profit: ${profit.toLocaleString()}</p>
      <p className="text-xs text-slate-500">Status: {level}</p>
    </div>
  );
}

/**
 * ProfitChart
 * Purpose: Monthly Profit Trajectory area-line chart to show profitability movement.
 * Styling: Gradient area fill, rounded panel, contextual tooltips.
 */
function ProfitChart({ data, isDark = false, animationKey }) {
  return (
    <ChartContainer title="Monthly Profit Trajectory" subtitle="Animated trajectory of profitability over time" isDark={isDark} animationKey={animationKey}>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 12 }} />
            <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
            <Tooltip content={<ProfitTooltip />} cursor={{ fill: "rgba(139,92,246,0.08)" }} />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#7c3aed"
              strokeWidth={3}
              fill="url(#profitGradient)"
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

export default ProfitChart;
