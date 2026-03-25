import React from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartContainer from "./ChartContainer";

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
            <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
            <Bar dataKey="sales" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
            <Bar dataKey="profit" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

export default TopProductsChart;
