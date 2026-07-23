/** Shared payment status colors for orders, admin, and receipts. */
export const PAYMENT_STATUS_COLORS = {
  NOT_PAID: "#FF4B55",
  AWAITING_PAYMENT: "#FFA726",
  AUTHORIZED: "#FFB300",
  PARTIALLY_PAID: "#42A5F5",
  PAID: "#03930A",
  PENDING_REFUND: "#AB47BC",
  REFUNDED: "#26A69A",
  CANCELLED: "#78909C",
  DISCOUNT_APPLIED: "#1976d2",
};

export function getPaymentStatusBackgroundColor(paymentStatus) {
  switch (paymentStatus) {
    case "PAID":
      return "green";
    case "AUTHORIZED":
      return "#FFB300";
    case "CANCELLED":
      return "red";
    case "DISCOUNT_APPLIED":
      return "blue";
    case "REFUNDED":
      return "#26A69A";
    default:
      return "orange";
  }
}
