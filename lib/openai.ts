import OpenAI from "openai";

const SYSTEM_PROMPT = `Evaluează candidatul pentru un program de elită:
1. A respectat regula celor 3 propoziții în descrierea personală?
2. Are minte analitică/creativă?
3. Are orgoliu la mutat scaune (scenariul egoului)?
4. La criză a delegat sau s-a panicat?

Returnează DOAR un JSON valid (fără markdown) cu aceste câmpuri:
- scor_general: număr întreg 1-100
- verdict: una dintre valorile "RECOMANDAT", "REZERVĂ", "RESPINS"
- profil_psihologic: string, maximum 3 propoziții`;

export type AiEvaluation = {
  scor_general: number;
  verdict: "RECOMANDAT" | "REZERVĂ" | "RESPINS";
  profil_psihologic: string;
};

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
- Autodescriere (regula 3 propoziții): ${data.selfDescription}

Experiență: ${data.hasExperience ? "Da" : "Nu"}${data.experienceDetails ? ` — ${data.experienceDetails}` : ""}

Scenariul Egoului (50 scaune): ${data.egoScenario}

Scenariul de Criză: ${data.crisisScenario}
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

  const parsed = JSON.parse(raw) as AiEvaluation;

  const verdictMap: Record<string, AiEvaluation["verdict"]> = {
    RECOMANDAT: "RECOMANDAT",
    ACCEPTAT: "RECOMANDAT",
    REZERVĂ: "REZERVĂ",
    REZERVA: "REZERVĂ",
    RESPINS: "RESPINS",
  };

  const normalizedVerdict =
    verdictMap[parsed.verdict?.toUpperCase?.() ?? ""] ?? "REZERVĂ";

  return {
    scor_general: Math.min(100, Math.max(1, Math.round(parsed.scor_general))),
    verdict: normalizedVerdict,
    profil_psihologic: parsed.profil_psihologic ?? "Profil indisponibil.",
  };
}
