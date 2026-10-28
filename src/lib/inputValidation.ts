import type React from "react";

/**
 * Universal Input Validation & Sanitation Utilities
 *
 * Rules:
 * 1. Name fields: Strictly do not accept digits (0-9).
 * 2. Phone fields: Strictly do not accept letters/words (a-zA-Z).
 */

/**
 * Strips all digits (0-9) from a name string.
 * Preserves letters, spaces, hyphens, dots, and apostrophes.
 */
export function sanitizeName(value: string): string {
  if (!value) return "";
  return value.replace(/[0-9]/g, "");
}

/**
 * Strips all Latin/alphabetic letters (a-zA-Z) from a phone string.
 * Preserves digits, plus sign, spaces, hyphens, and parentheses.
 */
export function sanitizePhone(value: string): string {
  if (!value) return "";
  return value.replace(/[a-zA-Z]/g, "");
}

/**
 * KeyDown handler to prevent entering digits (0-9) in any name field.
 * Allows navigation, backspace, delete, tab, copy, paste, select-all shortcuts.
 */
export function preventDigitsKeyDown(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
  // Allow keyboard shortcuts (Ctrl+A, Ctrl+C, Ctrl+V, Cmd+A, etc.)
  if (e.ctrlKey || e.metaKey || e.altKey) {
    return;
  }
  // If the typed character is a digit (0-9), prevent entry
  if (e.key && e.key.length === 1 && /[0-9]/.test(e.key)) {
    e.preventDefault();
  }
}

/**
 * KeyDown handler to prevent entering words/letters (a-zA-Z) in any phone field.
 * Allows navigation, backspace, delete, tab, copy, paste, select-all shortcuts.
 */
export function preventLettersKeyDown(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
  // Allow keyboard shortcuts (Ctrl+A, Ctrl+C, Ctrl+V, Cmd+A, etc.)
  if (e.ctrlKey || e.metaKey || e.altKey) {
    return;
  }
  // If the typed character is an alphabetic letter (a-zA-Z), prevent entry
  if (e.key && e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
    e.preventDefault();
  }
}

/**
 * Validates that a name does not contain digits and is not empty.
 * Returns true if valid, false if invalid.
 */
export function validateNameNoDigits(name: string): boolean {
  const trimmed = (name || "").trim();
  if (!trimmed) {
    return false;
  }
  return !/[0-9]/.test(trimmed);
}

/**
 * Validates that a phone number does not contain letters and has valid phone characters.
 * Returns true if valid, false if invalid.
 */
export function validatePhoneNoLetters(phone: string): boolean {
  const trimmed = (phone || "").trim();
  if (!trimmed) {
    return false;
  }
  return !/[a-zA-Z]/.test(trimmed);
}

/**
 * Returns validation error message for a name, or null if valid.
 */
export function getNameValidationError(
  name: string,
  fieldLabel = "Name"
): string | null {
  const trimmed = (name || "").trim();
  if (!trimmed) {
    return `Please enter ${fieldLabel}.`;
  }
  if (/[0-9]/.test(trimmed)) {
    return "Please enter a valid passenger name using letters only.";
  }
  return null;
}

/**
 * Returns validation error message for a phone number, or null if valid.
 */
export function getPhoneValidationError(
  phone: string,
  fieldLabel = "Phone number"
): string | null {
  const trimmed = (phone || "").trim();
  if (!trimmed) {
    return `Please enter ${fieldLabel}.`;
  }
  if (/[a-zA-Z]/.test(trimmed)) {
    return `${fieldLabel} must not contain letters. Please use digits only.`;
  }
  return null;
}
