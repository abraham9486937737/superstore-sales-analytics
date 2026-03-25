import React, { useMemo, useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Download, FileText, Image, Search, Table2, X } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

/**
 * DataGridView
 * Purpose: Paginated, sortable data table with Excel / PDF / PNG export for the filtered dataset.
 * Features: Column sort (asc/desc), page size selector, inline search, loss-row highlighting.
 */

const COLUMNS = [
  { key: "orderId",     label: "Order ID",     numeric: false },
  { key: "date",        label: "Date",          numeric: false },
  { key: "region",      label: "Region",        numeric: false },
  { key: "country",     label: "Country",       numeric: false },
  { key: "category",    label: "Category",      numeric: false },
  { key: "subCategory", label: "Sub-Category",  numeric: false },
  { key: "product",     label: "Product",       numeric: false },
  { key: "customer",    label: "Customer",      numeric: false },
  { key: "segment",     label: "Segment",       numeric: false },
  { key: "shipMode",    label: "Ship Mode",     numeric: false },
  {
    key: "sales",
    label: "Sales ($)",
    numeric: true,
    format: (v) => `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
  {
    key: "profit",
    label: "Profit ($)",
    numeric: true,
    format: (v) => `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
  {
    key: "discount",
    label: "Discount",
    numeric: true,
    format: (v) => `${(Number(v) * 100).toFixed(0)}%`,
  },
  {
    key: "margin",
    label: "Margin",
    numeric: true,
    format: (v) => `${(Number(v) * 100).toFixed(1)}%`,
  },
];

const PAGE_SIZES = [10, 25, 50, 100];

function DataGridView({ data = [], isDark = false }) {
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const tableRef = React.useRef(null);

  const sorted = useMemo(() => {
    const col = COLUMNS.find((c) => c.key === sortKey);
    const dir = sortDir === "asc" ? 1 : -1;
    const source = search.trim()
      ? data.filter((row) =>
          COLUMNS.some((c) => {
            const val = c.format ? c.format(row[c.key]) : String(row[c.key] ?? "");
            return val.toLowerCase().includes(search.trim().toLowerCase());
          })
        )
      : data;
    return [...source].sort((a, b) => {
      if (col?.numeric) return (Number(a[sortKey]) - Number(b[sortKey])) * dir;
      return String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? "")) * dir;
    });
  }, [data, sortKey, sortDir, search]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageData = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const exportExcel = () => {
    const rows = sorted.map((row) =>
      Object.fromEntries(
        COLUMNS.map((col) => [col.label, col.format ? col.format(row[col.key]) : String(row[col.key] ?? "")])
      )
    );
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SuperStore Data");
    XLSX.writeFile(wb, "superstore_filtered_data.xlsx");
  };

  const exportPDF = async () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    doc.setFontSize(14);
    doc.text("SuperStore Filtered Data", 40, 30);
    doc.setFontSize(9);
    doc.text(`Rows: ${sorted.length.toLocaleString()} | Generated: ${new Date().toLocaleString()}`, 40, 48);
    autoTable(doc, {
      head: [COLUMNS.map((c) => c.label)],
      body: sorted.slice(0, 2000).map((row) =>
        COLUMNS.map((col) => (col.format ? col.format(row[col.key]) : String(row[col.key] ?? "")))
      ),
      startY: 60,
      styles: { fontSize: 7, cellPadding: 3 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { left: 30, right: 30 },
    });
    doc.save("superstore_filtered_data.pdf");
  };

  const exportPNG = async () => {
    if (!tableRef.current) return;
    const canvas = await html2canvas(tableRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: isDark ? "#0f172a" : "#ffffff",
    });
    const link = document.createElement("a");
    link.download = "superstore_grid_snapshot.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const headerCls = `px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide cursor-pointer select-none border-b transition-colors hover:text-blue-600 ${
    isDark ? "border-slate-700 bg-slate-800 text-cyan-300" : "border-slate-200 bg-slate-50 text-slate-600"
  }`;
  const cellCls = `px-3 py-2 text-sm border-b ${isDark ? "border-slate-700/60 text-slate-200" : "border-slate-100 text-slate-700"}`;

  return (
    <div
      className={`mt-6 overflow-hidden rounded-2xl border shadow-md ${
        isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
      }`}
    >
      {/* Toolbar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 ${
          isDark ? "border-slate-700" : "border-slate-200"
        }`}
      >
        {/* Left: title + row counts */}
        <div className="flex items-center gap-2">
          <Table2 size={20} className="text-blue-600" />
          <h2 className={`text-lg font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>Data Grid</h2>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              isDark ? "bg-slate-700 text-cyan-300" : "bg-blue-50 text-blue-700"
            }`}
          >
            {data.length.toLocaleString()} rows
          </span>
          {search && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
              {sorted.length.toLocaleString()} matched
            </span>
          )}
        </div>

        {/* Right: search + page size + export buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Inline search */}
          <div
            className={`relative flex items-center rounded-xl border ${
              isDark ? "border-slate-600 bg-slate-800" : "border-slate-300 bg-white"
            }`}
          >
            <Search size={13} className="absolute left-2.5 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search across all columns"
              placeholder="Search data..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className={`w-40 rounded-xl bg-transparent py-1.5 pl-8 pr-7 text-xs outline-none ${
                isDark ? "text-slate-100 placeholder-slate-500" : "text-slate-800 placeholder-slate-400"
              }`}
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <label
            htmlFor="grid-page-size"
            className={`flex items-center gap-1.5 text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Rows:
            <select
              id="grid-page-size"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className={`rounded-lg border px-2 py-1 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200 ${
                isDark ? "border-slate-600 bg-slate-800 text-slate-200" : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={exportExcel}
            aria-label="Export to Excel"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:scale-105 hover:bg-emerald-700"
          >
            <Download size={13} />
            Excel
          </button>

          <button
            type="button"
            onClick={exportPDF}
            aria-label="Export to PDF"
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:scale-105 hover:bg-rose-700"
          >
            <FileText size={13} />
            PDF
          </button>

          <button
            type="button"
            onClick={exportPNG}
            aria-label="Export table as PNG image"
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:scale-105 hover:bg-violet-700"
          >
            <Image size={13} />
            PNG
          </button>
        </div>
      </div>

      {/* Table */}
      <div ref={tableRef} className="overflow-x-auto">
        <table className="min-w-full" role="grid" aria-label="SuperStore data table">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={headerCls}
                  onClick={() => handleSort(col.key)}
                  aria-sort={sortKey === col.key ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                >
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    {col.label}
                    <ArrowUpDown
                      size={11}
                      className={sortKey === col.key ? "text-blue-600" : "opacity-30"}
                      aria-hidden="true"
                    />
                    {sortKey === col.key && (
                      <span className="text-blue-600" aria-hidden="true">
                        {sortDir === "asc" ? "up" : "dn"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, idx) => (
              <tr
                key={row.orderId || idx}
                className={`transition-colors ${
                  isDark ? "hover:bg-slate-800/70" : "hover:bg-blue-50/50"
                } ${
                  row.profit < 0
                    ? isDark
                      ? "bg-rose-950/25"
                      : "bg-rose-50/50"
                    : ""
                }`}
              >
                {COLUMNS.map((col) => (
                  <td
                    key={col.key}
                    className={`${cellCls} ${col.numeric ? "text-right tabular-nums" : ""} ${
                      col.key === "profit" && row.profit < 0 ? "font-semibold text-rose-600" : ""
                    }`}
                  >
                    <span className="whitespace-nowrap">
                      {col.format ? col.format(row[col.key]) : String(row[col.key] ?? "")}
                    </span>
                  </td>
                ))}
              </tr>
            ))}

            {pageData.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className={`py-16 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  No data matches the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 ${
          isDark ? "border-slate-700" : "border-slate-200"
        }`}
      >
        <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Showing{" "}
          <span className="font-semibold">
            {sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1}
            {" to "}
            {Math.min(safePage * pageSize, sorted.length)}
          </span>{" "}
          of <span className="font-semibold">{sorted.length.toLocaleString()}</span>
        </p>

        <nav aria-label="Pagination" className="flex items-center gap-1">
          <PageBtn
            icon={ChevronLeft}
            label="Previous page"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            isDark={isDark}
          />

          {paginationRange(safePage, totalPages).map((item, i) =>
            item === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className={`px-1 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                aria-label={`Page ${item}`}
                aria-current={item === safePage ? "page" : undefined}
                className={`h-7 w-7 rounded-full text-xs font-semibold transition-all ${
                  item === safePage
                    ? "bg-blue-600 text-white"
                    : isDark
                    ? "text-slate-300 hover:bg-slate-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item}
              </button>
            )
          )}

          <PageBtn
            icon={ChevronRight}
            label="Next page"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            isDark={isDark}
          />
        </nav>
      </div>
    </div>
  );
}

function PageBtn({ icon: Icon, label, onClick, disabled, isDark }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-7 w-7 items-center justify-center rounded-full transition-all disabled:cursor-default disabled:opacity-40 ${
        isDark ? "text-slate-300 hover:bg-slate-700" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      <Icon size={14} aria-hidden="true" />
    </button>
  );
}

function paginationRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default DataGridView;
