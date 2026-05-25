"use client";

import { SUBMIT_PHASES } from "@/lib/behavioral";
import { AnimatePresence, motion } from "framer-motion";

type SubmitEvaluationProps = {
  phase: number;
  visible: boolean;
};

export function SubmitEvaluation({ phase, visible }: SubmitEvaluationProps) {
  if (!visible) return null;

  const clampedPhase = Math.min(Math.max(phase, 0), SUBMIT_PHASES.length - 1);
  const message = SUBMIT_PHASES[clampedPhase];

  return (
    <div className="submit-evaluation-overlay" role="status" aria-live="assertive">
      <div className="submit-evaluation-panel">
        <div className="submit-evaluation-scan" aria-hidden />
        <p className="submit-evaluation-label">System evaluation</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="submit-evaluation-phase"
          >
            {message}
          </motion.p>
        </AnimatePresence>
        <div className="submit-evaluation-progress">
          {(SUBMIT_PHASES as readonly string[]).map((_, i) => (
            <span
              key={i}
              className={`submit-evaluation-dot${i <= clampedPhase ? " submit-evaluation-dot--active" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
