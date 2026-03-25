import React, { useEffect, useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import { motion } from "framer-motion";
import { BarChart3, Sparkles } from "lucide-react";
import SidebarFilters from "./components/SidebarFilters";
import DashboardLayout from "./components/DashboardLayout";
import KPISection from "./components/KPISection";
import NavigationTabs from "./components/NavigationTabs";
import SalesChart from "./components/SalesChart";
import ProfitChart from "./components/ProfitChart";
import CategoryProfitHeatmap from "./components/CategoryProfitHeatmap";
import CountrySalesBubbleChart from "./components/CountrySalesBubbleChart";
import TrendForecastChart from "./components/TrendForecastChart";
import StatisticalDistribution from "./components/StatisticalDistribution";
import StorytellingTimeline from "./components/StorytellingTimeline";
import ExportToolbar from "./components/ExportToolbar";
import TopProductsChart from "./components/TopProductsChart";
import DataGridView from "./components/DataGridView";
import FeedbackForm from "./components/FeedbackForm";
import ShippingModePerformance from "./components/ShippingModePerformance";
import CustomerSegmentContribution from "./components/CustomerSegmentContribution";
import CorrelationMatrix from "./components/CorrelationMatrix";
import TargetActualGauge from "./components/TargetActualGauge";
import ImprovementOpportunities from "./components/ImprovementOpportunities";
import { mockSuperstoreData } from "./data/mockSuperstoreData";
import { formatCurrency, formatPercent, monthLabel } from "./utils/formatters";

function App() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadMessage, setLoadMessage] = useState("Loading SuperStore data...");
  const [activeTab, setActiveTab] = useState("Overview");
  const [isDark, setIsDark] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState("Total Sales");

  const [selectedRange, setSelectedRange] = useState({ startDate: "2014-01-01", endDate: "2014-12-31" });
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [selectedShipModes, setSelectedShipModes] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [yearWindow, setYearWindow] = useState([2011, 2014]);
  const [discountRange, setDiscountRange] = useState([0, 1]);

  const dashboardRef = useRef(null);

  useEffect(() => {
    let alive = true;

    async function loadData() {
      try {
        const response = await fetch("/SuperStoreOrders_SuperStoreOrders.csv");
        if (!response.ok) {
          throw new Error("CSV unavailable");
        }

        const csvText = await response.text();
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            if (!alive) {
              return;
            }
            const parsed = result.data
              .map((row, index) => normalizeRowFromCsv(row, index))
              .filter(Boolean);

            if (parsed.length) {
              setRawData(parsed);
              setLoadMessage("Live CSV data loaded.");
            } else {
              setRawData(enrichMockRows(mockSuperstoreData));
              setLoadMessage("CSV had insufficient columns. Using enriched fallback data.");
            }
            setLoading(false);
          },
          error: () => {
            if (!alive) {
              return;
            }
            setRawData(enrichMockRows(mockSuperstoreData));
            setLoadMessage("CSV parse issue. Using enriched fallback data.");
            setLoading(false);
          },
        });
      } catch {
        if (!alive) {
          return;
        }
        setRawData(enrichMockRows(mockSuperstoreData));
        setLoadMessage("CSV unavailable. Using enriched fallback data.");
        setLoading(false);
      }
    }

    loadData();

    return () => {
      alive = false;
    };
  }, []);

  const dateBounds = useMemo(() => {
    if (!rawData.length) {
      return { minDate: "2011-01-01", maxDate: "2014-12-31" };
    }
    const sorted = [...rawData].sort((a, b) => a.date.localeCompare(b.date));
    return { minDate: sorted[0].date, maxDate: sorted[sorted.length - 1].date };
  }, [rawData]);

  const regions = useMemo(() => uniqueValues(rawData, "region"), [rawData]);
  const countries = useMemo(() => uniqueValues(rawData, "country"), [rawData]);
  const categories = useMemo(() => uniqueValues(rawData, "category"), [rawData]);
  const subCategories = useMemo(() => uniqueValues(rawData, "subCategory"), [rawData]);
  const products = useMemo(() => uniqueValues(rawData, "product"), [rawData]);
  const segments = useMemo(() => uniqueValues(rawData, "segment"), [rawData]);
  const shipModes = useMemo(() => uniqueValues(rawData, "shipMode"), [rawData]);
  const years = useMemo(() => uniqueValues(rawData, "year").map(Number).sort((a, b) => a - b), [rawData]);

  useEffect(() => {
    if (!rawData.length) {
      return;
    }
    setSelectedRange((prev) => ({ startDate: prev.startDate || dateBounds.minDate, endDate: prev.endDate || dateBounds.maxDate }));
    if (!selectedRegions.length) setSelectedRegions(regions);
    if (!selectedCountries.length) setSelectedCountries(countries);
    if (!selectedCategories.length) setSelectedCategories(categories);
    if (!selectedSubCategories.length) setSelectedSubCategories(subCategories);
    if (!selectedProducts.length) setSelectedProducts(products);
    if (!selectedSegments.length) setSelectedSegments(segments);
    if (!selectedShipModes.length) setSelectedShipModes(shipModes);
    if (!selectedYears.length && years.length) {
      setSelectedYears(years);
      setYearWindow([years[0], years[years.length - 1]]);
    }
  }, [
    rawData,
    dateBounds.maxDate,
    dateBounds.minDate,
    regions,
    countries,
    categories,
    subCategories,
    products,
    segments,
    shipModes,
    years,
    selectedRegions.length,
    selectedCountries.length,
    selectedCategories.length,
    selectedSubCategories.length,
    selectedProducts.length,
    selectedSegments.length,
    selectedShipModes.length,
    selectedYears.length,
  ]);

  const filteredData = useMemo(() => {
    const minYear = Math.min(yearWindow[0], yearWindow[1]);
    const maxYear = Math.max(yearWindow[0], yearWindow[1]);
    const minDiscount = Math.min(discountRange[0], discountRange[1]);
    const maxDiscount = Math.max(discountRange[0], discountRange[1]);

    return rawData.filter((row) => {
      const rowDate = new Date(row.date);
      const inDate = rowDate >= new Date(selectedRange.startDate) && rowDate <= new Date(selectedRange.endDate);
      return (
        inDate &&
        (!selectedRegions.length || selectedRegions.includes(row.region)) &&
        (!selectedCountries.length || selectedCountries.includes(row.country)) &&
        (!selectedCategories.length || selectedCategories.includes(row.category)) &&
        (!selectedSubCategories.length || selectedSubCategories.includes(row.subCategory)) &&
        (!selectedProducts.length || selectedProducts.includes(row.product)) &&
        (!selectedSegments.length || selectedSegments.includes(row.segment)) &&
        (!selectedShipModes.length || selectedShipModes.includes(row.shipMode)) &&
        (!selectedYears.length || selectedYears.includes(row.year)) &&
        row.year >= minYear &&
        row.year <= maxYear &&
        row.discount >= minDiscount &&
        row.discount <= maxDiscount
      );
    });
  }, [
    rawData,
    selectedRange,
    selectedRegions,
    selectedCountries,
    selectedCategories,
    selectedSubCategories,
    selectedProducts,
    selectedSegments,
    selectedShipModes,
    selectedYears,
    yearWindow,
    discountRange,
  ]);

  const monthlyData = useMemo(() => {
    const grouped = {};
    filteredData.forEach((row) => {
      const key = row.date.slice(0, 7);
      if (!grouped[key]) {
        grouped[key] = { key, month: monthLabel(row.date), sales: 0, salesTrend: 0, profit: 0 };
      }
      grouped[key].sales += row.sales;
      grouped[key].salesTrend += row.sales;
      grouped[key].profit += row.profit;
    });
    return Object.values(grouped).sort((a, b) => a.key.localeCompare(b.key));
  }, [filteredData]);

  const metrics = useMemo(() => {
    const totalSalesValue = sum(filteredData, "sales");
    const totalProfitValue = sum(filteredData, "profit");
    const avgDiscountValue = filteredData.length ? sum(filteredData, "discount") / filteredData.length : 0;
    const lossOrders = filteredData.filter((row) => row.profit < 0).length;

    const topProduct = topBy(filteredData, "product", "sales");
    const weakProduct = bottomBy(filteredData, "product", "profit");
    const targetSegment = topBy(filteredData, "segment", "profit");
    const targetRegion = topBy(filteredData, "region", "profit");
    const targetCategorySubCategory = topCategorySubCategory(filteredData);
    const trends = buildMetricTrends(monthlyData);

    return {
      totalSales: formatCurrency(totalSalesValue),
      totalProfit: formatCurrency(totalProfitValue),
      profitMargin: formatPercent(totalSalesValue ? totalProfitValue / totalSalesValue : 0),
      orders: filteredData.length.toLocaleString(),
      lossOrders: lossOrders.toLocaleString(),
      avgDiscount: formatPercent(avgDiscountValue),
      topProduct,
      weakProduct,
      targetSegment,
      targetRegion,
      targetCategorySubCategory,
      trends,
      totalSalesValue,
      totalProfitValue,
      lossOrdersValue: lossOrders,
    };
  }, [filteredData, monthlyData]);

  const countryBubble = useMemo(() => groupForBubble(filteredData), [filteredData]);
  const topProducts = useMemo(() => groupProducts(filteredData), [filteredData]);
  const topCustomers = useMemo(() => groupCustomers(filteredData).slice(0, 10), [filteredData]);
  const weakCustomers = useMemo(() => [...groupCustomers(filteredData)].sort((a, b) => a.profit - b.profit).slice(0, 8), [filteredData]);
  const shippingPerformance = useMemo(() => groupShipping(filteredData), [filteredData]);
  const segmentContribution = useMemo(() => groupSegment(filteredData), [filteredData]);
  const correlationMatrix = useMemo(() => buildCorrelationMatrix(filteredData), [filteredData]);

  const forecastData = useMemo(() => {
    if (!monthlyData.length) {
      return [];
    }
    const n = monthlyData.length;
    const xAvg = (n - 1) / 2;
    const yAvg = sum(monthlyData, "sales") / n;
    let num = 0;
    let den = 0;
    monthlyData.forEach((row, idx) => {
      num += (idx - xAvg) * (row.sales - yAvg);
      den += (idx - xAvg) ** 2;
    });
    const slope = den ? num / den : 0;
    const intercept = yAvg - slope * xAvg;
    const residualStd = Math.sqrt(
      monthlyData.reduce((acc, row, idx) => {
        const pred = slope * idx + intercept;
        return acc + (row.sales - pred) ** 2;
      }, 0) / n
    );

    const historical = monthlyData.map((row, idx) => {
      const forecast = slope * idx + intercept;
      return {
        ...row,
        forecast,
        ciUpper: forecast + 1.96 * residualStd,
        ciLower: Math.max(0, forecast - 1.96 * residualStd),
      };
    });

    const tail = [];
    const lastDate = new Date(`${monthlyData[monthlyData.length - 1].key}-01`);
    for (let i = 1; i <= 6; i += 1) {
      const date = new Date(lastDate);
      date.setMonth(date.getMonth() + i);
      const idx = n + i - 1;
      const forecast = Math.max(0, slope * idx + intercept);
      tail.push({
        month: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        sales: null,
        forecast,
        ciUpper: forecast + 1.96 * residualStd,
        ciLower: Math.max(0, forecast - 1.96 * residualStd),
      });
    }
    return [...historical, ...tail];
  }, [monthlyData]);

  const histogram = useMemo(() => buildHistogram(filteredData.map((x) => x.profit), 12), [filteredData]);
  const stats = useMemo(() => buildStats(filteredData.map((x) => x.profit)), [filteredData]);

  const milestones = useMemo(() => {
    if (!monthlyData.length) {
      return [];
    }
    const bestSales = [...monthlyData].sort((a, b) => b.sales - a.sales)[0];
    const worstProfit = [...monthlyData].sort((a, b) => a.profit - b.profit)[0];
    const next = forecastData[forecastData.length - 1];
    return [
      { date: bestSales.month, title: "Peak Sales Milestone", note: `Highest monthly sales reached ${formatCurrency(bestSales.sales)}.` },
      { date: worstProfit.month, title: "Leakage Alert", note: `Lowest monthly profit observed at ${formatCurrency(worstProfit.profit)}.` },
      { date: next?.month || "Forecast", title: "Projected Trajectory", note: `Projected monthly sales around ${formatCurrency(next?.forecast || 0)}.` },
    ];
  }, [monthlyData, forecastData]);

  const opportunities = useMemo(
    () => [
      {
        title: "Weak Product",
        value: metrics.weakProduct,
        note: "Review pricing and discount strategy for this product family.",
      },
      {
        title: "Weak Region",
        value: bottomBy(filteredData, "region", "profit"),
        note: "Regional execution and assortment optimization needed.",
      },
      {
        title: "Weak Segment",
        value: weakCustomers[0]?.customer || "N/A",
        note: "Customer profitability recovery plan recommended.",
      },
    ],
    [filteredData, metrics.weakProduct, weakCustomers]
  );

  const shippingSummary = useMemo(() => {
    if (!shippingPerformance.length) {
      return { best: "N/A", worst: "N/A" };
    }
    const sorted = [...shippingPerformance].sort((a, b) => b.profit - a.profit);
    return {
      best: sorted[0]?.shipMode || "N/A",
      worst: sorted[sorted.length - 1]?.shipMode || "N/A",
    };
  }, [shippingPerformance]);

  const regionFocus = useMemo(() => {
    const grouped = aggregate(filteredData, "region");
    return Object.entries(grouped)
      .map(([region, v]) => ({ region, sales: v.sales, profit: v.profit }))
      .sort((a, b) => b.profit - a.profit);
  }, [filteredData]);

  const kpiDrilldown = useMemo(() => {
    switch (selectedKpi) {
      case "Total Profit":
        return `Top profit driver is ${topBy(filteredData, "category", "profit")}.`;
      case "Profit Margin":
        return `Margin sits at ${metrics.profitMargin}; optimize discount-heavy orders for lift.`;
      case "Orders":
        return `Order concentration is highest in ${topBy(filteredData, "country", "count")}.`;
      case "Loss Orders":
        return `Loss risk clusters in ${bottomBy(filteredData, "category", "profit")}.`;
      case "Avg Discount":
        return `Average discount is ${metrics.avgDiscount}; monitor approvals over 20%.`;
      case "Top Performing Product":
        return `${metrics.topProduct} is leading revenue growth.`;
      case "Weak Performing Product":
        return `${metrics.weakProduct} needs corrective action.`;
      case "Target Customer Segment":
        return `${metrics.targetSegment} is the priority segment for scaling.`;
      case "Target Region":
        return `${metrics.targetRegion} is currently the strongest profit region.`;
      case "Target Category/Sub-Category":
        return `${metrics.targetCategorySubCategory} is the highest value pocket to scale.`;
      default:
        return `Sales leadership currently belongs to ${topBy(filteredData, "category", "sales")}.`;
    }
  }, [selectedKpi, filteredData, metrics]);

  const handleClearAll = () => {
    setSelectedRange({ startDate: dateBounds.minDate, endDate: dateBounds.maxDate });
    setSelectedRegions(regions);
    setSelectedCountries(countries);
    setSelectedCategories(categories);
    setSelectedSubCategories(subCategories);
    setSelectedProducts(products);
    setSelectedSegments(segments);
    setSelectedShipModes(shipModes);
    setSelectedYears(years);
    setYearWindow([years[0] || 2011, years[years.length - 1] || 2014]);
    setDiscountRange([0, 1]);
  };

  const handlePresetApply = (preset) => {
    if (preset === "last12") {
      const endDate = dateBounds.maxDate;
      const end = new Date(endDate);
      const start = new Date(end);
      start.setMonth(start.getMonth() - 12);
      setSelectedRange({ startDate: start.toISOString().slice(0, 10), endDate });
      return;
    }

    if (preset === "top10products") {
      setSelectedProducts(topProducts.map((item) => item.product));
      return;
    }

    if (preset === "highdiscount") {
      setDiscountRange([0.2, 1]);
    }
  };

  const appliedFilterChips = useMemo(() => {
    const chips = [];
    if (selectedRegions.length && selectedRegions.length !== regions.length) {
      selectedRegions.slice(0, 3).forEach((value) => chips.push({ key: `region-${value}`, label: `Region: ${value}`, onRemove: () => setSelectedRegions((prev) => prev.filter((item) => item !== value)) }));
    }
    if (selectedCategories.length && selectedCategories.length !== categories.length) {
      selectedCategories.slice(0, 3).forEach((value) => chips.push({ key: `category-${value}`, label: `Category: ${value}`, onRemove: () => setSelectedCategories((prev) => prev.filter((item) => item !== value)) }));
    }
    if (selectedProducts.length && selectedProducts.length !== products.length) {
      selectedProducts.slice(0, 3).forEach((value) => chips.push({ key: `product-${value}`, label: `Product: ${value}`, onRemove: () => setSelectedProducts((prev) => prev.filter((item) => item !== value)) }));
    }
    if (selectedShipModes.length && selectedShipModes.length !== shipModes.length) {
      selectedShipModes.slice(0, 2).forEach((value) => chips.push({ key: `ship-${value}`, label: `Ship: ${value}`, onRemove: () => setSelectedShipModes((prev) => prev.filter((item) => item !== value)) }));
    }
    if (discountRange[0] > 0 || discountRange[1] < 1) {
      chips.push({ key: "discount-range", label: `Discount: ${Math.round(discountRange[0] * 100)}%-${Math.round(discountRange[1] * 100)}%`, onRemove: () => setDiscountRange([0, 1]) });
    }
    return chips;
  }, [selectedRegions, selectedCategories, selectedProducts, selectedShipModes, discountRange, regions.length, categories.length, products.length, shipModes.length]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-blue-100 to-fuchsia-100 p-8">
        <div className="rounded-2xl border border-white/40 bg-white/80 px-8 py-6 text-lg font-semibold text-slate-700 shadow-float">
          {loadMessage}
        </div>
      </main>
    );
  }

  const sidebar = (
    <FilterPanel
      minDate={dateBounds.minDate}
      maxDate={dateBounds.maxDate}
      selectedRange={selectedRange}
      setSelectedRange={setSelectedRange}
      regionOptions={regions}
      countryOptions={countries}
      categoryOptions={categories}
      subCategoryOptions={subCategories}
      productOptions={products}
      segmentOptions={segments}
      shipModeOptions={shipModes}
      yearOptions={years}
      selectedRegions={selectedRegions}
      selectedCountries={selectedCountries}
      selectedCategories={selectedCategories}
      selectedSubCategories={selectedSubCategories}
      selectedProducts={selectedProducts}
      selectedSegments={selectedSegments}
      selectedShipModes={selectedShipModes}
      selectedYears={selectedYears}
      yearWindow={yearWindow}
      discountRange={discountRange}
      setSelectedRegions={setSelectedRegions}
      setSelectedCountries={setSelectedCountries}
      setSelectedCategories={setSelectedCategories}
      setSelectedSubCategories={setSelectedSubCategories}
      setSelectedProducts={setSelectedProducts}
      setSelectedSegments={setSelectedSegments}
      setSelectedShipModes={setSelectedShipModes}
      setSelectedYears={setSelectedYears}
      setYearWindow={setYearWindow}
      setDiscountRange={setDiscountRange}
      onPresetApply={handlePresetApply}
      onClearAll={handleClearAll}
      isDark={isDark}
    />
  );

  const header = (
    <motion.header initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-indigo-600 text-white shadow-lg">
          <BarChart3 size={24} />
        </div>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? "text-cyan-300" : "text-blue-700"}`}>Abu Analytics</p>
          <div className="flex items-center gap-2">
            <h1 className="bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl lg:text-5xl">
              SuperStore Analytics Dashboard
            </h1>
          </div>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.45 }} className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${isDark ? "bg-slate-800 text-cyan-300" : "bg-blue-50 text-blue-700"}`}>
        <Sparkles size={15} /> From Data to Decisions
      </motion.div>
      <p className={`mt-3 text-base sm:text-lg ${isDark ? "text-slate-300" : "text-slate-600"}`}>
        End-to-end EDA, forecasting, and executive storytelling for decision-making.
      </p>
      <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{loadMessage}</p>
    </motion.header>
  );

  const rightActions = <ExportToolbar filteredRows={filteredData} exportElementRef={dashboardRef} />;

  return (
    <DashboardLayout
      sidebar={sidebar}
      header={header}
      isDark={isDark}
      onToggleTheme={() => setIsDark((prev) => !prev)}
      rightActions={rightActions}
      contentRef={dashboardRef}
    >
      {appliedFilterChips.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600 shadow-sm transition-all hover:scale-105 hover:bg-rose-100"
            aria-label="Clear all filters"
          >
            ✕ Clear All Filters
          </button>
          {appliedFilterChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              aria-label={`Remove filter: ${chip.label}`}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-all hover:scale-105 ${
                isDark
                  ? "border-cyan-700 bg-cyan-950/60 text-cyan-200 hover:bg-cyan-900"
                  : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              {chip.label} <span aria-hidden="true" className="ml-0.5 opacity-70">×</span>
            </button>
          ))}
        </div>
      )}
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} isDark={isDark} />
      <KPISection metrics={metrics} selectedKpi={selectedKpi} onKpiSelect={setSelectedKpi} isDark={isDark} />
      <div className={`mt-4 rounded-xl border p-3 text-sm ${isDark ? "border-slate-700 bg-slate-800/70 text-slate-200" : "border-blue-100 bg-blue-50 text-slate-700"}`}>
        KPI Drill-down: {kpiDrilldown}
      </div>

      {activeTab === "Overview" && (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <SalesChart data={monthlyData} isDark={isDark} animationKey={activeTab} />
          <ProfitChart data={monthlyData} isDark={isDark} animationKey={activeTab} />
          <TopProductsChart data={topProducts} onProductSelect={(product) => product && setSelectedProducts([product])} isDark={isDark} animationKey={activeTab} />
          <CustomerSegmentContribution data={segmentContribution} isDark={isDark} animationKey={activeTab} />
        </div>
      )}

      {activeTab === "Profit Leakage Lab" && (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <CategoryProfitHeatmap data={filteredData} isDark={isDark} animationKey={activeTab} />
          <StatisticalDistribution histogram={histogram} stats={stats} isDark={isDark} animationKey={activeTab} />
        </div>
      )}

      {activeTab === "Category & Region Studio" && (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <CountrySalesBubbleChart data={countryBubble} isDark={isDark} animationKey={activeTab} />
          <TopProductsChart data={topProducts} onProductSelect={(product) => product && setSelectedProducts([product])} isDark={isDark} animationKey={activeTab} />
        </div>
      )}

      {activeTab === "Trend Analysis" && (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <SalesChart data={monthlyData} isDark={isDark} animationKey={activeTab} />
          <TrendForecastChart data={forecastData} isDark={isDark} animationKey={activeTab} />
        </div>
      )}

      {activeTab === "Statistical Insights" && (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <StatisticalDistribution histogram={histogram} stats={stats} isDark={isDark} animationKey={activeTab} />
          <CorrelationMatrix matrix={correlationMatrix} isDark={isDark} animationKey={activeTab} />
        </div>
      )}

      {activeTab === "Predictions & Forecasts" && (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <TrendForecastChart data={forecastData} isDark={isDark} animationKey={activeTab} />
          <TargetActualGauge actual={metrics.totalSalesValue} target={metrics.totalSalesValue * 1.1} isDark={isDark} animationKey={activeTab} />
        </div>
      )}

      {activeTab === "Storytelling & Takeaways" && (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <StorytellingTimeline milestones={milestones} isDark={isDark} animationKey={activeTab} />
          <div className={`rounded-2xl border p-5 shadow-md ${isDark ? "border-slate-700/70 bg-slate-800/70" : "border-white/40 bg-white/75"}`}>
            <h3 className={`text-2xl font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Executive Takeaways</h3>
            <div className="mb-3 mt-3 grid gap-2 sm:grid-cols-2">
              <div className={`rounded-lg border p-2 text-sm ${isDark ? "border-blue-800 bg-blue-950/60 text-slate-200" : "border-blue-200 bg-blue-50 text-slate-700"}`}>
                <b>Focus Area:</b> {metrics.targetCategorySubCategory}
              </div>
              <div className={`rounded-lg border p-2 text-sm ${isDark ? "border-emerald-800 bg-emerald-950/60 text-slate-200" : "border-emerald-200 bg-emerald-50 text-slate-700"}`}>
                <b>Takeaway:</b> Scale {metrics.targetRegion} with high-margin mix
              </div>
            </div>
            <ul className={`mt-3 list-disc space-y-2 pl-5 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              <li>Growth is concentrated in top products and target segments.</li>
              <li>Leakage is visible in weak products, discount-heavy orders, and specific regions.</li>
              <li>Shipping mode performance should inform logistics and cost optimization.</li>
              <li>Forecast suggests plan-level sales target calibration for next quarter.</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === "Financial Strength Dashboard" && (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <TargetActualGauge actual={metrics.totalSalesValue} target={metrics.totalSalesValue * 1.1} isDark={isDark} animationKey={activeTab} />
          <TrendForecastChart data={forecastData} isDark={isDark} animationKey={activeTab} />
          <CorrelationMatrix matrix={correlationMatrix} isDark={isDark} animationKey={activeTab} />
          <ImprovementOpportunities items={opportunities} isDark={isDark} animationKey={activeTab} />
        </div>
      )}

      {activeTab === "Customer & Product Focus" && (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <TopProductsChart data={topProducts} onProductSelect={(product) => product && setSelectedProducts([product])} isDark={isDark} animationKey={activeTab} />
          <CustomerSegmentContribution data={segmentContribution} isDark={isDark} animationKey={activeTab} />
          <div className={`rounded-2xl border p-5 shadow-md ${isDark ? "border-slate-700/70 bg-slate-800/70" : "border-white/40 bg-white/75"}`}>
            <h3 className={`text-2xl font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Customer Focus</h3>
            <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>Top customers driving growth:</p>
            <ul className={`mt-2 list-disc space-y-1 pl-5 text-sm ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              {topCustomers.slice(0, 5).map((row) => (
                <li key={`top-${row.customer}`}>{row.customer} ({formatCurrency(row.sales)})</li>
              ))}
            </ul>
            <p className={`mt-3 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>Customers needing attention:</p>
            <ul className={`mt-2 list-disc space-y-1 pl-5 text-sm ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              {weakCustomers.slice(0, 5).map((row) => (
                <li key={`weak-${row.customer}`}>{row.customer} ({formatCurrency(row.profit)})</li>
              ))}
            </ul>
          </div>
          <div className={`rounded-2xl border p-5 shadow-md ${isDark ? "border-slate-700/70 bg-slate-800/70" : "border-white/40 bg-white/75"}`}>
            <h3 className={`text-2xl font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Region Focus</h3>
            <ul className={`mt-3 list-disc space-y-1 pl-5 text-sm ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              {regionFocus.slice(0, 6).map((row) => (
                <li key={`region-${row.region}`}>{row.region}: {formatCurrency(row.profit)} profit</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === "Shipping Mode Analysis" && (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <ShippingModePerformance data={shippingPerformance} isDark={isDark} animationKey={activeTab} />
          <div className={`rounded-2xl border p-5 shadow-md ${isDark ? "border-slate-700/70 bg-slate-800/70" : "border-white/40 bg-white/75"}`}>
            <h3 className={`text-2xl font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Shipping Mode Focus</h3>
            <p className={`mt-3 text-sm ${isDark ? "text-slate-200" : "text-slate-700"}`}>Best performing mode: <b>{shippingSummary.best}</b></p>
            <p className={`mt-2 text-sm ${isDark ? "text-slate-200" : "text-slate-700"}`}>Weak performing mode: <b>{shippingSummary.worst}</b></p>
            <ul className={`mt-3 list-disc space-y-2 pl-5 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              <li>Promote {shippingSummary.best} for high-value orders.</li>
              <li>Review SLA and cost controls for {shippingSummary.worst}.</li>
              <li>Align shipping choice with margin-sensitive categories.</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === "Data Grid View" && (
        <DataGridView data={filteredData} isDark={isDark} />
      )}

      {activeTab === "Feedback" && (
        <FeedbackForm isDark={isDark} />
      )}
    </DashboardLayout>
  );
}

function FilterPanel({
  minDate,
  maxDate,
  selectedRange,
  setSelectedRange,
  regionOptions,
  countryOptions,
  categoryOptions,
  subCategoryOptions,
  productOptions,
  segmentOptions,
  shipModeOptions,
  yearOptions,
  selectedRegions,
  selectedCountries,
  selectedCategories,
  selectedSubCategories,
  selectedProducts,
  selectedSegments,
  selectedShipModes,
  selectedYears,
  yearWindow,
  discountRange,
  setSelectedRegions,
  setSelectedCountries,
  setSelectedCategories,
  setSelectedSubCategories,
  setSelectedProducts,
  setSelectedSegments,
  setSelectedShipModes,
  setSelectedYears,
  setYearWindow,
  setDiscountRange,
  onPresetApply,
  onClearAll,
  isDark,
}) {
  return (
    <SidebarFilters
      minDate={minDate}
      maxDate={maxDate}
      selectedRange={selectedRange}
      onRangeChange={setSelectedRange}
      regionOptions={regionOptions}
      countryOptions={countryOptions}
      categoryOptions={categoryOptions}
      subCategoryOptions={subCategoryOptions}
      productOptions={productOptions}
      segmentOptions={segmentOptions}
      shipModeOptions={shipModeOptions}
      yearOptions={yearOptions}
      selectedRegions={selectedRegions}
      selectedCountries={selectedCountries}
      selectedCategories={selectedCategories}
      selectedSubCategories={selectedSubCategories}
      selectedProducts={selectedProducts}
      selectedSegments={selectedSegments}
      selectedShipModes={selectedShipModes}
      selectedYears={selectedYears}
      yearWindow={yearWindow}
      discountRange={discountRange}
      onRegionsChange={setSelectedRegions}
      onCountriesChange={setSelectedCountries}
      onCategoriesChange={setSelectedCategories}
      onSubCategoriesChange={setSelectedSubCategories}
      onProductsChange={setSelectedProducts}
      onSegmentsChange={setSelectedSegments}
      onShipModesChange={setSelectedShipModes}
      onYearsChange={setSelectedYears}
      onYearWindowChange={setYearWindow}
      onDiscountRangeChange={setDiscountRange}
      onPresetApply={onPresetApply}
      onClearAll={onClearAll}
      isDark={isDark}
    />
  );
}

function buildMetricTrends(monthlyData) {
  const current = monthlyData[monthlyData.length - 1];
  const previous = monthlyData[monthlyData.length - 2];
  if (!current || !previous) {
    return {};
  }
  const pct = (cur, prev) => (prev ? ((cur - prev) / Math.abs(prev || 1)) * 100 : 0);
  return {
    totalSales: { positive: current.sales >= previous.sales, label: `${Math.abs(pct(current.sales, previous.sales)).toFixed(1)}% vs prior month` },
    totalProfit: { positive: current.profit >= previous.profit, label: `${Math.abs(pct(current.profit, previous.profit)).toFixed(1)}% vs prior month` },
    profitMargin: { positive: current.profit / Math.max(current.sales, 1) >= previous.profit / Math.max(previous.sales, 1), label: "margin trend" },
    orders: { positive: true, label: "interactive filter scope" },
    lossOrders: { positive: current.profit >= previous.profit, label: "loss pressure" },
    avgDiscount: { positive: false, label: "discount watch" },
  };
}

function normalizeRowFromCsv(row, index) {
  const date = parseMixedDate(row.order_date || row.orderdate || row.date || "");
  if (!date) {
    return null;
  }

  const sales = Number(row.sales) || 0;
  const profit = Number(row.profit) || 0;
  const discount = Number(row.discount) || 0;

  const category = row.category || "Uncategorized";
  const subCategory = row.sub_category || row.subcategory || row["sub-category"] || "Other";
  const product = row.product_name || row.product || `${subCategory} Item ${index + 1}`;
  const customer = row.customer_name || row.customer || row.customer_id || `Customer ${index + 1}`;
  const segment = row.segment || "Consumer";
  const shipMode = row.ship_mode || row.shipmode || "Standard Class";
  const region = row.region || "Unknown";
  const country = row.country || row.market || row.state || "Unknown";

  return {
    orderId: row.order_id || row.orderid || `ORD-${index + 1}`,
    date,
    year: new Date(date).getFullYear(),
    region,
    country,
    category,
    subCategory,
    product,
    customer,
    segment,
    shipMode,
    sales,
    profit,
    discount,
    margin: sales ? profit / sales : 0,
  };
}

function enrichMockRows(rows) {
  const categories = ["Technology", "Furniture", "Office Supplies"];
  const subCategories = ["Phones", "Chairs", "Binders", "Storage", "Accessories"];
  const segments = ["Consumer", "Corporate", "Home Office"];
  const shipModes = ["Standard Class", "Second Class", "First Class", "Same Day"];
  const countries = ["United States", "Canada", "India", "United Kingdom", "Germany"];

  return rows.map((row, index) => {
    const date = parseMixedDate(row.date) || "2014-01-01";
    const category = categories[index % categories.length];
    const subCategory = subCategories[index % subCategories.length];
    const sales = Number(row.sales) || 0;
    const profit = Number(row.profit) || 0;
    return {
      orderId: `MOCK-${index + 1}`,
      date,
      year: new Date(date).getFullYear(),
      region: row.region || "Unknown",
      country: countries[index % countries.length],
      category,
      subCategory,
      product: `${subCategory} Product ${index + 1}`,
      customer: `Customer ${String(index + 1).padStart(4, "0")}`,
      segment: segments[index % segments.length],
      shipMode: shipModes[index % shipModes.length],
      sales,
      profit,
      discount: Number(row.discount) || 0,
      margin: sales ? profit / sales : 0,
    };
  });
}

function parseMixedDate(value) {
  const str = String(value || "").trim();
  if (!str) {
    return null;
  }
  const direct = new Date(str);
  if (!Number.isNaN(direct.getTime())) {
    return direct.toISOString().slice(0, 10);
  }
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!match) {
    return null;
  }
  const a = Number(match[1]);
  const b = Number(match[2]);
  const y = Number(match[3].length === 2 ? `20${match[3]}` : match[3]);
  const monthFirst = new Date(y, a - 1, b);
  if (!Number.isNaN(monthFirst.getTime())) {
    return monthFirst.toISOString().slice(0, 10);
  }
  const dayFirst = new Date(y, b - 1, a);
  if (!Number.isNaN(dayFirst.getTime())) {
    return dayFirst.toISOString().slice(0, 10);
  }
  return null;
}

function uniqueValues(rows, key) {
  return [...new Set(rows.map((x) => x[key]).filter(Boolean))].sort();
}

function sum(rows, key) {
  return rows.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
}

function topBy(rows, key, metric) {
  if (!rows.length) {
    return "N/A";
  }
  const grouped = aggregate(rows, key);
  return Object.entries(grouped).sort((a, b) => b[1][metric] - a[1][metric])[0]?.[0] || "N/A";
}

function bottomBy(rows, key, metric) {
  if (!rows.length) {
    return "N/A";
  }
  const grouped = aggregate(rows, key);
  return Object.entries(grouped).sort((a, b) => a[1][metric] - b[1][metric])[0]?.[0] || "N/A";
}

function aggregate(rows, key) {
  const grouped = {};
  rows.forEach((row) => {
    if (!grouped[row[key]]) {
      grouped[row[key]] = { sales: 0, profit: 0, count: 0, margin: 0 };
    }
    grouped[row[key]].sales += row.sales;
    grouped[row[key]].profit += row.profit;
    grouped[row[key]].count += 1;
    grouped[row[key]].margin += row.margin;
  });
  return grouped;
}

function groupProducts(rows) {
  const grouped = aggregate(rows, "product");
  return Object.entries(grouped)
    .map(([product, v]) => ({ product, sales: v.sales, profit: v.profit }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10);
}

function groupShipping(rows) {
  const grouped = aggregate(rows, "shipMode");
  return Object.entries(grouped)
    .map(([shipMode, v]) => ({ shipMode, sales: v.sales, profit: v.profit }))
    .sort((a, b) => b.sales - a.sales);
}

function groupSegment(rows) {
  const grouped = aggregate(rows, "segment");
  return Object.entries(grouped)
    .map(([segment, v]) => ({ segment, sales: v.sales, profit: v.profit }))
    .sort((a, b) => b.sales - a.sales);
}

function groupForBubble(rows) {
  const grouped = aggregate(rows, "country");
  return Object.entries(grouped)
    .map(([country, v]) => ({ country, sales: v.sales, profit: v.profit, orders: v.count }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 30);
}

function groupCustomers(rows) {
  const grouped = aggregate(rows, "customer");
  return Object.entries(grouped)
    .map(([customer, v]) => ({ customer, sales: v.sales, profit: v.profit, orders: v.count }))
    .sort((a, b) => b.sales - a.sales);
}

function topCategorySubCategory(rows) {
  if (!rows.length) {
    return "N/A";
  }
  const grouped = {};
  rows.forEach((row) => {
    const key = `${row.category} / ${row.subCategory}`;
    if (!grouped[key]) {
      grouped[key] = { profit: 0 };
    }
    grouped[key].profit += row.profit;
  });
  return Object.entries(grouped).sort((a, b) => b[1].profit - a[1].profit)[0]?.[0] || "N/A";
}

function buildHistogram(values, bins) {
  if (!values.length) {
    return [];
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = (max - min) / bins || 1;
  const arr = Array.from({ length: bins }, (_, i) => ({ bucket: `${Math.round(min + i * width)}`, count: 0 }));
  values.forEach((v) => {
    const idx = Math.min(Math.floor((v - min) / width), bins - 1);
    arr[idx].count += 1;
  });
  return arr;
}

function buildStats(values) {
  if (!values.length) {
    return { min: "$0", q1: "$0", median: "$0", q3: "$0", max: "$0", stdDev: "$0" };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mean = sorted.reduce((acc, x) => acc + x, 0) / sorted.length;
  const variance = sorted.reduce((acc, x) => acc + (x - mean) ** 2, 0) / sorted.length;
  return {
    min: formatCurrency(sorted[0]),
    q1: formatCurrency(quantile(sorted, 0.25)),
    median: formatCurrency(quantile(sorted, 0.5)),
    q3: formatCurrency(quantile(sorted, 0.75)),
    max: formatCurrency(sorted[sorted.length - 1]),
    stdDev: formatCurrency(Math.sqrt(variance)),
  };
}

function quantile(values, q) {
  const pos = (values.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (values[base + 1] !== undefined) {
    return values[base] + rest * (values[base + 1] - values[base]);
  }
  return values[base];
}

function buildCorrelationMatrix(rows) {
  const vectors = {
    Sales: rows.map((x) => x.sales),
    Profit: rows.map((x) => x.profit),
    Discount: rows.map((x) => x.discount),
    Margin: rows.map((x) => x.margin),
    Year: rows.map((x) => x.year),
  };
  const keys = Object.keys(vectors);
  const matrix = {};
  keys.forEach((k1) => {
    matrix[k1] = {};
    keys.forEach((k2) => {
      matrix[k1][k2] = pearson(vectors[k1], vectors[k2]);
    });
  });
  return matrix;
}

function pearson(a, b) {
  if (!a.length || a.length !== b.length) {
    return 0;
  }
  const n = a.length;
  const meanA = a.reduce((x, y) => x + y, 0) / n;
  const meanB = b.reduce((x, y) => x + y, 0) / n;
  let num = 0;
  let denA = 0;
  let denB = 0;
  for (let i = 0; i < n; i += 1) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denA += da ** 2;
    denB += db ** 2;
  }
  const den = Math.sqrt(denA * denB);
  return den ? num / den : 0;
}

export default App;
