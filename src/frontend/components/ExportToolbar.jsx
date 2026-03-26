import React from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Download, FileSpreadsheet, FileType2, Image, Moon, Sun } from "lucide-react";

/**
 * ExportToolbar
 * Purpose: Export filtered dashboard outputs to Excel, PDF, and PNG formats.
 * Styling: Compact action bar with icon-first controls.
 */
function ExportToolbar({ filteredRows, exportElementRef, isDark, onToggleTheme }) {
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");
    XLSX.writeFile(workbook, "superstore_filtered_data.xlsx");
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("SuperStore Filtered Data", 14, 14);

    const rows = filteredRows.slice(0, 80).map((item) => [
      item.date,
      item.region,
      item.category,
      item.subCategory,
      item.country,
      item.sales,
      item.profit,
    ]);

    autoTable(doc, {
      head: [["Date", "Region", "Category", "Sub-Category", "Country", "Sales", "Profit"]],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
    });
    doc.save("superstore_filtered_data.pdf");
  };

  const exportPng = async () => {
    if (!exportElementRef?.current) {
      return;
    }
    const canvas = await html2canvas(exportElementRef.current, {
      backgroundColor: "#ffffff",
      useCORS: true,
      scale: 1.5,
    });
    const link = document.createElement("a");
    link.download = "superstore_dashboard.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const actions = [
    { label: "Excel", icon: FileSpreadsheet, onClick: exportExcel },
    { label: "PDF", icon: FileType2, onClick: exportPdf },
    { label: "PNG", icon: Image, onClick: exportPng },
  ];

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
        <Download size={14} /> Export
      </span>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:scale-105 hover:bg-slate-50"
          >
            <Icon size={14} />
            {action.label}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onToggleTheme}
        className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:scale-105 hover:bg-slate-50"
        aria-label="Toggle dark mode"
        style={{ height: 36 }}
      >
        {isDark ? <Sun size={14} /> : <Moon size={14} />} {isDark ? "Light" : "Dark"} mode
      </button>
    </div>
  );
}

export default ExportToolbar;
