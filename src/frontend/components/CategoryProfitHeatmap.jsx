import React, { useMemo } from "react";
import ChartContainer from "./ChartContainer";

/**
 * CategoryProfitHeatmap
 * Purpose: Visualize category vs sub-category profit density as a heatmap grid.
 * Styling: Color-intensity cells with native tooltips for quick scan and drill-in.
 */
function CategoryProfitHeatmap({ data, isDark = false, animationKey }) {
  const grouped = useMemo(() => {
    const buckets = {};
    data.forEach((row) => {
      const key = `${row.category}||${row.subCategory}`;
      if (!buckets[key]) {
        buckets[key] = { category: row.category, subCategory: row.subCategory, profit: 0 };
      }
      buckets[key].profit += row.profit;
    });
    return Object.values(buckets);
  }, [data]);

  const maxAbs = useMemo(() => Math.max(...grouped.map((x) => Math.abs(x.profit)), 1), [grouped]);

  const colorFor = (value) => {
    const intensity = Math.min(Math.abs(value) / maxAbs, 1);
    if (value >= 0) {
      return `rgba(16,185,129,${0.2 + intensity * 0.7})`;
    }
    return `rgba(239,68,68,${0.2 + intensity * 0.7})`;
  };

  return (
    <ChartContainer title="Category vs Profit Heatmap" subtitle="Green cells indicate profitable pockets; red cells indicate leakage" isDark={isDark} animationKey={animationKey}>
      <div className="grid max-h-80 grid-cols-2 gap-2 overflow-auto pr-1 sm:grid-cols-3 xl:grid-cols-4">
        {grouped.map((cell) => (
          <div
            key={`${cell.category}-${cell.subCategory}`}
            className="rounded-lg border border-white/40 p-2 text-xs text-slate-800"
            style={{ backgroundColor: colorFor(cell.profit) }}
            title={`${cell.category} / ${cell.subCategory}: $${cell.profit.toLocaleString()}`}
          >
            <p className="font-semibold">{cell.category}</p>
            <p className="truncate">{cell.subCategory}</p>
            <p className="mt-1 font-bold">${cell.profit.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </ChartContainer>
  );
}

export default CategoryProfitHeatmap;
