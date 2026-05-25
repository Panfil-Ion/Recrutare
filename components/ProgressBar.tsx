"use client";

import { motion } from "framer-motion";

type ProgressBarProps = {
  currentStep: number;
  totalSteps: number;
  flowMode?: "rigid" | "neutral" | "fluid";
};

export function ProgressBar({
  currentStep,
  totalSteps,
  flowMode = "neutral",
}: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;
  const intensity =
    flowMode === "rigid"
      ? 0.25 + (progress / 100) * 0.35
      : flowMode === "fluid"
        ? 0.45 + (progress / 100) * 0.75
        : 0.35 + (progress / 100) * 0.65;
  const goldMix = Math.round(201 * intensity);
  const neonMix = Math.round(126 + (progress / 100) * 40);
  const duration =
    flowMode === "rigid" ? 0.28 : flowMode === "fluid" ? 0.7 : 0.55;

  return (
    <div className="mb-10">
      <div className="mb-3 flex items-center justify-between text-xs tracking-widest text-white/40 uppercase">
        <span>Pasul {currentStep}</span>
        <span className="text-white/25">Chamber sync</span>
        <span>{totalSteps} pași</span>
      </div>
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: `linear-gradient(90deg, 
              rgba(${goldMix}, ${Math.round(169 * intensity)}, ${Math.round(98 * intensity)}, ${flowMode === "rigid" ? 0.35 : 0.5 + intensity * 0.5}) 0%, 
              rgba(${neonMix}, ${Math.round(232 * (0.6 + intensity * 0.4))}, ${Math.round(199 * (0.6 + intensity * 0.4))}, ${flowMode === "rigid" ? 0.25 : 0.45 + intensity * 0.55}) 100%)`,
            boxShadow:
              flowMode === "rigid"
                ? `0 0 ${6 + progress * 0.1}px rgba(160, 160, 180, ${0.04 + intensity * 0.06})`
                : `0 0 ${8 + progress * 0.2}px rgba(201, 169, 98, ${0.08 + intensity * 0.12}), 0 0 ${12 + progress * 0.25}px rgba(126, 232, 199, ${0.05 + intensity * 0.1})`,
            filter: `brightness(${flowMode === "rigid" ? 0.75 + intensity * 0.15 : 0.85 + intensity * 0.25}) saturate(${flowMode === "rigid" ? 0.7 : 0.9 + intensity * 0.2})`,
          }}
        />
      </div>
    </div>
  );
}
