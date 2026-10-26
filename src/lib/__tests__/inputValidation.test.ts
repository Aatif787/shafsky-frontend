import { describe, it, expect, vi } from "vitest";
import {
  sanitizeName,
  sanitizePhone,
  preventDigitsKeyDown,
  preventLettersKeyDown,
  validateNameNoDigits,
  validatePhoneNoLetters,
} from "../inputValidation";

describe("inputValidation Utilities", () => {
  describe("sanitizeName", () => {
    it("strips all numbers/digits from name inputs", () => {
      expect(sanitizeName("Aariz123")).toBe("Aariz");
      expect(sanitizeName("John Doe 2")).toBe("John Doe ");
      expect(sanitizeName("12345")).toBe("");
      expect(sanitizeName("O'Connor-Smith")).toBe("O'Connor-Smith");
      expect(sanitizeName("Dr. Jane")).toBe("Dr. Jane");
      expect(sanitizeName("")).toBe("");
    });
  });

  describe("sanitizePhone", () => {
    it("strips all words/letters from phone inputs while preserving digits and symbols", () => {
      expect(sanitizePhone("98765abc43210")).toBe("9876543210");
      expect(sanitizePhone("+91 98765-43210 ext 12")).toBe("+91 98765-43210  12");
      expect(sanitizePhone("call me at +1 (555) 019-2834")).toBe("   +1 (555) 019-2834");
      expect(sanitizePhone("+919876543210")).toBe("+919876543210");
      expect(sanitizePhone("")).toBe("");
    });
  });

  describe("preventDigitsKeyDown", () => {
    it("calls preventDefault when digit key is pressed without modifiers", () => {
      const preventDefault = vi.fn();
      preventDigitsKeyDown({
        key: "5",
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        preventDefault,
      } as any);
      expect(preventDefault).toHaveBeenCalled();
    });

    it("allows non-digit characters and modifier shortcuts", () => {
      const preventDefault = vi.fn();
      preventDigitsKeyDown({
        key: "a",
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        preventDefault,
      } as any);
      expect(preventDefault).not.toHaveBeenCalled();

      // Ctrl+V allowed
      preventDigitsKeyDown({
        key: "v",
        ctrlKey: true,
        metaKey: false,
        altKey: false,
        preventDefault,
      } as any);
      expect(preventDefault).not.toHaveBeenCalled();
    });
  });

  describe("preventLettersKeyDown", () => {
    it("calls preventDefault when letter key is pressed without modifiers", () => {
      const preventDefault = vi.fn();
      preventLettersKeyDown({
        key: "a",
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        preventDefault,
      } as any);
      expect(preventDefault).toHaveBeenCalled();
    });

    it("allows digits, plus, and modifier shortcuts", () => {
      const preventDefault = vi.fn();
      preventLettersKeyDown({
        key: "9",
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        preventDefault,
      } as any);
      expect(preventDefault).not.toHaveBeenCalled();

      preventLettersKeyDown({
        key: "+",
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        preventDefault,
      } as any);
      expect(preventDefault).not.toHaveBeenCalled();
    });
  });

  describe("validateNameNoDigits", () => {
    it("accepts valid names without digits", () => {
      expect(validateNameNoDigits("Aariz Farooqui")).toBeNull();
      expect(validateNameNoDigits("Mary-Jane O'Connor")).toBeNull();
    });

    it("rejects names with digits", () => {
      expect(validateNameNoDigits("Aariz2")).toBe("Please enter a valid passenger name using letters only.");
      expect(validateNameNoDigits("12345")).toBe("Please enter a valid passenger name using letters only.");
    });

    it("rejects empty names", () => {
      expect(validateNameNoDigits("")).toBe("Please enter Name.");
    });
  });

  describe("validatePhoneNoLetters", () => {
    it("accepts valid phones without letters", () => {
      expect(validatePhoneNoLetters("+91 98765 43210")).toBeNull();
      expect(validatePhoneNoLetters("+1(555)019-2834")).toBeNull();
    });

    it("rejects phones containing letters", () => {
      expect(validatePhoneNoLetters("+91 987abc43210")).toBe("Phone number must not contain letters. Please use digits only.");
    });

    it("rejects empty phones", () => {
      expect(validatePhoneNoLetters("")).toBe("Please enter Phone number.");
    });
  });
});
