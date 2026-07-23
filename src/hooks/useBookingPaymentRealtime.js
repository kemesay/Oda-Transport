import { useEffect, useState } from "react";
import { fetchBookingRoomToken } from "../services/bookingRealtimeTokenService";
import { subscribeToBookingPayment } from "../services/paymentRealtimeService";
import { mapTransactionStatusToPaymentStatus } from "../utils/paymentStatusMap";

/**
 * Fetches a signed room token, subscribes to payment updates, and merges live status.
 */
export default function useBookingPaymentRealtime({
  travelType,
  bookingId,
  initialPaymentStatus,
  admin = false,
  enabled = true,
}) {
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus || null);
  const [loadingToken, setLoadingToken] = useState(false);

  useEffect(() => {
    setPaymentStatus(initialPaymentStatus || null);
  }, [initialPaymentStatus, bookingId]);

  useEffect(() => {
    if (!enabled || !travelType || !bookingId) return undefined;

    let unsubscribe = () => {};
    let cancelled = false;

    const connect = async () => {
      setLoadingToken(true);
      try {
        const roomToken = await fetchBookingRoomToken(travelType, bookingId, {
          admin,
        });
        if (cancelled || !roomToken) return;

        unsubscribe = subscribeToBookingPayment({
          roomToken,
          onUpdate: (payload) => {
            if (payload?.status) {
              setPaymentStatus(mapTransactionStatusToPaymentStatus(payload.status));
            }
          },
        });
      } catch (_) {
        /* polling fallback: keep initial status */
      } finally {
        if (!cancelled) setLoadingToken(false);
      }
    };

    connect();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [enabled, travelType, bookingId, admin]);

  return { paymentStatus, loadingToken };
}
