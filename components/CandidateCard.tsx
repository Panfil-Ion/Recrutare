"use client";

import { parseStoredProfil } from "@/lib/openai";
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
  { border: string; bg: string; label: string; cardClass: string }
> = {
  RECOMANDAT: {
    border: "border-[#7ee8c7]/40",
    bg: "bg-[#7ee8c7]/8",
    label: "text-[#7ee8c7]",
    cardClass: "card-verdict-accept",
  },
  "REZERVĂ": {
    border: "border-[#c9a962]/40",
    bg: "bg-[#c9a962]/8",
    label: "text-[#c9a962]",
    cardClass: "card-verdict-reserve",
  },
  RESPINS: {
    border: "border-red-400/30",
    bg: "bg-red-500/8",
    label: "text-red-400/90",
    cardClass: "card-verdict-reject",
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
  const stored = parseStoredProfil(candidate.profilPsihologic);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
      className={`glass-panel card-blur-layer flex flex-col rounded-2xl p-6 transition ${style.cardClass} ${index % 3 === 0 ? "sm:col-span-2" : ""}`}
    >
      <div className="ai-verdict-strip">{stored.insight}</div>

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
        className={`mt-auto rounded-xl border p-4 ${style.border} ${style.bg}`}
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
        <p className="text-sm leading-relaxed text-white/65">{stored.profil}</p>
        {stored.flags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {stored.flags.map((flag) => (
              <span key={flag} className="flag-badge">
                {flag}
              </span>
            ))}
          </div>
        )}
      </div>

      <time className="mt-4 text-[10px] text-white/25">
        {new Date(candidate.createdAt).toLocaleString("ro-RO")}
      </time>
    </motion.article>
  );
}
