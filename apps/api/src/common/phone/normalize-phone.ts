export function normalizePhone(input: string): string {
  const raw = String(input ?? "").trim();
  const digits = raw.replace(/[^\d+]/g, "");

  if (!digits) return "";

  const withPlus = digits.startsWith("+") ? `+${digits.slice(1).replace(/\D/g, "")}` : digits.replace(/\D/g, "");

  if (withPlus.startsWith("+")) return withPlus;

  // Israel-friendly normalization:
  // - 05XXXXXXXX => +9725XXXXXXXX
  // - 5XXXXXXXX => +9725XXXXXXXX (missing leading 0)
  // - 9725XXXXXXXX => +9725XXXXXXXX
  const onlyDigits = withPlus;
  if (onlyDigits.startsWith("0") && onlyDigits.length === 10) {
    return `+972${onlyDigits.slice(1)}`;
  }
  if (onlyDigits.startsWith("5") && onlyDigits.length === 9) {
    return `+972${onlyDigits}`;
  }
  if (onlyDigits.startsWith("972")) {
    return `+${onlyDigits}`;
  }

  // Fallback: keep digits, prefix +
  return `+${onlyDigits}`;
}

