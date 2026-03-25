import React from "react";
import {
  BarChart3,
  BookOpenText,
  BrainCircuit,
  CircleDollarSign,
  FlaskConical,
  LayoutDashboard,
  LineChart,
  MessageSquare,
  Table2,
  Truck,
  TrendingDown,
  Users,
} from "lucide-react";

/**
 * NavigationTabs
 * Purpose: Top-level dashboard navigation for four analysis workspaces.
 * Styling: Pill buttons with active gradient state and smooth transitions.
 */
function NavigationTabs({ activeTab, onTabChange, isDark = false }) {
  const tabs = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Profit Leakage Lab", icon: TrendingDown },
    { label: "Category & Region Studio", icon: BarChart3 },
    { label: "Trend Analysis", icon: LineChart },
    { label: "Statistical Insights", icon: FlaskConical },
    { label: "Predictions & Forecasts", icon: BrainCircuit },
    { label: "Storytelling & Takeaways", icon: BookOpenText },
    { label: "Financial Strength Dashboard", icon: CircleDollarSign },
    { label: "Customer & Product Focus", icon: Users },
    { label: "Shipping Mode Analysis", icon: Truck },
    { label: "Data Grid View", icon: Table2 },
    { label: "Feedback", icon: MessageSquare },
  ];

  return (
    <nav
      className={`sticky top-20 z-10 mb-5 flex flex-wrap gap-2 rounded-2xl border p-2 backdrop-blur-md ${
        isDark
          ? "border-slate-700/60 bg-slate-900/70"
          : "border-white/30 bg-white/55"
      }`}
      aria-label="Dashboard navigation tabs"
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.label;
        const Icon = tab.icon;

        return (
          <button
            key={tab.label}
            type="button"
            onClick={() => onTabChange(tab.label)}
            aria-pressed={active}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 sm:px-5 sm:text-sm ${
              active
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                : isDark
                ? "bg-slate-800/80 text-slate-300 hover:scale-105 hover:bg-slate-700 hover:text-cyan-300"
                : "bg-white/85 text-slate-700 hover:scale-105 hover:bg-white hover:text-blue-700"
            }`}
          >
            <Icon size={15} />
            <span>{tab.label}</span>
            {active && <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />}
          </button>
        );
      })}
    </nav>
  );
}

export default NavigationTabs;
