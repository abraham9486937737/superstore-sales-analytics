import React from "react";
import {
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import ChartContainer from "./ChartContainer";

/**
 * CountrySalesBubbleChart
 * Purpose: Compare country sales, profit, and order volume in one interactive view.
 * Styling: Bubble size encodes order count with rich tooltip context.
 */
function CountrySalesBubbleChart({ data, isDark = false, animationKey }) {
  const tickColor = isDark ? "#94a3b8" : "#475569";
  return (
    <ChartContainer title="Country-wise Sales Bubble Chart" subtitle="X: Sales, Y: Profit, Bubble size: Orders" isDark={isDark} animationKey={animationKey}>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <XAxis dataKey="sales" name="Sales" tick={{ fill: tickColor, fontSize: 12 }} />
            <YAxis dataKey="profit" name="Profit" tick={{ fill: tickColor, fontSize: 12 }} />
            <ZAxis dataKey="orders" range={[60, 800]} name="Orders" />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              formatter={(value, name) => {
                if (name === "sales" || name === "profit") {
                  return [`$${Number(value).toLocaleString()}`, name];
                }
                return [Number(value).toLocaleString(), name];
              }}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.country || "Country"}
            />
            <Scatter data={data} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

export default CountrySalesBubbleChart;
