import React, { useMemo } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartContainer from "./ChartContainer";

const CATEGORY_COLORS = ["#0ea5e9", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#14b8a6", "#ec4899", "#3b82f6", "#f97316", "#6366f1", "#84cc16", "#eab308"];

function numberLabel(value) {
  return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function moneyLabel(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function CategoryRegionStudio({ data = [], isDark = false, animationKey }) {
  const categoryRows = useMemo(() => {
    const grouped = {};
    data.forEach((row) => {
      if (!grouped[row.category]) {
        grouped[row.category] = { category: row.category, sales: 0, profit: 0 };
      }
      grouped[row.category].sales += Number(row.sales) || 0;
      grouped[row.category].profit += Number(row.profit) || 0;
    });
    return Object.values(grouped).sort((a, b) => b.sales - a.sales);
  }, [data]);

  const regionRows = useMemo(() => {
    const grouped = {};
    data.forEach((row) => {
      if (!grouped[row.region]) {
        grouped[row.region] = { region: row.region, sales: 0, profit: 0 };
      }
      grouped[row.region].sales += Number(row.sales) || 0;
      grouped[row.region].profit += Number(row.profit) || 0;
    });
    return Object.values(grouped).sort((a, b) => b.sales - a.sales);
  }, [data]);

  const segmentRows = useMemo(() => {
    const grouped = {};
    data.forEach((row) => {
      if (!grouped[row.segment]) {
        grouped[row.segment] = { segment: row.segment, sales: 0, profit: 0 };
      }
      grouped[row.segment].sales += Number(row.sales) || 0;
      grouped[row.segment].profit += Number(row.profit) || 0;
    });
    return Object.values(grouped).sort((a, b) => b.sales - a.sales);
  }, [data]);

  const tableTheme = isDark
    ? "border-slate-700 bg-slate-900/70 text-slate-200"
    : "border-slate-200 bg-white text-slate-700";

  return (
    <div className="mt-6 space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartContainer
          title="Category Sales vs Profit"
          subtitle="Compare revenue and profitability by category"
          isDark={isDark}
          animationKey={animationKey}
        >
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryRows}>
                <XAxis dataKey="category" tick={{ fill: isDark ? "#cbd5e1" : "#475569", fontSize: 12 }} />
                <YAxis tickFormatter={numberLabel} tick={{ fill: isDark ? "#cbd5e1" : "#475569", fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [moneyLabel(value), name]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    color: isDark ? "#e2e8f0" : "#1e293b",
                  }}
                />
                <Bar dataKey="sales" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={700}>
                  {categoryRows.map((_, idx) => (
                    <Cell key={`category-sales-${idx}`} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
                <Bar dataKey="profit" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={700}>
                  {categoryRows.map((_, idx) => (
                    <Cell key={`category-profit-${idx}`} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} opacity={0.5} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        <ChartContainer
          title="Sales by Region"
          subtitle="Ranking of regions by sales volume"
          isDark={isDark}
          animationKey={animationKey}
        >
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionRows}>
                <XAxis dataKey="region" angle={-25} textAnchor="end" height={70} tick={{ fill: isDark ? "#cbd5e1" : "#475569", fontSize: 11 }} />
                <YAxis tickFormatter={numberLabel} tick={{ fill: isDark ? "#cbd5e1" : "#475569", fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [moneyLabel(value), name]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    color: isDark ? "#e2e8f0" : "#1e293b",
                  }}
                />
                <Bar dataKey="sales" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={700}>
                  {regionRows.map((_, idx) => (
                    <Cell key={`region-sales-${idx}`} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </div>

      <ChartContainer
        title="Performance Tables"
        subtitle="Category and segment rollups used in the studio"
        isDark={isDark}
        animationKey={`${animationKey}-tables`}
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <div className={`overflow-hidden rounded-xl border ${tableTheme}`}>
            <table className="w-full text-sm">
              <thead className={isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}>
                <tr>
                  <th className="px-3 py-2 text-left">category</th>
                  <th className="px-3 py-2 text-right">sales</th>
                  <th className="px-3 py-2 text-right">profit</th>
                </tr>
              </thead>
              <tbody>
                {categoryRows.map((row) => (
                  <tr key={row.category} className={isDark ? "border-t border-slate-700" : "border-t border-slate-200"}>
                    <td className="px-3 py-2">{row.category}</td>
                    <td className="px-3 py-2 text-right">{numberLabel(row.sales)}</td>
                    <td className="px-3 py-2 text-right">{Number(row.profit).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={`overflow-hidden rounded-xl border ${tableTheme}`}>
            <table className="w-full text-sm">
              <thead className={isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}>
                <tr>
                  <th className="px-3 py-2 text-left">segment</th>
                  <th className="px-3 py-2 text-right">sales</th>
                  <th className="px-3 py-2 text-right">profit</th>
                </tr>
              </thead>
              <tbody>
                {segmentRows.map((row) => (
                  <tr key={row.segment} className={isDark ? "border-t border-slate-700" : "border-t border-slate-200"}>
                    <td className="px-3 py-2">{row.segment}</td>
                    <td className="px-3 py-2 text-right">{numberLabel(row.sales)}</td>
                    <td className="px-3 py-2 text-right">{Number(row.profit).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ChartContainer>
    </div>
  );
}

export default CategoryRegionStudio;