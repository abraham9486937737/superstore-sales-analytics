import React from "react";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartContainer from "./ChartContainer";

/**
 * ShippingModePerformance
 * Purpose: Show shipping mode performance by sales and profit using stacked bars.
 */
function ShippingModePerformance({ data, isDark = false, animationKey }) {
  const tickColor = isDark ? "#94a3b8" : "#475569";
  return (
    <ChartContainer title="Shipping Mode Performance" subtitle="Stacked view of sales and profit by shipping strategy" isDark={isDark} animationKey={animationKey}>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="shipMode" tick={{ fill: tickColor, fontSize: 11 }} />
            <YAxis tick={{ fill: tickColor, fontSize: 11 }} />
            <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
            <Legend />
            <Bar dataKey="sales" stackId="a" fill="#22c55e" radius={[6, 6, 0, 0]} />
            <Bar dataKey="profit" stackId="a" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

export default ShippingModePerformance;
