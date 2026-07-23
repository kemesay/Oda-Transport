/** Maps UI travel labels to backend socket / payment ledger bookingType. */

export const LEDGER_BOOKING_TYPES = {
  AIRPORT: "AIRPORT",
  P2P: "P2P",
  HOURLY: "HOURLY",
};

/** Admin approve API still accepts HOURLY_CHARTER; ledger always uses HOURLY. */
export function normalizeLedgerBookingType(bookingType) {
  const t = String(bookingType || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
  if (t === "AIRPORT" || t === "1") return LEDGER_BOOKING_TYPES.AIRPORT;
  if (t === "P2P" || t === "POINT_TO_POINT" || t === "2") return LEDGER_BOOKING_TYPES.P2P;
  if (
    t === "HOURLY" ||
    t === "HOURLY_CHARTER" ||
    t === "HOURLYCHARTER" ||
    t === "3"
  ) {
    return LEDGER_BOOKING_TYPES.HOURLY;
  }
  return t;
}

/** Value for POST /api/v1/admin/bookings/approve */
export function adminApproveBookingType(bookingType) {
  return normalizeLedgerBookingType(bookingType);
}

export function travelTypeToSocketBookingType(travelType) {
  return normalizeLedgerBookingType(travelType);
}

export function travelTypeToRealtimePathSegment(travelType) {
  const t = String(travelType || "").toLowerCase();
  if (t.includes("airport")) return "airport";
  if (t.includes("hourly")) return "hourly";
  if (t.includes("point")) return "p2p";
  return null;
}

export function discountApiBookingType(bookingType) {
  const ledger = normalizeLedgerBookingType(bookingType);
  if (ledger === LEDGER_BOOKING_TYPES.HOURLY) return "HOURLY_CHARTER";
  return ledger;
}
