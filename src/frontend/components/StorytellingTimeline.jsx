import React from "react";
import { motion } from "framer-motion";
import ChartContainer from "./ChartContainer";

/**
 * StorytellingTimeline
 * Purpose: Provide annotated milestones for executive storytelling and decisions.
 * Styling: Vertical timeline with animated milestone markers.
 */
function StorytellingTimeline({ milestones, isDark = false, animationKey }) {
  return (
    <ChartContainer title="Storytelling Timeline" subtitle="Annotated milestones for business narrative" isDark={isDark} animationKey={animationKey}>
      <div className="relative ml-2 border-l-2 border-blue-200 pl-5">
        {milestones.map((milestone, index) => (
          <motion.div
            key={`${milestone.date}-${milestone.title}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="mb-5"
          >
            <span className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full bg-blue-500" aria-hidden="true" />
            <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>{milestone.date}</p>
            <p className={`text-sm font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{milestone.title}</p>
            <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{milestone.note}</p>
          </motion.div>
        ))}
      </div>
    </ChartContainer>
  );
}

export default StorytellingTimeline;
