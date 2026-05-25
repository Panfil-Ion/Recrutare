"use client";

import {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  useRef,
  useState,
} from "react";

type BaseProps = {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
};

export function PressureInput({
  value,
  onValueChange,
  className = "premium-input",
  ...rest
}: BaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const [typing, setTyping] = useState(false);
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
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}

export function PressureTextarea({
  value,
  onValueChange,
  className = "premium-input resize-none",
  ...rest
}: BaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">) {
  const [typing, setTyping] = useState(false);
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
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
