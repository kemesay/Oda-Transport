import { PAYMENT_METHODS } from "../constants/paymentMethods";
import { resolveSquarePaymentPayload } from "../services/squareCheckoutSession";

/**
 * Shapes booking POST body for Square-only checkout.
 */
export function applySquarePaymentToBody(body, contact) {
  if (!body || !contact) return body;

  const method = contact.paymentMethod;

  if (method === PAYMENT_METHODS.SQUARE_NEW) {
    delete body.cardDetails;
    delete body.paymentDetailId;
    delete body.squareCardId;

    const square = resolveSquarePaymentPayload(contact);
    if (square) {
      body.square = square;
    } else {
      delete body.square;
    }
    return body;
  }

  if (method === PAYMENT_METHODS.SQUARE_SAVED) {
    delete body.cardDetails;
    delete body.square;
    if (contact.paymentDetailId) {
      body.paymentDetailId = contact.paymentDetailId;
    }
    if (contact.squareCardId) {
      body.squareCardId = contact.squareCardId;
    }
    return body;
  }

  delete body.cardDetails;
  return body;
}

export function assertSquarePayloadForBooking(contact) {
  if (contact?.paymentMethod !== PAYMENT_METHODS.SQUARE_NEW) {
    return null;
  }
  const square = resolveSquarePaymentPayload(contact);
  if (!square?.sourceId) {
    return "Card verification expired or missing. Go back to Contact and tap Summary again.";
  }
  return null;
}
