import React from "react";
import Select from "react-select";
import {
  CalendarRange,
  Globe,
  Package,
  Percent,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";

/**
 * SidebarFilters
 * Purpose: Executive filter studio with collapsible groups, presets, and icon-led controls.
 * Styling: Card-based sections, preset chips, and responsive multi-select controls.
 */
function SidebarFilters({
  minDate,
  maxDate,
  selectedRange,
  onRangeChange,
  regionOptions,
  categoryOptions,
  subCategoryOptions,
  countryOptions,
  yearOptions,
  productOptions,
  segmentOptions,
  shipModeOptions,
  selectedRegions,
  selectedCategories,
  selectedSubCategories,
  selectedCountries,
  selectedYears,
  selectedProducts,
  selectedSegments,
  selectedShipModes,
  yearWindow,
  discountRange,
  onRegionsChange,
  onCategoriesChange,
  onSubCategoriesChange,
  onCountriesChange,
  onYearsChange,
  onProductsChange,
  onSegmentsChange,
  onShipModesChange,
  onYearWindowChange,
  onDiscountRangeChange,
  onPresetApply,
  onClearAll,
  isDark = false,
}) {
  const readMultiSelect = (event) => Array.from(event.target.selectedOptions).map((x) => x.value);

  return (
    <aside
      className={`w-full rounded-3xl border p-4 shadow-xl backdrop-blur-md sm:p-5 ${
        isDark ? "border-slate-700/60 bg-slate-900/75" : "border-slate-200/70 bg-white/75"
      }`}
    >
      <div className="mb-5 flex items-start justify-between gap-2">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight sm:text-3xl ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            Filter Studio
          </h2>
          <p className={`mt-1.5 text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Executive-ready controls for geography, product, customer, and time slices.
          </p>
        </div>
        {onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            aria-label="Clear all filters and reset to defaults"
            className={`mt-1 shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105 ${
              isDark
                ? "border-rose-700 bg-rose-950/60 text-rose-300 hover:bg-rose-900"
                : "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
            }`}
          >
            Clear All
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <PresetButton label="Last 12 Months" onClick={() => onPresetApply?.("last12")} />
        <PresetButton label="Top 10 Products" onClick={() => onPresetApply?.("top10products")} />
        <PresetButton label="High Discount Orders" onClick={() => onPresetApply?.("highdiscount")} />
      </div>

      <div className="space-y-4">
        <FilterGroup title="Geography" icon={Globe} isDark={isDark} defaultOpen>
          <FilterSelect id="filter-region" label="Region" options={regionOptions} values={selectedRegions} onChange={onRegionsChange} isDark={isDark} />
        </FilterGroup>

        <FilterGroup title="Category" icon={Package} isDark={isDark}>
          <SingleSelect id="filter-category" label="Category" options={categoryOptions} value={selectedCategories[0] || ''} onChange={(val) => onCategoriesChange([val])} isDark={isDark} />
          <SingleSelect id="filter-sub-category" label="Sub-Category" options={subCategoryOptions} value={selectedSubCategories[0] || ''} onChange={(val) => onSubCategoriesChange([val])} isDark={isDark} />
        </FilterGroup>

        <FilterGroup title="Customer" icon={Users} isDark={isDark}>
          <SingleSelect id="filter-segment" label="Customer Segment" options={segmentOptions} value={selectedSegments[0] || ''} onChange={(val) => onSegmentsChange([val])} isDark={isDark} />
        </FilterGroup>

        <FilterGroup title="Time" icon={CalendarRange} isDark={isDark} defaultOpen>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <FilterInput label="Start Date" type="date" value={selectedRange.startDate} min={minDate} max={maxDate} onChange={(value) => onRangeChange({ ...selectedRange, startDate: value })} isDark={isDark} />
            <FilterInput label="End Date" type="date" value={selectedRange.endDate} min={minDate} max={maxDate} onChange={(value) => onRangeChange({ ...selectedRange, endDate: value })} isDark={isDark} />
          </div>
          <FilterSelect id="filter-year" label="Year" options={yearOptions.map(String)} values={selectedYears.map(String)} onChange={(values) => onYearsChange(values.map(Number))} isDark={isDark} />
          <RangeGroup label={`Year Window (${yearWindow[0]} - ${yearWindow[1]})`} min={yearOptions[0] || 2011} max={yearOptions[yearOptions.length - 1] || 2014} values={yearWindow} onChange={onYearWindowChange} isDark={isDark} />
        </FilterGroup>

        <FilterGroup title="Shipping & Discount" icon={Truck} isDark={isDark}>
          <FilterSelect id="filter-ship-mode" label="Shipping Mode" options={shipModeOptions} values={selectedShipModes} onChange={onShipModesChange} isDark={isDark} />
          <RangeGroup label={`Discount Range (${Math.round(discountRange[0] * 100)}% - ${Math.round(discountRange[1] * 100)}%)`} min={0} max={100} values={[Math.round(discountRange[0] * 100), Math.round(discountRange[1] * 100)]} onChange={(values) => onDiscountRangeChange([values[0] / 100, values[1] / 100])} isDark={isDark} icon={Percent} />
        </FilterGroup>
      </div>
    </aside>
  );
}

// SingleSelect: single dropdown for category, sub-category, and customer segment
function SingleSelect({ id, label, options, value, onChange, isDark }) {
  const selectOptions = options.map((opt) => ({ value: opt, label: opt }));
  const selected = selectOptions.find((opt) => opt.value === value) || null;
  return (
    <div className="mb-2">
      <label htmlFor={id} className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-300" : "text-slate-600"}`}>
        {label}
      </label>
      <Select
        inputId={id}
        isMulti={false}
        options={selectOptions}
        value={selected}
        onChange={(selectedOption) => onChange(selectedOption ? selectedOption.value : '')}
        classNamePrefix="react-select"
        styles={{
          control: (base) => ({
            ...base,
            background: isDark ? '#1e293b' : '#fff',
            borderColor: isDark ? '#334155' : '#cbd5e1',
            minHeight: 44,
            borderRadius: 12,
            boxShadow: '0 2px 8px 0 rgba(30, 64, 175, 0.04)',
          }),
          option: (base, state) => ({
            ...base,
            background: state.isSelected
              ? 'linear-gradient(90deg, #38bdf8 0%, #6366f1 100%)'
              : state.isFocused
              ? '#f1f5f9'
              : '#fff',
            color: state.isSelected ? '#fff' : '#334155',
            fontWeight: state.isSelected ? 700 : 500,
          }),
          menu: (base) => ({
            ...base,
            borderRadius: 12,
            zIndex: 20,
          }),
        }}
        theme={(theme) => ({
          ...theme,
          borderRadius: 12,
          colors: {
            ...theme.colors,
            primary25: '#e0e7ff',
            primary: '#6366f1',
          },
        })}
      />
    </div>
  );
}

function FilterGroup({ title, icon: Icon, children, isDark, defaultOpen = false }) {
  return (
    <details open={defaultOpen} className={`rounded-2xl border p-3 ${isDark ? "border-slate-700 bg-slate-800/60" : "border-slate-200/80 bg-white/85"}`}>
      <summary className={`flex cursor-pointer list-none items-center gap-2 text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
        <span className={`rounded-lg p-2 ${isDark ? "bg-slate-700 text-cyan-300" : "bg-blue-50 text-blue-700"}`}><Icon size={16} /></span>
        {title}
      </summary>
      <div className="mt-3 space-y-3">{children}</div>
    </details>
  );
}

function FilterSelect({ id, label, options, values, onChange, isDark }) {
  // react-select expects options as [{ value, label }]
  const selectOptions = options.map((opt) => ({ value: opt, label: opt }));
  const selected = selectOptions.filter((opt) => values.includes(opt.value));
  return (
    <div className="mb-2">
      <label htmlFor={id} className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-300" : "text-slate-600"}`}>
        {label}
      </label>
      <Select
        inputId={id}
        isMulti
        options={selectOptions}
        value={selected}
        onChange={(selectedOptions) => onChange(selectedOptions ? selectedOptions.map((o) => o.value) : [])}
        classNamePrefix="react-select"
        styles={{
          control: (base) => ({
            ...base,
            background: isDark ? '#1e293b' : '#fff',
            borderColor: isDark ? '#334155' : '#cbd5e1',
            minHeight: 44,
            borderRadius: 12,
            boxShadow: '0 2px 8px 0 rgba(30, 64, 175, 0.04)',
          }),
          multiValue: (base) => ({
            ...base,
            background: 'linear-gradient(90deg, #e0e7ff 0%, #bae6fd 100%)',
            color: '#1e40af',
            borderRadius: 8,
            fontWeight: 600,
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: '#1e40af',
            fontWeight: 600,
          }),
          multiValueRemove: (base) => ({
            ...base,
            color: '#0ea5e9',
            ':hover': { background: '#bae6fd', color: '#be185d' },
          }),
          option: (base, state) => ({
            ...base,
            background: state.isSelected
              ? 'linear-gradient(90deg, #38bdf8 0%, #6366f1 100%)'
              : state.isFocused
              ? '#f1f5f9'
              : '#fff',
            color: state.isSelected ? '#fff' : '#334155',
            fontWeight: state.isSelected ? 700 : 500,
          }),
          menu: (base) => ({
            ...base,
            borderRadius: 12,
            zIndex: 20,
          }),
        }}
        theme={(theme) => ({
          ...theme,
          borderRadius: 12,
          colors: {
            ...theme.colors,
            primary25: '#e0e7ff',
            primary: '#6366f1',
          },
        })}
      />
    </div>
  );
}

function FilterInput({ label, type, value, min, max, onChange, isDark }) {
  return (
    <div>
      <label className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-300" : "text-slate-600"}`}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-200 ${
          isDark ? "border-slate-600 bg-slate-900 text-slate-100" : "border-slate-300 bg-white text-slate-800"
        }`}
      />
    </div>
  );
}

function RangeGroup({ label, min, max, values, onChange, isDark, icon: Icon }) {
  return (
    <div>
      <label className={`mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-300" : "text-slate-600"}`}>
        {Icon && <Icon size={12} />} {label}
      </label>
      <input type="range" min={min} max={max} value={values[0]} onChange={(event) => onChange([Number(event.target.value), values[1]])} className="mb-2 w-full accent-blue-600" />
      <input type="range" min={min} max={max} value={values[1]} onChange={(event) => onChange([values[0], Number(event.target.value)])} className="w-full accent-blue-600" />
    </div>
  );
}

function PresetButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition-all hover:scale-105 hover:bg-blue-100"
    >
      {label}
    </button>
  );
}

export default SidebarFilters;
