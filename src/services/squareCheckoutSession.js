import { PAYMENT_METHODS } from "../constants/paymentMethods";

const SESSION_KEY = "oda_square_checkout_nonce";
const MAX_AGE_MS = 15 * 60 * 1000;

function normalizeSquarePayload(square) {
  if (!square) return null;
  const sourceId = square.sourceId || square.token;
  if (!sourceId) return null;
  return {
    sourceId,
    ...(square.verificationToken
      ? { verificationToken: square.verificationToken }
      : {}),
  };
}

/** Persist nonce across wizard steps (Square iframe unmounts after Contact). */
export function persistSquareCheckoutNonce(square, { amount, paymentMethod } = {}) {
  const payload = normalizeSquarePayload(square);
  if (!payload) return;
  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        ...payload,
        amount,
        paymentMethod,
        savedAt: Date.now(),
      })
    );
  } catch {
    /* quota / private mode */
  }
}

export function loadSquareCheckoutNonce() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.sourceId) return null;
    if (Date.now() - (data.savedAt || 0) > MAX_AGE_MS) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return {
      sourceId: data.sourceId,
      ...(data.verificationToken
        ? { verificationToken: data.verificationToken }
        : {}),
      amount: data.amount,
      paymentMethod: data.paymentMethod,
    };
  } catch {
    return null;
  }
}

export function clearSquareCheckoutNonce() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Resolves Square nonce from Formik first, then session backup.
 */
export function resolveSquarePaymentPayload(contact) {
  const fromFormik = normalizeSquarePayload(contact?.square);
  if (fromFormik) return fromFormik;

  const cached = loadSquareCheckoutNonce();
  if (
    cached &&
    (!contact?.paymentMethod ||
      contact.paymentMethod === PAYMENT_METHODS.SQUARE_NEW ||
      contact.paymentMethod === cached.paymentMethod)
  ) {
    return {
      sourceId: cached.sourceId,
      ...(cached.verificationToken
        ? { verificationToken: cached.verificationToken }
        : {}),
    };
  }

  return null;
}

export function hasVerifiedSquarePayment(contact) {
  return Boolean(resolveSquarePaymentPayload(contact));
}
