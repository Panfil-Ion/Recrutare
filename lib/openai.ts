import OpenAI from "openai";

const SYSTEM_PROMPT = `Evaluează candidatul pentru un program de elită.

Criterii clasice:
1. A respectat regula celor 3 propoziții în descrierea personală (fiecare propoziție trebuie să spună ceva ce nu poate fi dedus din CV)?
2. Are minte analitică/creativă?
3. Reacția reală la scenariul egoului (50 scaune) — nu există răspuns corect, doar reacția autentică.
4. La criză: nu ignoră probleme, doar prioritizează — a delegat sau s-a panicat?

Evaluează candidatul și detectează explicit (scoruri întregi 0–100):
- presence_of_social_desirability_bias
- avoidance_behavior
- ego_defensiveness
- decision_ownership_level

În plus:
- Detectează dacă răspunsul pare „template de internet / LinkedIn answer” (internet_template_detected: boolean)
- Penalizează răspunsurile perfecte, dar lipsite de fricțiune sau conflict real
- Marchează dacă persoana evită să piardă ceva în decizii (loss_avoidance_detected: boolean)
- over_optimized_response: true dacă răspunsurile sunt perfect structurate + lipsite de vulnerabilitate

Returnează DOAR un JSON valid (fără markdown) cu aceste câmpuri:
- scor_general: număr întreg 1-100
- verdict: una dintre "RECOMANDAT", "REZERVĂ", "RESPINS"
- profil_psihologic: string, maximum 3 propoziții
- insight_cheie: string, o singură propoziție — insight principal pentru dashboard
- presence_of_social_desirability_bias: 0-100
- avoidance_behavior: 0-100
- ego_defensiveness: 0-100
- decision_ownership_level: 0-100
- internet_template_detected: boolean
- loss_avoidance_detected: boolean
- over_optimized_response: boolean`;

export type AiScores = {
  presence_of_social_desirability_bias: number;
  avoidance_behavior: number;
  ego_defensiveness: number;
  decision_ownership_level: number;
};

export type AiEvaluation = {
  scor_general: number;
  verdict: "RECOMANDAT" | "REZERVĂ" | "RESPINS";
  profil_psihologic: string;
  insight_cheie: string;
  flags: string[];
  scores: AiScores;
  internet_template_detected: boolean;
  loss_avoidance_detected: boolean;
  over_optimized_response: boolean;
};

export type StoredProfil = {
  profil: string;
  insight: string;
  flags: string[];
  scores: AiScores;
};

export function serializeProfil(evaluation: AiEvaluation): string {
  const payload: StoredProfil = {
    profil: evaluation.profil_psihologic,
    insight: evaluation.insight_cheie,
    flags: evaluation.flags,
    scores: evaluation.scores,
  };
  return JSON.stringify(payload);
}

export function parseStoredProfil(raw: string): StoredProfil {
  try {
    const parsed = JSON.parse(raw) as StoredProfil;
    if (parsed.profil && parsed.insight) {
      return {
        profil: parsed.profil,
        insight: parsed.insight,
        flags: parsed.flags ?? [],
        scores: parsed.scores ?? defaultScores(),
      };
    }
  } catch {
    /* legacy plain text */
  }
  return {
    profil: raw,
    insight: raw.split(/[.!?]/)[0]?.trim() || raw.slice(0, 120),
    flags: [],
    scores: defaultScores(),
  };
}

function defaultScores(): AiScores {
  return {
    presence_of_social_desirability_bias: 0,
    avoidance_behavior: 0,
    ego_defensiveness: 0,
    decision_ownership_level: 50,
  };
}

type RawAiResponse = {
  scor_general: number;
  verdict: string;
  profil_psihologic?: string;
  insight_cheie?: string;
  presence_of_social_desirability_bias?: number;
  avoidance_behavior?: number;
  ego_defensiveness?: number;
  decision_ownership_level?: number;
  internet_template_detected?: boolean;
  loss_avoidance_detected?: boolean;
  over_optimized_response?: boolean;
};

const VERDICT_TIERS: AiEvaluation["verdict"][] = [
  "RECOMANDAT",
  "REZERVĂ",
  "RESPINS",
];

function clampScore(n: unknown): number {
  return Math.min(100, Math.max(0, Math.round(Number(n) || 0)));
}

function downgradeVerdict(
  verdict: AiEvaluation["verdict"]
): AiEvaluation["verdict"] {
  const idx = VERDICT_TIERS.indexOf(verdict);
  if (idx < 0 || idx >= VERDICT_TIERS.length - 1) {
    return verdict;
  }
  return VERDICT_TIERS[idx + 1];
}

export function applyRedFlagLogic(
  parsed: RawAiResponse,
  base: Omit<AiEvaluation, "flags">
): AiEvaluation {
  const flags: string[] = [];
  const scores: AiScores = {
    presence_of_social_desirability_bias: clampScore(
      parsed.presence_of_social_desirability_bias
    ),
    avoidance_behavior: clampScore(parsed.avoidance_behavior),
    ego_defensiveness: clampScore(parsed.ego_defensiveness),
    decision_ownership_level: clampScore(parsed.decision_ownership_level),
  };

  let verdict = base.verdict;
  let scor_general = base.scor_general;

  if (scores.presence_of_social_desirability_bias > 70) {
    flags.push("THEATRICAL");
    scor_general = Math.max(1, scor_general - 5);
  }

  if (scores.decision_ownership_level < 40) {
    verdict = downgradeVerdict(verdict);
    flags.push("LOW_OWNERSHIP");
  }

  if (parsed.over_optimized_response === true) {
    flags.push("OVER-OPTIMIZED RESPONSE");
    scor_general = Math.max(1, scor_general - 8);
  }

  if (parsed.internet_template_detected === true) {
    flags.push("TEMPLATE_DETECTED");
    scor_general = Math.max(1, scor_general - 10);
  }

  if (parsed.loss_avoidance_detected === true) {
    flags.push("LOSS_AVOIDANCE");
  }

  if (scores.avoidance_behavior > 75) {
    flags.push("HIGH_AVOIDANCE");
  }

  return {
    ...base,
    verdict,
    scor_general,
    flags,
    scores,
    internet_template_detected: parsed.internet_template_detected === true,
    loss_avoidance_detected: parsed.loss_avoidance_detected === true,
    over_optimized_response: parsed.over_optimized_response === true,
  };
}

export type CandidatePayload = {
  firstName: string;
  lastName: string;
  telegramUsername: string;
  university: string;
  hobbies: string;
  selfDescription: string;
  hasExperience: boolean;
  experienceDetails?: string;
  egoScenario: string;
  crisisScenario: string;
};

export async function evaluateCandidate(
  data: CandidatePayload
): Promise<AiEvaluation> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY nu este configurată");
  }

  const openai = new OpenAI({ apiKey });

  const userContent = `
Date personale:
- Nume: ${data.firstName} ${data.lastName}
- Telegram: ${data.telegramUsername}
- Universitate/An: ${data.university}
- Hobby-uri: ${data.hobbies}
- Autodescriere (exact 3 propoziții, fiecare cu info nededusă din CV): ${data.selfDescription}

Experiență: ${data.hasExperience ? "Da" : "Nu"}${data.experienceDetails ? ` — ${data.experienceDetails}` : ""}

Scenariul Egoului (50 scaune — reacție reală, fără răspuns corect): ${data.egoScenario}

Scenariul de Criză (trebuie să prioritizeze toate problemele, nu să ignore): ${data.crisisScenario}
`.trim();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("OpenAI nu a returnat un răspuns");
  }

  const parsed = JSON.parse(raw) as RawAiResponse;

  const verdictMap: Record<string, AiEvaluation["verdict"]> = {
    RECOMANDAT: "RECOMANDAT",
    ACCEPTAT: "RECOMANDAT",
    REZERVĂ: "REZERVĂ",
    REZERVA: "REZERVĂ",
    RESPINS: "RESPINS",
  };

  const normalizedVerdict =
    verdictMap[parsed.verdict?.toUpperCase?.() ?? ""] ?? "REZERVĂ";

  const base: Omit<AiEvaluation, "flags"> = {
    scor_general: Math.min(100, Math.max(1, Math.round(parsed.scor_general))),
    verdict: normalizedVerdict,
    profil_psihologic: parsed.profil_psihologic ?? "Profil indisponibil.",
    insight_cheie:
      parsed.insight_cheie ??
      (parsed.profil_psihologic?.split(/[.!?]/)[0]?.trim() ||
        "Profil în evaluare."),
    scores: defaultScores(),
    internet_template_detected: false,
    loss_avoidance_detected: false,
    over_optimized_response: false,
  };

  return applyRedFlagLogic(parsed, base);
}
