import React from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartContainer from "./ChartContainer";

const BAR_COLORS = ["#0ea5e9", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#14b8a6", "#ec4899", "#3b82f6", "#f97316", "#6366f1"];

function ProductTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  const sales = Number(payload.find((p) => p.dataKey === "sales")?.value || 0);
  const profit = Number(payload.find((p) => p.dataKey === "profit")?.value || 0);
  const margin = sales ? (profit / sales) * 100 : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm text-slate-700">Sales: ${sales.toLocaleString()}</p>
      <p className="text-sm text-slate-700">Profit: ${profit.toLocaleString()}</p>
      <p className="text-xs text-slate-500">Mini trend: margin {margin.toFixed(1)}%</p>
    </div>
  );
}

/**
 * TopProductsChart
 * Purpose: Compare top 10 products by sales and profit in one grouped bar chart.
 */
function TopProductsChart({ data, onProductSelect, isDark = false, animationKey }) {
  return (
    <ChartContainer title="Top 10 Products by Sales/Profit" subtitle="Grouped bars reveal volume vs profitability mix — click a bar to drill down" isDark={isDark} animationKey={animationKey}>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 10 }} onClick={(state) => onProductSelect?.(state?.activePayload?.[0]?.payload?.product)}>
            <XAxis type="number" tick={{ fill: "#475569", fontSize: 11 }} />
            <YAxis dataKey="product" type="category" width={150} tick={{ fill: "#475569", fontSize: 11 }} />
            <Tooltip content={<ProductTooltip />} />
            <Bar dataKey="sales" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={650}>
              {data.map((_, idx) => (
                <Cell key={`sales-cell-${idx}`} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
              ))}
            </Bar>
            <Bar dataKey="profit" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={650}>
              {data.map((_, idx) => (
                <Cell key={`profit-cell-${idx}`} fill={BAR_COLORS[idx % BAR_COLORS.length]} opacity={0.55} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

export default TopProductsChart;
