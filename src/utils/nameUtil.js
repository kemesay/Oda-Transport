// Standard full-name formatting/validation shared across signup, profile edit,
// and admin-created driver/admin accounts. Rule: each name part starts with a
// capital letter, letters only (hyphens/apostrophes allowed for names like
// "Mary-Jane" or "O'Brien"), single spaces between parts, at least two parts.

const NAME_PART_REGEX = /^[A-Za-z]+(?:['-][A-Za-z]+)*$/;

// Words/phrases people type when they don't want to give a real name —
// most commonly by echoing a form's own placeholder/label text back into it
// (e.g. typing literal "Cardholder Name" into the cardholder-name field).
const PLACEHOLDER_WORDS = new Set([
  "cardholder", "card", "holder", "test", "testing", "sample", "example",
  "name", "firstname", "lastname", "guest", "unknown", "none", "na",
  "asdf", "qwerty", "abc", "xyz", "user", "customer", "client", "demo",
  "dummy", "placeholder", "anonymous", "nobody", "fake", "temp", "temporary",
]);

const PLACEHOLDER_PHRASES = new Set([
  "card holder", "cardholder name", "card holder name", "first last",
  "first name last name", "your name", "your full name", "full name",
  "not applicable", "no name", "n a", "test user", "test test",
  "sample name", "test name", "john doe", "jane doe",
]);

// Catches both exact placeholder phrases ("Cardholder Name") and names made
// up entirely of placeholder words repeated ("Guest Guest").
export function isPlaceholderName(rawName) {
  const normalized = String(rawName || "").trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalized) return false;
  if (PLACEHOLDER_PHRASES.has(normalized)) return true;
  const words = normalized.split(" ");
  return words.every((word) => PLACEHOLDER_WORDS.has(word));
}

export function formatNamePart(part) {
  return part
    .split("-")
    .map((seg) =>
      seg
        .split("'")
        .map((piece) =>
          piece ? piece.charAt(0).toUpperCase() + piece.slice(1).toLowerCase() : piece
        )
        .join("'")
    )
    .join("-");
}

// Collapses extra whitespace and title-cases every part, e.g.
// "  john o'brien-smith  " -> "John O'Brien-Smith".
export function formatFullName(rawName) {
  const collapsed = String(rawName || "").trim().replace(/\s+/g, " ");
  if (!collapsed) return "";
  return collapsed.split(" ").map(formatNamePart).join(" ");
}

// Returns an error message string, or null if valid.
export function validateFullName(rawName) {
  const name = String(rawName || "").trim().replace(/\s+/g, " ");
  if (!name) return "Full name is required.";
  const parts = name.split(" ");
  if (parts.length < 2) return "Please enter both first and last name.";
  if (!parts.every((part) => NAME_PART_REGEX.test(part))) {
    return "Name should only contain letters (hyphens and apostrophes allowed).";
  }
  if (isPlaceholderName(name)) {
    return "Please enter your real name, not a placeholder value.";
  }
  return null;
}

// For a payment form's "Name on card" / "Cardholder name" field — same
// standard as validateFullName but with wording appropriate to that context.
export function validateCardholderName(rawName) {
  const name = String(rawName || "").trim().replace(/\s+/g, " ");
  if (!name) return "Please enter the name on the card.";
  const parts = name.split(" ");
  if (parts.length < 2) return "Enter the cardholder's first and last name.";
  if (!parts.every((part) => NAME_PART_REGEX.test(part))) {
    return "Cardholder name should only contain letters.";
  }
  if (isPlaceholderName(name)) {
    return 'Enter the actual name on the card, not "Cardholder Name".';
  }
  return null;
}

// For a single name part (e.g. a separate First Name / Last Name field).
export function validateNamePart(rawPart, fieldLabel = "This field") {
  const part = String(rawPart || "").trim();
  if (!part) return `${fieldLabel} is required.`;
  if (!NAME_PART_REGEX.test(part)) {
    return `${fieldLabel} should only contain letters (hyphens and apostrophes allowed).`;
  }
  if (isPlaceholderName(part)) {
    return `Please enter a real ${fieldLabel.toLowerCase()}, not a placeholder value.`;
  }
  return null;
}

export { NAME_PART_REGEX };
