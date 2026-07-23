/** Square-only payment methods (matches ODA-TRANSPORTATION booking API). */
export const PAYMENT_METHODS = {
  SQUARE_NEW: "SQUARE_NEW_CARD",
  SQUARE_SAVED: "SQUARE_SAVED_CARD",
};

/** UI-only values for the payment method radio group */
export const PAYMENT_UI = {
  NEW: "square_new",
  SAVED: "square_saved",
  PRIMARY: "square_primary",
};

export const isSquareNewCard = (method) =>
  method === PAYMENT_METHODS.SQUARE_NEW;

export const isSquareSavedCard = (method) =>
  method === PAYMENT_METHODS.SQUARE_SAVED;
