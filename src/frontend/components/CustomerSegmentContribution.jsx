import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ChartContainer from "./ChartContainer";

const COLORS = ["#0ea5e9", "#22c55e", "#8b5cf6", "#f97316", "#ef4444"];

/**
 * CustomerSegmentContribution
 * Purpose: Donut chart for customer segment contribution to sales.
 */
function CustomerSegmentContribution({ data, isDark = false, animationKey }) {
  return (
    <ChartContainer title="Customer Segment Contribution" subtitle="Donut chart of segment share in sales" isDark={isDark} animationKey={animationKey}>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="sales" nameKey="segment" innerRadius={70} outerRadius={120} paddingAngle={3}>
              {data.map((entry, index) => (
                <Cell key={`segment-${entry.segment}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

export default CustomerSegmentContribution;
