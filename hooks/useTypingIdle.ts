"use client";

import { pickIdleHint } from "@/lib/behavioral";
import { useCallback, useEffect, useRef, useState } from "react";

type UseTypingIdleOptions = {
  enabled?: boolean;
  idleMs?: number;
  minCharsBeforeHint?: number;
};

export function useTypingIdle(
  value: string,
  options: UseTypingIdleOptions = {}
) {
  const {
    enabled = true,
    idleMs = 6000,
    minCharsBeforeHint = 3,
  } = options;

  const [showIdleHint, setShowIdleHint] = useState(false);
  const [idleHint, setIdleHint] = useState("");
  const lastActivityRef = useRef(Date.now());
  const hintIndexRef = useRef(0);
  const wasTypingRef = useRef(false);

  const pingActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    wasTypingRef.current = true;
    setShowIdleHint(false);
  }, []);

  useEffect(() => {
    if (!enabled || value.trim().length < minCharsBeforeHint) {
      setShowIdleHint(false);
      return;
    }

    const tick = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= idleMs && wasTypingRef.current) {
        setIdleHint(pickIdleHint(hintIndexRef.current));
        hintIndexRef.current += 1;
        setShowIdleHint(true);
        wasTypingRef.current = false;
      }
    }, 400);

    return () => clearInterval(tick);
  }, [enabled, idleMs, minCharsBeforeHint, value]);

  useEffect(() => {
    if (value.trim().length > 0) {
      pingActivity();
    }
  }, [value, pingActivity]);

  return { showIdleHint, idleHint, pingActivity };
}
