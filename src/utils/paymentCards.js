/**
 * Normalize payment cards API response and filter Square-ready cards on file.
 */
export function normalizePaymentCardsResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.paymentCards)) return data.paymentCards;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

/** Card can be charged via SQUARE_SAVED_CARD (has Square card id or wallet last4). */
export function isSquareReadyCard(card) {
  if (!card?.paymentDetailId) return false;
  return Boolean(card.squareCardId || card.last4);
}

/** Capitalize first letter only: "VISA" → "Visa", "MASTERCARD" → "Mastercard" */
function titleBrand(raw) {
  if (!raw) return "Card";
  const s = String(raw).toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatCardForDisplay(card) {
  const last4 =
    card?.last4 ||
    (card?.creditCardNumber ? String(card.creditCardNumber).slice(-4) : "");
  const brandRaw = card?.cardBrand || "CARD";
  const brand = titleBrand(brandRaw);
  const shortMask = last4 ? `···· ${last4}` : "Saved card";

  return {
    ...card,
    last4: last4 || undefined,
    // e.g. "Visa ···· 4242"  or  "Visa ···· 4242 (Primary)"
    displayName: `${brand} ${shortMask}${card.isPrimary ? " (Primary)" : ""}`,
    // compact masked — used wherever a short label is needed
    maskedNumber: shortMask,
  };
}
