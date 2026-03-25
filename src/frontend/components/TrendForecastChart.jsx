import React from "react";
import { Area, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartContainer from "./ChartContainer";

/**
 * TrendForecastChart
 * Purpose: Show historical sales and short-range forecast for executive planning.
 * Styling: Dual-line visual (actual vs forecast) with clear line semantics.
 */
function TrendForecastChart({ data, isDark = false, animationKey }) {
  const tickColor = isDark ? "#94a3b8" : "#475569";
  return (
    <ChartContainer title="Trend Forecast" subtitle="Time-series projection using lightweight linear trend" isDark={isDark} animationKey={animationKey}>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="month" tick={{ fill: tickColor, fontSize: 12 }} />
            <YAxis tick={{ fill: tickColor, fontSize: 12 }} />
            <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
            <Area type="monotone" dataKey="ciUpper" stroke="none" fill="#fde68a" fillOpacity={0.45} name="CI Upper" />
            <Area type="monotone" dataKey="ciLower" stroke="none" fill="#fef3c7" fillOpacity={0.75} name="CI Lower" />
            <Line type="monotone" dataKey="sales" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 2 }} name="Actual" />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#f97316"
              strokeDasharray="6 4"
              strokeWidth={3}
              dot={{ r: 2 }}
              name="Forecast"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

export default TrendForecastChart;
