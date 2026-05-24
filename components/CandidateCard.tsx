"use client";

import { motion } from "framer-motion";

export type Candidate = {
  id: string;
  firstName: string;
  lastName: string;
  telegramUsername: string;
  university: string;
  hobbies: string;
  selfDescription: string;
  hasExperience: boolean;
  experienceDetails: string | null;
  egoScenario: string;
  crisisScenario: string;
  scorGeneral: number;
  verdict: string;
  profilPsihologic: string;
  createdAt: string;
};

const verdictStyles: Record<
  string,
  { border: string; bg: string; label: string; glow: string }
> = {
  RECOMANDAT: {
    border: "border-[#7ee8c7]/40",
    bg: "bg-[#7ee8c7]/8",
    label: "text-[#7ee8c7]",
    glow: "shadow-[0_0_30px_rgba(126,232,199,0.12)]",
  },
  "REZERVĂ": {
    border: "border-[#c9a962]/40",
    bg: "bg-[#c9a962]/8",
    label: "text-[#c9a962]",
    glow: "shadow-[0_0_30px_rgba(201,169,98,0.12)]",
  },
  RESPINS: {
    border: "border-red-400/30",
    bg: "bg-red-500/8",
    label: "text-red-400/90",
    glow: "shadow-[0_0_30px_rgba(248,113,113,0.08)]",
  },
};

export function CandidateCard({
  candidate,
  index,
}: {
  candidate: Candidate;
  index: number;
}) {
  const style =
    verdictStyles[candidate.verdict] ?? verdictStyles["REZERVĂ"];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className={`glass-panel flex flex-col rounded-2xl p-6 ${index % 3 === 0 ? "sm:col-span-2" : ""}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl text-white">
            {candidate.firstName} {candidate.lastName}
          </h3>
          <p className="mt-1 text-sm text-[#c9a962]/80">
            {candidate.telegramUsername}
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl text-white/90">
            {candidate.scorGeneral}
          </div>
          <div className="text-[10px] tracking-widest text-white/30 uppercase">
            scor
          </div>
        </div>
      </div>

      <div className="mb-4 space-y-1 text-sm text-white/50">
        <p>{candidate.university}</p>
        <p className="text-white/35">{candidate.hobbies}</p>
        {candidate.hasExperience && candidate.experienceDetails && (
          <p className="text-white/40">Exp: {candidate.experienceDetails}</p>
        )}
      </div>

      <div
        className={`mt-auto rounded-xl border p-4 ${style.border} ${style.bg} ${style.glow}`}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] tracking-widest text-white/40 uppercase">
            Evaluare AI
          </span>
          <span
            className={`text-xs font-semibold tracking-wider uppercase ${style.label}`}
          >
            {candidate.verdict}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-white/65">
          {candidate.profilPsihologic}
        </p>
      </div>

      <time className="mt-4 text-[10px] text-white/25">
        {new Date(candidate.createdAt).toLocaleString("ro-RO")}
      </time>
    </motion.article>
  );
}
