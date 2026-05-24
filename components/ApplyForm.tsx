"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { ProgressBar } from "./ProgressBar";

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

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
  }),
};

export function ApplyForm() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<FormData>(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 3;

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
    setError(null);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          hasExperience: data.hasExperience === true,
          experienceDetails:
            data.hasExperience === true ? data.experienceDetails : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Eroare la trimitere");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare necunoscută");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
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
    <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}>
      <ProgressBar currentStep={step} totalSteps={totalSteps} />

      <div className="relative min-h-[420px] overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <h2 className="font-display mb-6 text-2xl text-white/90">
                Date personale
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs tracking-wider text-white/50 uppercase">
                    Nume
                  </label>
                  <input
                    required
                    className="premium-input"
                    value={data.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    placeholder="Popescu"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs tracking-wider text-white/50 uppercase">
                    Prenume
                  </label>
                  <input
                    required
                    className="premium-input"
                    value={data.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    placeholder="Maria"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs tracking-wider text-white/50 uppercase">
                  Username Telegram
                </label>
                <input
                  required
                  className="premium-input"
                  value={data.telegramUsername}
                  onChange={(e) => update("telegramUsername", e.target.value)}
                  placeholder="@username"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs tracking-wider text-white/50 uppercase">
                  Universitate / An
                </label>
                <input
                  required
                  className="premium-input"
                  value={data.university}
                  onChange={(e) => update("university", e.target.value)}
                  placeholder="UBB — Anul 2"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs tracking-wider text-white/50 uppercase">
                  Hobby-uri
                </label>
                <input
                  required
                  className="premium-input"
                  value={data.hobbies}
                  onChange={(e) => update("hobbies", e.target.value)}
                  placeholder="Fotografie, debate, hiking..."
                />
              </div>
              <div>
                <label className="mb-2 block text-xs tracking-wider text-white/50 uppercase">
                  Descrie-te
                </label>
                <textarea
                  required
                  rows={4}
                  className="premium-input resize-none"
                  value={data.selfDescription}
                  onChange={(e) => update("selfDescription", e.target.value)}
                  placeholder="Descrie-te. Regulă strictă: Folosește exact 3 propoziții."
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <h2 className="font-display mb-6 text-2xl text-white/90">
                Experiență &amp; Ego
              </h2>
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
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="hasExperience"
                        required
                        checked={data.hasExperience === opt.value}
                        onChange={() => update("hasExperience", opt.value)}
                        className="h-4 w-4 accent-[#c9a962]"
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
                  >
                    <label className="mb-2 block text-xs tracking-wider text-white/50 uppercase">
                      Detalii experiență
                    </label>
                    <input
                      required
                      className="premium-input"
                      value={data.experienceDetails}
                      onChange={(e) =>
                        update("experienceDetails", e.target.value)
                      }
                      placeholder="Ce evenimente, ce rol ai avut?"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <div>
                <label className="mb-2 block text-xs tracking-wider text-white/50 uppercase">
                  Scenariul Egoului
                </label>
                <textarea
                  required
                  rows={5}
                  className="premium-input resize-none"
                  value={data.egoScenario}
                  onChange={(e) => update("egoScenario", e.target.value)}
                  placeholder="Dacă ești pus să muți 50 de scaune în prima zi, cum reacționezi intern și extern?"
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <h2 className="font-display mb-6 text-2xl text-white/90">
                Scenariul de Criză
              </h2>
              <div>
                <label className="mb-2 block text-xs tracking-wider text-white/50 uppercase">
                  Plan tactic sub presiune
                </label>
                <textarea
                  required
                  rows={6}
                  className="premium-input resize-none"
                  value={data.crisisScenario}
                  onChange={(e) => update("crisisScenario", e.target.value)}
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
          <button
            type="button"
            onClick={back}
            className="rounded-xl border border-white/10 px-6 py-3 text-sm text-white/60 transition hover:border-white/20 hover:text-white"
          >
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
            {submitting ? "Se evaluează..." : "Trimite candidatura"}
          </button>
        )}
      </div>
    </form>
  );
}
