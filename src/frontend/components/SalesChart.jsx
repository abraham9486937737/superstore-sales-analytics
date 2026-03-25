import React from "react";
import {
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartContainer from "./ChartContainer";

function SalesTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }
  const sales = payload[0]?.value ?? 0;
  const trend = payload[1]?.value ?? 0;
  const delta = trend ? ((sales - trend) / trend) * 100 : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm text-slate-700">Sales: ${sales.toLocaleString()}</p>
      <p className="text-xs text-slate-500">Mini trend delta: {delta.toFixed(1)}%</p>
    </div>
  );
}

/**
 * SalesChart
 * Purpose: Monthly Sales Flow chart using bar + line for trend and volume context.
 * Styling: Smooth line, rounded bars, clean grid, interactive tooltip.
 */
function SalesChart({ data, isDark = false, animationKey }) {
  return (
    <ChartContainer title="Monthly Sales Flow" subtitle="Bar + trend line with contextual tooltip" isDark={isDark} animationKey={animationKey}>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 12 }} />
            <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
            <Tooltip content={<SalesTooltip />} cursor={{ fill: "rgba(59,130,246,0.08)" }} />
            <Bar dataKey="sales" fill="#7dd3fc" radius={[8, 8, 0, 0]} />
            <Line
              type="monotone"
              dataKey="salesTrend"
              stroke="#1d4ed8"
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

export default SalesChart;
