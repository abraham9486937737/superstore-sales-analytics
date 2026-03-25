import React from "react";
import ChartContainer from "./ChartContainer";

/**
 * ImprovementOpportunities
 * Purpose: Highlight weak products/customers/regions and provide recommendation cues.
 */
function ImprovementOpportunities({ items, isDark = false, animationKey }) {
  return (
    <ChartContainer title="Improvement Opportunities" subtitle="Weak pockets prioritized for management action" isDark={isDark} animationKey={animationKey}>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-xl border border-rose-200 bg-rose-50/80 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">{item.title}</p>
            <p className="mt-1 text-sm font-bold text-slate-800">{item.value}</p>
            <p className="mt-1 text-xs text-slate-600">{item.note}</p>
          </div>
        ))}
      </div>
    </ChartContainer>
  );
}

export default ImprovementOpportunities;
