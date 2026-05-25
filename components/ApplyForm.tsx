"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useMemo, useState } from "react";
import { AiPresence } from "./AiPresence";
import { BehavioralTextarea } from "./BehavioralTextarea";
import { PressureInput } from "./PressureField";
import { ProgressBar } from "./ProgressBar";
import { SubmitEvaluation } from "./SubmitEvaluation";

type FormData = {
  firstName: string;
  lastName: string;
  telegramUsername: string;
  university: string;
  hobbies: string;
  selfDescription: string;
  hasExperience: boolean | null;
  experienceDetails: string;
  egoScenario: string;
  crisisScenario: string;
};

type FlowMode = "rigid" | "neutral" | "fluid";

const initialData: FormData = {
  firstName: "",
  lastName: "",
  telegramUsername: "",
  university: "",
  hobbies: "",
  selfDescription: "",
  hasExperience: null,
  experienceDetails: "",
  egoScenario: "",
  crisisScenario: "",
};

function computeFlowMode(data: FormData): FlowMode {
  const narrative = [
    data.selfDescription,
    data.egoScenario,
    data.crisisScenario,
  ].filter((t) => t.trim().length > 0);

  if (narrative.length === 0) return "neutral";

  const avgLen =
    narrative.reduce((sum, t) => sum + t.trim().length, 0) / narrative.length;
  const avgWords =
    narrative.reduce(
      (sum, t) => sum + t.trim().split(/\s+/).filter(Boolean).length,
      0
    ) / narrative.length;

  if (avgLen < 50 || avgWords < 10) return "rigid";
  if (avgLen > 160 || avgWords > 28) return "fluid";
  return "neutral";
}

function flowTransition(mode: FlowMode) {
  const duration = mode === "rigid" ? 0.18 : mode === "fluid" ? 0.58 : 0.35;
  const ease =
    mode === "rigid"
      ? ([0.4, 0, 0.2, 1] as const)
      : mode === "fluid"
        ? ([0.16, 1, 0.3, 1] as const)
        : ([0.22, 1, 0.36, 1] as const);
  return { duration, ease };
}

function slideVariants(mode: FlowMode, direction: number) {
  const offset = mode === "rigid" ? 20 : mode === "fluid" ? 44 : 36;
  return {
    enter: { x: direction > 0 ? offset : -offset, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: direction > 0 ? -offset : offset, opacity: 0 },
  };
}

const PHASE_MS = 1500;
const MIN_SUBMIT_MS = 4500;

export function ApplyForm() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<FormData>(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);

  const totalSteps = 3;
  const flowMode = useMemo(() => computeFlowMode(data), [data]);
  const transition = flowTransition(flowMode);
  const pressureDelay =
    flowMode === "rigid" ? 40 : flowMode === "fluid" ? 16 : 26;

  const update = (field: keyof FormData, value: string | boolean | null) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const next = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, totalSteps));
  };

  const back = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitPhase(0);
    setError(null);
    setActiveField(null);

    const phaseTimer = setInterval(() => {
      setSubmitPhase((p) => Math.min(p + 1, 2));
    }, PHASE_MS);

    const minDisplay = new Promise((r) => setTimeout(r, MIN_SUBMIT_MS));

    try {
      const [res] = await Promise.all([
        fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            hasExperience: data.hasExperience === true,
            experienceDetails:
              data.hasExperience === true ? data.experienceDetails : undefined,
          }),
        }),
        minDisplay,
      ]);

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Eroare la trimitere");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare necunoscută");
    } finally {
      clearInterval(phaseTimer);
      setSubmitting(false);
      setSubmitPhase(0);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={transition}
        className="glass-panel rounded-2xl p-12 text-center"
      >
        <div className="font-display mb-4 text-3xl text-[#c9a962]">
          Candidatura trimisă
        </div>
        <p className="text-white/60">
          Evaluarea AI este în curs. Vei fi contactat pe Telegram dacă treci
          filtrul.
        </p>
      </motion.div>
    );
  }

  return (
    <div className={`assessment-chamber flow-${flowMode}`}>
      <AiPresence
        activeField={activeField}
        flowMode={flowMode}
        isProcessing={submitting}
      />

      <form
        onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}
        className="relative"
      >
        <SubmitEvaluation phase={submitPhase} visible={submitting} />

        <div className={submitting ? "pointer-events-none opacity-40" : ""}>
          <ProgressBar currentStep={step} totalSteps={totalSteps} flowMode={flowMode} />

          <div className="relative min-h-[420px] overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants(flowMode, direction)}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                  className="flow-motion space-y-5"
                >
                  <h2 className="font-display mb-2 text-2xl text-white/90">
                    Date personale
                  </h2>
                  <p className="mb-6 text-xs tracking-wider text-white/30 uppercase">
                    Interview chamber · Pas 1
                  </p>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs tracking-wider text-white/50 uppercase">
                        Nume
                      </label>
                      <PressureInput
                        required
                        pressureDelay={pressureDelay}
                        value={data.firstName}
                        onValueChange={(v) => update("firstName", v)}
                        placeholder="Popescu"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs tracking-wider text-white/50 uppercase">
                        Prenume
                      </label>
                      <PressureInput
                        required
                        pressureDelay={pressureDelay}
                        value={data.lastName}
                        onValueChange={(v) => update("lastName", v)}
                        placeholder="Maria"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs tracking-wider text-white/50 uppercase">
                      Username Telegram
                    </label>
                    <PressureInput
                      required
                      pressureDelay={pressureDelay}
                      value={data.telegramUsername}
                      onValueChange={(v) => update("telegramUsername", v)}
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs tracking-wider text-white/50 uppercase">
                      Universitate / An
                    </label>
                    <PressureInput
                      required
                      pressureDelay={pressureDelay}
                      value={data.university}
                      onValueChange={(v) => update("university", v)}
                      placeholder="UBB — Anul 2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs tracking-wider text-white/50 uppercase">
                      Hobby-uri
                    </label>
                    <PressureInput
                      required
                      pressureDelay={pressureDelay}
                      value={data.hobbies}
                      onValueChange={(v) => update("hobbies", v)}
                      placeholder="Fotografie, debate, hiking..."
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs tracking-wider text-white/50 uppercase">
                      Descrie-te
                    </label>
                    <p className="prompt-hint mb-2">
                      Descrie-te în exact 3 propoziții. Fiecare propoziție trebuie
                      să spună ceva ce nu poate fi dedus din CV-ul tău.
                    </p>
                    <BehavioralTextarea
                      required
                      rows={4}
                      fieldId="selfDescription"
                      enforceThreeSentences
                      pressureDelay={pressureDelay}
                      value={data.selfDescription}
                      onValueChange={(v) => update("selfDescription", v)}
                      onFocusField={setActiveField}
                      placeholder="Propoziția 1. Propoziția 2. Propoziția 3."
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants(flowMode, direction)}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                  className="flow-motion space-y-5"
                >
                  <h2 className="font-display mb-2 text-2xl text-white/90">
                    Experiență &amp; Ego
                  </h2>
                  <p className="mb-6 text-xs tracking-wider text-white/30 uppercase">
                    Interview chamber · Pas 2
                  </p>
                  <div>
                    <label className="mb-3 block text-xs tracking-wider text-white/50 uppercase">
                      Ai experiență în organizare de evenimente?
                    </label>
                    <div className="flex gap-6">
                      {[
                        { label: "Da", value: true },
                        { label: "Nu", value: false },
                      ].map((opt) => (
                        <label
                          key={String(opt.value)}
                          className="group flex cursor-pointer items-center gap-2 transition hover:opacity-90"
                        >
                          <input
                            type="radio"
                            name="hasExperience"
                            required
                            checked={data.hasExperience === opt.value}
                            onChange={() => update("hasExperience", opt.value)}
                            className="h-4 w-4 accent-[#c9a962] transition-transform group-hover:scale-110"
                          />
                          <span className="text-white/80">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <AnimatePresence>
                    {data.hasExperience === true && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={transition}
                      >
                        <label className="mb-2 block text-xs tracking-wider text-white/50 uppercase">
                          Detalii experiență
                        </label>
                        <PressureInput
                          required
                          pressureDelay={pressureDelay}
                          value={data.experienceDetails}
                          onValueChange={(v) => update("experienceDetails", v)}
                          placeholder="Ce evenimente, ce rol ai avut?"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div>
                    <label className="mb-2 block text-xs tracking-wider text-white/50 uppercase">
                      Scenariul Egoului
                    </label>
                    <p className="prompt-hint mb-2">
                      Nu există răspuns corect. Există doar reacția ta reală.
                    </p>
                    <BehavioralTextarea
                      required
                      rows={5}
                      fieldId="egoScenario"
                      pressureDelay={pressureDelay}
                      value={data.egoScenario}
                      onValueChange={(v) => update("egoScenario", v)}
                      onFocusField={setActiveField}
                      placeholder="Dacă ești pus să muți 50 de scaune în prima zi, cum reacționezi intern și extern?"
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants(flowMode, direction)}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                  className="flow-motion space-y-5"
                >
                  <h2 className="font-display mb-2 text-2xl text-white/90">
                    Scenariul de Criză
                  </h2>
                  <p className="mb-6 text-xs tracking-wider text-white/30 uppercase">
                    Interview chamber · Pas 3
                  </p>
                  <div>
                    <label className="mb-2 block text-xs tracking-wider text-white/50 uppercase">
                      Plan tactic sub presiune
                    </label>
                    <p className="prompt-hint mb-2">
                      Nu ai voie să ignori nicio problemă complet. Doar
                      prioritizezi.
                    </p>
                    <BehavioralTextarea
                      required
                      rows={6}
                      fieldId="crisisScenario"
                      pressureDelay={pressureDelay}
                      value={data.crisisScenario}
                      onValueChange={(v) => update("crisisScenario", v)}
                      onFocusField={setActiveField}
                      placeholder="Zero buget, 2 ore până la eveniment, apă/mâncare anulate, 5 voluntari panicați. Primii 3 pași tactici."
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-400/90">{error}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-10 flex items-center justify-between gap-4">
            {step > 1 ? (
              <button type="button" onClick={back} className="btn-ghost">
                Înapoi
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={next}
                className="premium-btn text-sm"
              >
                Continuă
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="premium-btn text-sm"
              >
                {submitting ? "Evaluare în curs…" : "Trimite candidatura"}
              </button>
            )}
          </div>

          <p className="system-note">
            System note: This evaluation does not measure intelligence. It
            measures behavior under constraint.
          </p>
        </div>
      </form>
    </div>
  );
}
