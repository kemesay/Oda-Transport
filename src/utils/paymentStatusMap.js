/**
 * Maps Square ledger status (payment.transaction.updated) to booking paymentStatus.
 */
export function mapTransactionStatusToPaymentStatus(txStatus) {
  switch (txStatus) {
    case "AUTHORIZED":
      return "AUTHORIZED";
    case "COMPLETED":
      return "PAID";
    case "CANCELED":
    case "FAILED":
      return "CANCELLED";
    case "REFUNDED":
      return "REFUNDED";
    default:
      return txStatus;
  }
}

export function isPaymentSettled(paymentStatus) {
  return paymentStatus === "PAID";
}

export function canAdminTakePayment(paymentStatus, bookingStatus) {
  if (["REJECTED", "CANCELLED"].includes(bookingStatus)) return false;
  if (isPaymentSettled(paymentStatus)) return false;
  return true;
}

export function getTakePaymentHint(paymentStatus) {
  if (paymentStatus === "AUTHORIZED") {
    return "Card authorized at booking — capture funds when ready.";
  }
  if (isPaymentSettled(paymentStatus)) {
    return "Payment already completed.";
  }
  return "Charge the customer's saved card on file.";
}

export function getCheckoutPaymentHint() {
  return "Your card will be authorized at checkout. Payment is captured later when our team completes the trip.";
}
