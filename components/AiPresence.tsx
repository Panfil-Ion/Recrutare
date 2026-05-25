"use client";

import { motion, AnimatePresence } from "framer-motion";

type AiPresenceProps = {
  activeField: string | null;
  flowMode: "rigid" | "neutral" | "fluid";
  isProcessing?: boolean;
};

const fieldLabels: Record<string, string> = {
  selfDescription: "autodescriere",
  egoScenario: "scenariu ego",
  crisisScenario: "scenariu criză",
  experienceDetails: "experiență",
};

export function AiPresence({
  activeField,
  flowMode,
  isProcessing = false,
}: AiPresenceProps) {
  const monitoring = activeField
    ? fieldLabels[activeField] ?? activeField
    : null;

  return (
    <div
      className={`ai-presence ai-presence--${flowMode}${isProcessing ? " ai-presence--processing" : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className="ai-presence-core">
        <span className="ai-presence-dot" aria-hidden />
        <span className="ai-presence-label">
          {isProcessing ? "Behavioral analysis running" : "Behavioral layer active"}
        </span>
      </span>
      <AnimatePresence mode="wait">
        {monitoring && !isProcessing && (
          <motion.span
            key={monitoring}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="ai-presence-monitor"
          >
            monitoring · {monitoring}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
