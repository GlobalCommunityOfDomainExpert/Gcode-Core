"use client";

import { ChangeEvent, ClipboardEvent, KeyboardEvent, useRef } from "react";

export interface OtpInputProps {
  length?: number;
  error?: boolean;
  disabled?: boolean;
  onChange?: (code: string) => void;
}

export function OtpInput({
  length = 6,
  error = false,
  disabled = false,
  onChange,
}: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  function emitChange() {
    const code = inputsRef.current.map((el) => el?.value ?? "").join("");
    onChange?.(code);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>, index: number) {
    const value = event.target.value
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(-1);
    event.target.value = value;

    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    emitChange();
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) {
    if (event.key === "Backspace" && !event.currentTarget.value && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, length);

    if (!pasted) return;

    pasted.split("").forEach((char, i) => {
      const el = inputsRef.current[i];
      if (el) el.value = char;
    });

    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();

    emitChange();
  }

  return (
    <div
      role="group"
      aria-label="One-time passcode"
      className="flex justify-center gap-2"
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="text"
          maxLength={1}
          autoFocus={index === 0}
          disabled={disabled}
          aria-invalid={error || undefined}
          onChange={(event) => handleChange(event, index)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          onPaste={handlePaste}
          className={
            `bg-surface-light text-text-primary text-large size-12 rounded-sm border text-center font-semibold shadow-inner ` +
            `transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ` +
            `disabled:bg-bg-light disabled:cursor-not-allowed disabled:opacity-50 ` +
            (error
              ? "border-danger focus-visible:ring-danger"
              : "border-border-light hover:border-border-hover focus-visible:border-primary focus-visible:ring-primary")
          }
        />
      ))}
    </div>
  );
}
