import { BACKEND_API } from "../store/utils/API";
import { authHeader } from "../util/authUtil";
import { travelTypeToRealtimePathSegment } from "../utils/bookingTypeMap";

export async function fetchBookingRoomToken(
  travelType,
  bookingId,
  { admin = false } = {}
) {
  const segment = travelTypeToRealtimePathSegment(travelType);
  if (!segment || !bookingId) {
    return null;
  }

  const base = admin
    ? `/api/v1/admin/bookings/realtime/${segment}/${bookingId}`
    : `/api/v1/users/bookings/mine/realtime/${segment}/${bookingId}`;

  const res = await BACKEND_API.get(base, authHeader());
  return res.data?.roomToken || null;
}
