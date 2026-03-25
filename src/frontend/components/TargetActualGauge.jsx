import React from "react";
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import ChartContainer from "./ChartContainer";

/**
 * TargetActualGauge
 * Purpose: Gauge-style visual for target vs actual sales attainment.
 */
function TargetActualGauge({ actual, target, isDark = false, animationKey }) {
  const pct = target > 0 ? Math.min((actual / target) * 100, 160) : 0;
  const data = [{ name: "achievement", value: pct, fill: pct >= 100 ? "#22c55e" : "#3b82f6" }];

  return (
    <ChartContainer title="Target vs Actual Performance" subtitle={`Actual ${pct.toFixed(1)}% of target`} isDark={isDark} animationKey={animationKey}>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="55%" innerRadius="35%" outerRadius="85%" barSize={24} data={data} startAngle={180} endAngle={0}>
            <PolarAngleAxis type="number" domain={[0, 160]} tick={false} />
            <RadialBar background clockWise dataKey="value" cornerRadius={12} />
            <text x="50%" y="60%" textAnchor="middle" className="fill-slate-800 text-lg font-bold">
              {pct.toFixed(1)}%
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

export default TargetActualGauge;
