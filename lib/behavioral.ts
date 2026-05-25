export type ConstraintStatus = "empty" | "under" | "exact" | "over";

export type BehavioralFeedback = {
  message: string;
  tone: "neutral" | "stable" | "warn" | "alert";
};

const FILLER_RO =
  /\b(foarte|extrem|pasiune|dedicat|profesionist|echilibrat|perseverent|motivat|dinamic|proactiv|responsabil|implicat|serios|muncitor)\b/gi;
const TEMPLATE_EN =
  /\b(leadership|synergy|team player|passionate|dedicated|hard[- ]?working|go[- ]?getter)\b/i;
const HEDGING =
  /\b(poate|probabil|cred că|aș zice|în general|cam|oarecum|depinde)\b/gi;

/** Numără propoziții terminate (. ! ?) sau blocuri separate prin newline. */
export function countSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;

  const byPunctuation = trimmed
    .split(/(?<=[.!?])(?:\s+|\n+|$)/)
    .map((s) => s.trim())
    .filter((s) => s.replace(/[.!?]+$/, "").trim().length > 2);

  if (byPunctuation.length > 0) return byPunctuation.length;

  const byLines = trimmed
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

  if (byLines.length > 1) return byLines.length;
  return 1;
}

export function getThreeSentenceConstraint(text: string): {
  count: number;
  status: ConstraintStatus;
  label: string;
} {
  const count = countSentences(text);
  const target = 3;

  if (!text.trim()) {
    return { count: 0, status: "empty", label: `0 / ${target} propoziții detectate` };
  }
  if (count > target) {
    return {
      count,
      status: "over",
      label: "Constraint violated",
    };
  }
  if (count === target) {
    return {
      count,
      status: "exact",
      label: `${count} / ${target} propoziții detectate`,
    };
  }
  return {
    count,
    status: "under",
    label: `${count} / ${target} propoziții detectate`,
  };
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function sentenceLengthVariance(text: string): number {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.split(/\s+/).filter(Boolean).length)
    .filter((n) => n > 0);
  if (parts.length < 2) return 0;
  const mean = parts.reduce((a, b) => a + b, 0) / parts.length;
  return parts.reduce((a, b) => a + (b - mean) ** 2, 0) / parts.length;
}

export function analyzeBehavioralText(
  text: string,
  options?: { enforceThreeSentences?: boolean }
): BehavioralFeedback {
  const trimmed = text.trim();
  if (!trimmed) {
    return { message: "", tone: "neutral" };
  }

  const words = wordCount(trimmed);
  const sentences = countSentences(trimmed);
  const fillers = (trimmed.match(FILLER_RO) || []).length;
  const hedges = (trimmed.match(HEDGING) || []).length;
  const variance = sentenceLengthVariance(trimmed);

  if (options?.enforceThreeSentences) {
    if (sentences > 3) {
      return {
        message: "Constraint adherence unstable.",
        tone: "alert",
      };
    }
    if (sentences === 3 && words >= 22) {
      return {
        message: "Constraint adherence stable.",
        tone: "stable",
      };
    }
    if (sentences < 3 && words >= 8) {
      return {
        message: "Narrative clarity unstable.",
        tone: "warn",
      };
    }
  }

  if (words < 14) {
    return {
      message: "Low-information response detected.",
      tone: "warn",
    };
  }

  if (TEMPLATE_EN.test(trimmed) || fillers >= 4) {
    return {
      message: "Template-like phrasing detected.",
      tone: "warn",
    };
  }

  if (variance > 90 || hedges >= 3) {
    return {
      message: "Narrative clarity unstable.",
      tone: "warn",
    };
  }

  if (words >= 35 && sentences >= 2 && variance <= 60) {
    return {
      message: "Response density within evaluable range.",
      tone: "stable",
    };
  }

  if (options?.enforceThreeSentences && sentences === 3) {
    return {
      message: "Constraint adherence stable.",
      tone: "stable",
    };
  }

  return {
    message: "Signal acquisition in progress.",
    tone: "neutral",
  };
}

export const IDLE_HINTS = [
  "Most edited answers score lower in authenticity.",
  "Direct answers are easier to evaluate.",
  "Hesitation patterns are part of the behavioral record.",
] as const;

export function pickIdleHint(seed: number): string {
  return IDLE_HINTS[seed % IDLE_HINTS.length];
}

export const SUBMIT_PHASES = [
  "Parsing behavioral structure...",
  "Detecting response patterns...",
  "Archiving evaluation...",
] as const;
