"use client";

import {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";

type BaseProps = {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  pressureDelay?: number;
};

function usePressureTyping(value: string, delayMs: number) {
  const [display, setDisplay] = useState(value);
  const targetRef = useRef(value);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    targetRef.current = value;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (value.length <= display.length) {
      setDisplay(value);
      return;
    }

    const startLen = display.length;
    const newPart = value.slice(startLen);
    newPart.split("").forEach((_, i) => {
      const t = setTimeout(() => {
        setDisplay(value.slice(0, startLen + i + 1));
      }, delayMs * (i + 1));
      timersRef.current.push(t);
    });

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [value, delayMs]);

  return display;
}

export function PressureInput({
  value,
  onValueChange,
  className = "premium-input",
  pressureDelay = 28,
  ...rest
}: BaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const [typing, setTyping] = useState(false);
  const display = usePressureTyping(value, pressureDelay);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(e.target.value);
    setTyping(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setTyping(false), 400);
  };

  return (
    <div className="input-chamber">
      <input
        {...rest}
        className={`${className}${typing ? " pressure-active" : ""}`}
        value={display}
        onChange={handleChange}
      />
    </div>
  );
}

export function PressureTextarea({
  value,
  onValueChange,
  className = "premium-input resize-none",
  pressureDelay = 22,
  ...rest
}: BaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">) {
  const [typing, setTyping] = useState(false);
  const display = usePressureTyping(value, pressureDelay);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onValueChange(e.target.value);
    setTyping(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setTyping(false), 500);
  };

  return (
    <div className="input-chamber">
      <textarea
        {...rest}
        className={`${className}${typing ? " pressure-active" : ""}`}
        value={display}
        onChange={handleChange}
      />
    </div>
  );
}
