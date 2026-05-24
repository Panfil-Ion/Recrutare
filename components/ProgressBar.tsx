"use client";

import { motion } from "framer-motion";

type ProgressBarProps = {
  currentStep: number;
  totalSteps: number;
};

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-10">
      <div className="mb-3 flex items-center justify-between text-xs tracking-widest text-white/40 uppercase">
        <span>Pasul {currentStep}</span>
        <span>{totalSteps} pași</span>
      </div>
      <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#c9a962] to-[#7ee8c7]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
