import React from "react";
import ChartContainer from "./ChartContainer";

/**
 * CorrelationMatrix
 * Purpose: Display KPI correlations as a compact heatmap matrix.
 */
function CorrelationMatrix({ matrix, isDark = false, animationKey }) {
  const labels = Object.keys(matrix || {});

  const colorFor = (value) => {
    const clamped = Math.max(-1, Math.min(1, value || 0));
    if (clamped >= 0) {
      return `rgba(16,185,129,${0.2 + clamped * 0.75})`;
    }
    return `rgba(239,68,68,${0.2 + Math.abs(clamped) * 0.75})`;
  };

  return (
    <ChartContainer title="Correlation Matrix" subtitle="Green: positive correlation, Red: negative correlation" isDark={isDark} animationKey={animationKey}>
      <div className="overflow-auto">
        <div className="grid min-w-[480px]" style={{ gridTemplateColumns: `140px repeat(${labels.length}, minmax(80px, 1fr))` }}>
          <div className="p-2 text-xs font-semibold text-slate-600">Metric</div>
          {labels.map((col) => (
            <div key={`h-${col}`} className="p-2 text-xs font-semibold text-slate-600">
              {col}
            </div>
          ))}
          {labels.map((row) => (
            <React.Fragment key={`r-${row}`}>
              <div className="p-2 text-xs font-semibold text-slate-700">{row}</div>
              {labels.map((col) => {
                const value = matrix[row]?.[col] ?? 0;
                return (
                  <div
                    key={`${row}-${col}`}
                    className="m-1 rounded p-2 text-center text-xs font-semibold text-slate-900"
                    style={{ backgroundColor: colorFor(value) }}
                    title={`${row} vs ${col}: ${value.toFixed(2)}`}
                  >
                    {value.toFixed(2)}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </ChartContainer>
  );
}

export default CorrelationMatrix;
