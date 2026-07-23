import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { BACKEND_API } from "../store/utils/API";
import {
  canAdminTakePayment,
  getTakePaymentHint,
} from "../utils/paymentStatusMap";

const PAYMENT_ENDPOINT = "/api/v1/admin/bookings/update-payment-status";

/**
 * Admin capture flow — POST update-payment-status (not on accept).
 */
export default function useAdminTakePayment({
  bookingId,
  bookingType,
  paymentStatus,
  bookingStatus,
}) {
  const [takingPayment, setTakingPayment] = useState(false);
  const canTake = canAdminTakePayment(paymentStatus, bookingStatus);
  const hint = getTakePaymentHint(paymentStatus);

  const takePayment = useCallback(async () => {
    if (!bookingId || !bookingType) return;
    if (!canTake) {
      toast.warn("Payment cannot be taken for this booking.");
      return;
    }

    setTakingPayment(true);
    try {
      const response = await BACKEND_API.post(PAYMENT_ENDPOINT, {
        bookingId,
        bookingType,
      });
      toast.success(
        response?.data?.message || "Payment captured successfully!"
      );
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to take payment";
      toast.error(msg);
    } finally {
      setTakingPayment(false);
    }
  }, [bookingId, bookingType, canTake]);

  return { takePayment, takingPayment, canTake, hint };
}
