import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/** Vehicle id on booking GET payloads is often nested under `Car`, not top-level `carId`. */
export function resolveCarIdFromApi(d) {
  if (!d) return "";
  const id = d.carId ?? d.Car?.carId;
  if (id === null || id === undefined || id === "") return "";
  return id;
}

/** Maps UI travel label to home route segment used by booking forms */
export function travelTypeToRouteId(travelType) {
  const t = (travelType || "").toLowerCase();
  if (t === "airport") return "1";
  if (t === "point to point") return "2";
  if (t === "hourly") return "3";
  return "1";
}

function zonedParts(isoOrString) {
  if (!isoOrString) return null;
  const userTz = dayjs.tz.guess();
  const z = dayjs(isoOrString).tz(userTz);
  if (!z.isValid()) return null;
  return {
    dateObj: z,
    formattedDate: z.format("YYYY-MM-DD"),
    formattedTime: z.format("HH:mm:ss"),
  };
}

function mapExtraOptions(d) {
  const raw = d?.ExtraOptions;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      const nested =
        row?.AirportBookExtraOption ||
        row?.PointToPointBookExtraOption ||
        row?.HourlyCharterBookExtraOption ||
        row?.HourlyBookExtraOption;
      const qty = nested?.quantity ?? row?.quantity ?? 1;
      const id = row?.extraOptionId ?? row?.ExtraOption?.extraOptionId;
      if (!id) return null;
      return {
        extraOptionId: id,
        name: row?.name ?? row?.ExtraOption?.name ?? "",
        quantity: Number(qty) || 0,
      };
    })
    .filter(Boolean);
}

/**
 * Merges GET /api/v1/{airport-books|point-to-point-books|hourly-charter-books}/:id
 * into a single Formik shape compatible with home booking components.
 */
export function mapApiBookingToFormik(travelTypeLabel, d) {
  const tt = (travelTypeLabel || "").toLowerCase();
  const pickup = zonedParts(d.pickupDateTime);
  const ret = zonedParts(d.returnPickupDateTime);

  const base = {
    tripType: d.tripType ?? "",
    numberOfPassengers: Number(d.numberOfPassengers ?? 1),
    numberOfSuitcases: Number(d.numberOfSuitcases ?? 0),
    distanceInMiles: Number(d.distanceInMiles ?? 0),
    instruction: d.specialInstructions ?? "",
    airline: d.airline ?? "",
    arrivalFlightNumber: d.arrivalFlightNumber ?? "",
    returnAirline: d.returnAirline ?? "",
    returnFlightNumber: d.returnFlightNumber ?? "",
    occation: d.occasion ?? d.occation ?? "",
    additionalStopId: Number(d.additionalStopId ?? 0),
    additionalStopOnTheWayDescription: d.additionalStopOnTheWayDescription ?? "",
    bookingFor: d.bookingFor ?? "Myself",
    passengerFullName: d.passengerFullName ?? "",
    passengerCellPhone: d.passengerCellPhone ?? "",
    email: d.passengerEmail ?? "",
    gratuityId: Number(d.gratuityId ?? 1),
    isGuestBooking: Boolean(d.isGuestBooking),
    paymentMethod: d.paymentMethod ?? "",
    paymentDetailId: d.paymentDetailId ? Number(d.paymentDetailId) : 0,
    creditCardNumber: "",
    cardOwnerName: "",
    expirationDate: "",
    zipCode: "",
    securityCode: "",
    isValidCardInfo: false,
    pickupDate: pickup?.dateObj ?? null,
    formattedPickupDate: pickup?.formattedDate ?? "",
    pickupTime: pickup?.dateObj ?? null,
    formattedPickupTime: pickup?.formattedTime ?? "",
    returnPickupDate: ret?.dateObj ?? null,
    formattedReturnPickupDate: ret?.formattedDate ?? "",
    returnPickupTime: ret?.dateObj ?? null,
    formattedReturnPickupTime: ret?.formattedTime ?? "",
    extraOptions: mapExtraOptions(d),
    extraOptionFee: 0,
    vehicle: resolveCarIdFromApi(d),
    vehicleName: d.Car?.carName ?? d.Car?.name ?? "",
    vehicleFee: 0,
    prevCarMinimumStartFee: d.Car?.minimumStartFee
      ? parseFloat(d.Car.minimumStartFee)
      : 0,
    minimumStartFee: d.Car?.minimumStartFee
      ? parseFloat(d.Car.minimumStartFee)
      : 0,
    hour: Number(d.selectedHours ?? 5),
    pickupPhysicalAddress: d.pickupPhysicalAddress ?? "",
    pickupLatitude: d.pickupLatitude ?? "",
    pickupLongitude: d.pickupLongitude ?? "",
    dropoffPhysicalAddress: d.dropoffPhysicalAddress ?? "",
    dropoffLatitude: d.dropoffLatitude ?? "",
    dropoffLongitude: d.dropoffLongitude ?? "",
    airportLocationAddress: d.airportLocationAddress ?? "",
    airportLocationLatitude: d.airportLocationLatitude ?? "",
    airportLocationLongitude: d.airportLocationLongitude ?? "",
    hotel: d.accommodationAddress ?? "",
    accommodationAddress: d.accommodationAddress ?? "",
    accommodationLatitude: d.accommodationLatitude ?? "",
    accommodationLongitude: d.accommodationLongitude ?? "",
    pickupPreference: Number(
      d.pickupPreferenceId ?? d.AirportPickupPreference?.pickupPreferenceId ?? 1
    ),
    pickupPreferenceFee: d.AirportPickupPreference?.preferencePrice
      ? parseFloat(d.AirportPickupPreference.preferencePrice)
      : 0,
    prevPickupPrefValue: d.AirportPickupPreference?.preferencePrice
      ? parseFloat(d.AirportPickupPreference.preferencePrice)
      : 0,
    stopOnWayFee: d.AdditionalStopOnTheWay?.additionalStopPrice
      ? parseFloat(d.AdditionalStopOnTheWay.additionalStopPrice)
      : 0,
    prevAddtionalStopOnTheWayFee: d.AdditionalStopOnTheWay?.additionalStopPrice
      ? parseFloat(d.AdditionalStopOnTheWay.additionalStopPrice)
      : 0,
  };

  if (d.PaymentDetail) {
    base.cardDetails = {
      cardOwnerName: d.PaymentDetail.cardOwnerName ?? "",
      creditCardNumber: d.PaymentDetail.creditCardNumber ?? "",
      expirationDate: d.PaymentDetail.expirationDate ?? "",
      securityCode: d.PaymentDetail.securityCode ?? "",
      zipCode: d.PaymentDetail.zipCode ?? "",
    };
  }

  if (tt === "airport") {
    return {
      ...base,
      tripType: d.tripType ?? base.tripType,
    };
  }

  if (tt === "point to point") {
    return { ...base };
  }

  if (tt === "hourly") {
    return {
      ...base,
      hour: Number(d.selectedHours ?? base.hour),
    };
  }

  return base;
}
