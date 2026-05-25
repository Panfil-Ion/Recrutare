"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  analyzeBehavioralText,
  getThreeSentenceConstraint,
} from "@/lib/behavioral";
import { useTypingIdle } from "@/hooks/useTypingIdle";
import { useMemo, useState } from "react";
import { PressureTextarea } from "./PressureField";

type BehavioralTextareaProps = {
  value: string;
  onValueChange: (value: string) => void;
  fieldId: string;
  pressureDelay?: number;
  enforceThreeSentences?: boolean;
  onFocusField?: (fieldId: string | null) => void;
  rows?: number;
  placeholder?: string;
  required?: boolean;
};

export function BehavioralTextarea({
  value,
  onValueChange,
  fieldId,
  pressureDelay = 24,
  enforceThreeSentences = false,
  onFocusField,
  rows = 4,
  placeholder,
  required,
}: BehavioralTextareaProps) {
  const [focused, setFocused] = useState(false);

  const constraint = useMemo(
    () => (enforceThreeSentences ? getThreeSentenceConstraint(value) : null),
    [enforceThreeSentences, value]
  );

  const feedback = useMemo(
    () =>
      analyzeBehavioralText(value, {
        enforceThreeSentences: enforceThreeSentences,
      }),
    [value, enforceThreeSentences]
  );

  const { showIdleHint, idleHint, pingActivity } = useTypingIdle(value, {
    enabled: focused,
    idleMs: 6000,
  });

  const showFeedback = value.trim().length > 0 && feedback.message;
  const showConstraint = enforceThreeSentences && (focused || value.trim().length > 0);

  return (
    <div className="behavioral-field" data-field={fieldId}>
      {showConstraint && constraint && (
        <div
          className={`constraint-meter constraint-meter--${constraint.status}`}
          role="status"
          aria-live="polite"
        >
          <span className="constraint-meter-label">{constraint.label}</span>
          {constraint.status === "over" && (
            <span className="constraint-meter-icon" aria-hidden>
              ⚠
            </span>
          )}
        </div>
      )}

      <PressureTextarea
        required={required}
        rows={rows}
        pressureDelay={pressureDelay}
        value={value}
        onValueChange={(v) => {
          pingActivity();
          onValueChange(v);
        }}
        placeholder={placeholder}
        onFocus={() => {
          setFocused(true);
          onFocusField?.(fieldId);
          pingActivity();
        }}
        onBlur={() => {
          setFocused(false);
          onFocusField?.(null);
        }}
      />

      <div className="behavioral-feedback-layer" aria-live="polite">
        <AnimatePresence mode="wait">
          {showFeedback && (
            <motion.p
              key={feedback.message}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className={`behavioral-feedback behavioral-feedback--${feedback.tone}`}
            >
              {feedback.message}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showIdleHint && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="behavioral-idle-hint"
            >
              {idleHint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
