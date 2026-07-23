import { useEffect, useState } from "react";
import { subscribeToBookingPayment } from "../services/paymentRealtimeService";
import { mapTransactionStatusToPaymentStatus } from "../utils/paymentStatusMap";

/**
 * Listens for `payment.transaction.updated` on a signed booking room (from API response).
 */
export default function usePaymentRealtime(roomToken) {
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    if (!roomToken) return undefined;

    return subscribeToBookingPayment({
      roomToken,
      onUpdate: (payload) => setLastEvent(payload),
    });
  }, [roomToken]);

  const paymentStatus = lastEvent?.status
    ? mapTransactionStatusToPaymentStatus(lastEvent.status)
    : null;

  return { lastEvent, paymentStatus };
}
