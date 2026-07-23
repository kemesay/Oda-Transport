/**
 * Mirrors ODA-TRANSPORTATION/src/utils/bookingFareCalculator.js (keep in sync).
 */

export function asMoney(value) {
  if (value == null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function isRoundTripTripType(tripType) {
  const t = String(tripType || "");
  return (
    t === "Round-Trip" ||
    t === "Ride to the airport(round trip)" ||
    t === "Ride from the airport(round trip)"
  );
}

export function legCarFareFromCar(car, { bookingKind, distanceInMiles, selectedHours }) {
  if (!car) return 0;

  const pricePerMile = asMoney(car.pricePerMile);
  const pricePerHour = asMoney(car.pricePerHour);
  const minimumStartFee = asMoney(car.minimumStartFee);

  if (bookingKind === "HOURLY") {
    const hours = Math.max(asMoney(selectedHours), 0);
    return Number((pricePerHour * hours).toFixed(2));
  }

  const miles = Math.max(asMoney(distanceInMiles), 0);
  return Number((pricePerMile * miles + minimumStartFee).toFixed(2));
}

export function gratuityOnCarFare(legCarFare, percentage, tripType) {
  const pct = asMoney(percentage);
  if (pct <= 0) return 0;
  const perLeg = legCarFare * (pct / 100);
  return Number(
    (isRoundTripTripType(tripType) ? perLeg * 2 : perLeg).toFixed(2)
  );
}
