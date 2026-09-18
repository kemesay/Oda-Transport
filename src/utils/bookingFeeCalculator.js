/**
 * Service fee aligned with backend reservation fare helpers
 * (getP2PReservationDetails, getAirportServiceDetails, getHourlyCharterDetails).
 */

export function isRoundTripTripType(tripType) {
  return (
    tripType === "Round-Trip" ||
    tripType === "Ride to the airport(round trip)" ||
    tripType === "Ride from the airport(round trip)"
  );
}

/**
 * One-way leg vehicle fare.
 * - Airport / P2P: pricePerMile × miles + minimumStartFee
 * - Hourly: pricePerHour × hours (no minimum on car fare)
 *
 * @param {string} travelRouteId "1" | "2" | "3"
 * @param {object} p vehicleFee = pricePerMile or pricePerHour from Formik
 */
export function getLegCarPrice(travelRouteId, p) {
  const tt = String(travelRouteId ?? "");
  const rate = Number(p.vehicleFee) || 0;
  const dist = Number(p.distanceInMiles) || 0;
  const hours = Number(p.hour) || 0;
  const min = Number(p.minimumStartFee) || 0;

  if (tt === "3") {
    return rate * hours;
  }
  if (tt === "1" || tt === "2") {
    return rate * dist + min;
  }
  return 0;
}

/** Gratuity is a % of car fare only; round trip doubles the tip (two legs). */
export function computeGratuityOnCarFare(legCarPrice, percentage, tripType) {
  const pct = Number(percentage);
  if (!Number.isFinite(pct) || pct <= 0) return 0;
  const perLeg = legCarPrice * (pct / 100);
  return isRoundTripTripType(tripType) ? perLeg * 2 : perLeg;
}

/**
 * A promo discount reduces the ride's own cost — gratuity should be a tip
 * on what the ride actually costs after that discount, not on the
 * pre-discount sticker price. Scales `legCarPrice` down by whatever
 * fraction of the discount falls on the car-fare portion of the subtotal
 * (extras/stops/side-detour fees are never part of the gratuity base,
 * discounted or not, same as before) — mirrors the backend's
 * discountedLegCarFare, and reduces to exactly `legCarPrice` when there's
 * no discount, so an undiscounted booking's gratuity is unchanged.
 */
function discountedLegCarPrice(legCarPrice, subtotal, discount) {
  if (!discount || subtotal <= 0) return legCarPrice;
  const legCarShareOfDiscount = (discount * legCarPrice) / subtotal;
  return Math.max(legCarPrice - legCarShareOfDiscount, 0);
}

/**
 * @param {object} params
 * @param {number|string} [params.gratuityPercentage] when set, tip from car fare (backend rule)
 * @param {number} [params.gratuityFee] used when percentage is 0 / cash tip
 * @param {number} params.extraOptionFee per-leg extras total (not pre-doubled for RT)
 * @param {number} [params.sideDetourFee] flat, added once regardless of trip type — mirrors
 *   the backend's sideDetourFeeFor (never doubled for round trip, same as stopOnWayFee)
 */
export function calculateServiceFee(params) {
  const round = isRoundTripTripType(params.tripType);
  const legMult = round ? 2 : 1;

  const legCar = getLegCarPrice(params.travelRouteId, params);
  const legExtras = Number(params.extraOptionFee) || 0;

  const subtotal =
    legCar * legMult +
    legExtras * legMult +
    (Number(params.stopOnWayFee) || 0) +
    (Number(params.pickupPreferenceFee) || 0) +
    (Number(params.sideDetourFee) || 0);

  // Promo-code discount is subtracted from the subtotal BEFORE gratuity is
  // added, so gratuity (below) reflects the discounted ride cost — mirrors
  // the backend's chargeAmount rule, now applied before gratuity instead of
  // after it.
  const promoDiscount = Number(params.promoDiscount) || 0;
  const discountedSubtotal = Math.max(subtotal - promoDiscount, 0);

  const pct = params.gratuityPercentage;
  const gratuity =
    pct != null && pct !== "" && Number(pct) > 0
      ? computeGratuityOnCarFare(
          discountedLegCarPrice(legCar, subtotal, promoDiscount),
          pct,
          params.tripType
        )
      : Number(params.gratuityFee) || 0;

  return discountedSubtotal + gratuity;
}

export function calculateServiceFeeBreakdown(params) {
  const round = isRoundTripTripType(params.tripType);
  const legMult = round ? 2 : 1;
  const legCar = getLegCarPrice(params.travelRouteId, params);
  const legExtras = Number(params.extraOptionFee) || 0;
  const promoDiscount = Number(params.promoDiscount) || 0;

  const subtotal =
    legCar * legMult +
    legExtras * legMult +
    (Number(params.stopOnWayFee) || 0) +
    (Number(params.pickupPreferenceFee) || 0) +
    (Number(params.sideDetourFee) || 0);
  const discountedSubtotal = Math.max(subtotal - promoDiscount, 0);

  const pct = params.gratuityPercentage;
  const gratuity =
    pct != null && pct !== "" && Number(pct) > 0
      ? computeGratuityOnCarFare(
          discountedLegCarPrice(legCar, subtotal, promoDiscount),
          pct,
          params.tripType
        )
      : Number(params.gratuityFee) || 0;

  return {
    legCarPrice: legCar,
    fare: legCar * legMult,
    returnFare: round ? legCar : 0,
    extraOptionsPerLeg: legExtras,
    extraOptionsTotal: legExtras * legMult,
    stopOnWayFee: Number(params.stopOnWayFee) || 0,
    pickupPreferenceFee: Number(params.pickupPreferenceFee) || 0,
    sideDetourFee: Number(params.sideDetourFee) || 0,
    gratuity,
    promoDiscount,
    subtotal,
    discountedSubtotal,
    total: discountedSubtotal + gratuity,
  };
}

export function calculateServiceFeeBeforeGratuity(params) {
  return calculateServiceFee({ ...params, gratuityPercentage: 0, gratuityFee: 0 });
}

export function vehicleRatesFromCar(car, travelRouteId) {
  if (!car) return null;
  const hourly = String(travelRouteId) === "3";
  const min = parseFloat(car.minimumStartFee);
  return {
    vehicleFee: hourly
      ? parseFloat(car.pricePerHour) || 0
      : parseFloat(car.pricePerMile) || 0,
    minimumStartFee: Number.isFinite(min) ? min : 0,
    prevCarMinimumStartFee: Number.isFinite(min) ? min : 0,
    vehicleName: car.carName || car.name || "",
    pricePerMile: parseFloat(car.pricePerMile) || 0,
    pricePerHour: parseFloat(car.pricePerHour) || 0,
  };
}

/** Per-leg extra options (backend sums qty × price once, then doubles for RT in fare). */
export function sumExtraOptionFeePerLeg(chosenExtras, catalog) {
  if (!Array.isArray(chosenExtras) || !Array.isArray(catalog)) return 0;
  let sum = 0;
  for (const row of chosenExtras) {
    const id = Number(row.extraOptionId);
    const qty = Number(row.quantity) || 0;
    if (!id || qty <= 0) continue;
    const opt = catalog.find((o) => Number(o.extraOptionId) === id);
    if (!opt) continue;
    sum += (parseFloat(opt.pricePerItem) || 0) * qty;
  }
  return sum;
}

/** @deprecated use sumExtraOptionFeePerLeg */
export function sumExtraOptionFeeFromSelections(chosenExtras, catalog) {
  return sumExtraOptionFeePerLeg(chosenExtras, catalog);
}

export function gratuityDollarsFromBookingApi(apiData, feeParams) {
  const pct = apiData?.Gratuity?.percentage;
  if (pct == null || Number(pct) <= 0) return 0;
  const legCar = getLegCarPrice(feeParams.travelRouteId, feeParams);
  return computeGratuityOnCarFare(legCar, pct, feeParams.tripType);
}
