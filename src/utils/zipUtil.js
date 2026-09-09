// Standard US ZIP code validation shared across billing-ZIP and address forms.
// Accepts 5-digit ZIP or ZIP+4 (e.g. "90210" or "90210-1234").

export const US_ZIP_REGEX = /^\d{5}(-\d{4})?$/;

// Returns an error message string, or null if valid.
export function validateZip(rawZip) {
  const zip = String(rawZip || "").trim();
  if (!zip) return "ZIP code is required.";
  if (!US_ZIP_REGEX.test(zip)) {
    return "Enter a valid US ZIP code (e.g. 90210 or 90210-1234).";
  }
  return null;
}
