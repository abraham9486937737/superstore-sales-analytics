import React from "react";
import {
  BadgePercent,
  ChartNoAxesCombined,
  CircleDollarSign,
  DollarSign,
  MapPinned,
  PackageSearch,
  ReceiptText,
  Target,
  TrendingDown,
} from "lucide-react";
import KPICard from "./KPICard";

/**
 * KPISection
 * Purpose: Render six-card KPI cockpit for executive monitoring.
 * Styling: Responsive card grid with consistent spacing and visual rhythm.
 */
function KPISection({ metrics, selectedKpi, onKpiSelect, isDark = false }) {
  const cards = [
    {
      title: "Total Sales",
      value: metrics.totalSales,
      subtitle: "Revenue in selected scope",
      gradient: "from-cyan-500 to-blue-600",
      icon: DollarSign,
      trend: metrics.trends?.totalSales,
    },
    {
      title: "Total Profit",
      value: metrics.totalProfit,
      subtitle: "Net gain after discounts",
      gradient: "from-violet-500 to-indigo-600",
      icon: CircleDollarSign,
      trend: metrics.trends?.totalProfit,
    },
    {
      title: "Profit Margin",
      value: metrics.profitMargin,
      subtitle: "Profitability quality",
      gradient: "from-orange-400 to-rose-500",
      icon: ChartNoAxesCombined,
      trend: metrics.trends?.profitMargin,
    },
    {
      title: "Orders",
      value: metrics.orders,
      subtitle: "Total orders in view",
      gradient: "from-fuchsia-500 to-violet-600",
      icon: ReceiptText,
      trend: metrics.trends?.orders,
    },
    {
      title: "Loss Orders",
      value: metrics.lossOrders,
      subtitle: "Orders with negative profit",
      gradient: "from-rose-500 to-red-600",
      icon: TrendingDown,
      trend: metrics.trends?.lossOrders,
    },
    {
      title: "Avg Discount",
      value: metrics.avgDiscount,
      subtitle: "Pricing pressure indicator",
      gradient: "from-sky-500 to-cyan-600",
      icon: BadgePercent,
      trend: metrics.trends?.avgDiscount,
    },
    {
      title: "Top Performing Product",
      value: metrics.topProduct,
      subtitle: "Highest sales product",
      gradient: "from-emerald-500 to-teal-600",
      icon: Target,
    },
    {
      title: "Weak Performing Product",
      value: metrics.weakProduct,
      subtitle: "Lowest profit product",
      gradient: "from-rose-500 to-red-600",
      icon: PackageSearch,
    },
    {
      title: "Target Customer Segment",
      value: metrics.targetSegment,
      subtitle: "Best conversion segment",
      gradient: "from-amber-500 to-orange-600",
      icon: ChartNoAxesCombined,
    },
    {
      title: "Target Region",
      value: metrics.targetRegion,
      subtitle: "Highest profit region",
      gradient: "from-blue-600 to-cyan-600",
      icon: MapPinned,
    },
    {
      title: "Target Category/Sub-Category",
      value: metrics.targetCategorySubCategory,
      subtitle: "Most valuable product pocket",
      gradient: "from-indigo-500 to-violet-600",
      icon: Target,
    },
  ];

  return (
    <section>
      <h2 className={`mb-3 text-4xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>KPI Cockpit</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {cards.map((card) => (
          <KPICard
            key={card.title}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            gradient={card.gradient}
            icon={card.icon}
            trend={card.trend}
            isActive={selectedKpi === card.title}
            onClick={() => onKpiSelect?.(card.title)}
                     isDark={isDark}
          />
        ))}
      </div>
    </section>
  );
}

export default KPISection;
