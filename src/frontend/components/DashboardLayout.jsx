import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun, X } from "lucide-react";

/**
 * DashboardLayout
 * Purpose: Responsive shell that manages sidebar behavior across mobile, tablet, and desktop.
 * Styling: Gradient canvas, elevated content panel, and slide-in filter drawer on small screens.
 */
function DashboardLayout({ sidebar, header, children, isDark, onToggleTheme, rightActions, contentRef }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <main
      className={`min-h-screen p-3 transition-colors sm:p-4 lg:p-8 ${
        isDark
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100"
          : "bg-gradient-to-br from-slate-100 via-blue-100 to-fuchsia-100 text-slate-900"
      }`}
    >
      <div className="mx-auto grid max-w-[1600px] gap-4 lg:grid-cols-[320px,1fr] lg:gap-6">
        <div className="lg:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              aria-label="Open filter sidebar"
              aria-haspopup="dialog"
            >
              <span aria-hidden="true">&#9776;</span>
              Filters
            </button>
            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white/85 p-2 text-slate-700 transition-all hover:scale-105"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        <aside className="hidden lg:block">{sidebar}</aside>

        <section
          ref={contentRef}
          className={`rounded-3xl border p-4 shadow-2xl backdrop-blur-md sm:p-5 lg:p-7 ${
            isDark ? "border-slate-700/70 bg-slate-900/55" : "border-white/40 bg-white/60"
          }`}
        >
          <div className="sticky top-3 z-20 mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur-md">
            <div />
            <div className="flex flex-wrap items-center gap-2">
              {rightActions}
            </div>
          </div>
          {header}
          {children}
          <footer
            className={`mt-7 border-t pt-4 text-center text-xs sm:text-sm ${
              isDark ? "border-slate-700/70 text-slate-300" : "border-slate-200/70 text-slate-600"
            }`}
          >
            SuperStore Sales Dashboard | {currentYear}
          </footer>
        </section>
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-900/35"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Dashboard filters"
              className={`fixed inset-y-0 left-0 z-50 w-[90%] max-w-[360px] overflow-y-auto p-4 shadow-2xl backdrop-blur-md ${
                isDark ? "bg-slate-900/97 text-slate-100" : "bg-white/97"
              }`}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className={`text-lg font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>Filter Studio</h2>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className={`inline-flex items-center gap-1 rounded-xl border px-2 py-1 text-xs font-semibold transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${isDark ? "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700" : "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  aria-label="Close filter sidebar"
                >
                  <X size={14} /> Close
                </button>
              </div>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

export default DashboardLayout;
