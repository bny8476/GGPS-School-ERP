"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface FieldErrorProps {
  error?: string | null;
  id?: string;
  className?: string;
}

/**
 * Standard accessible inline field error component:
 * - Uses role="alert" and aria-live="polite"
 * - Consistent styling matching the GGPS project color guidelines
 * - Subtle fade-in transition
 */
export const FieldError: React.FC<FieldErrorProps> = ({ error, id, className = "" }) => {
  if (!error) return null;

  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className={`text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 animate-in fade-in duration-150 ${className}`}
    >
      <AlertCircle className="w-3 h-3 shrink-0" />
      <span>{error}</span>
    </p>
  );
};

export default FieldError;
