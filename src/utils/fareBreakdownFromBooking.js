/**
 * Admin / order views: compute fare lines from booking + Car rate card
 * (not reverse-engineered from totalTripFeeInDollars).
 */

import {
  asMoney,
  isRoundTripTripType,
  legCarFareFromCar,
  gratuityOnCarFare,
} from "./bookingFareCalculatorShared";

function sumExtrasFromBooking(extraOptions, throughKey, roundTrip) {
  if (!Array.isArray(extraOptions)) return 0;
  let total = 0;
  for (const option of extraOptions) {
    const qty = asMoney(option?.[throughKey]?.quantity);
    const unit = asMoney(option?.pricePerItem);
    if (qty > 0) total += unit * qty;
  }
  if (roundTrip) total *= 2;
  return Number(total.toFixed(2));
}

export function fareBreakdownFromBooking(booking) {
  if (!booking?.Car) return null;

  const car = booking.Car;
  const tripType = booking.tripType;
  const roundTrip = isRoundTripTripType(tripType);
  const isHourly =
    booking.hourlyCharterBookId != null ||
    (booking.selectedHours != null &&
      !booking.pointToPointBookId &&
      !booking.airportBookId);

  let legCar = 0;
  let carFare = 0;
  let extraOptionsPrice = 0;
  let additionalStopPrice = 0;
  let airportPickupPreferencePrice = 0;

  if (isHourly) {
    legCar = legCarFareFromCar(car, {
      bookingKind: "HOURLY",
      selectedHours: booking.selectedHours,
    });
    carFare = legCar;
    extraOptionsPrice = sumExtrasFromBooking(
      booking.ExtraOptions,
      "HourlyCharterBookExtraOption",
      false
    );
  } else if (booking.airportBookId != null) {
    legCar = legCarFareFromCar(car, {
      bookingKind: "AIRPORT",
      distanceInMiles: booking.distanceInMiles,
    });
    carFare = Number((legCar * (roundTrip ? 2 : 1)).toFixed(2));
    additionalStopPrice = asMoney(booking.AdditionalStopOnTheWay?.additionalStopPrice);
    airportPickupPreferencePrice = asMoney(
      booking.AirportPickupPreference?.preferencePrice
    );
    extraOptionsPrice = sumExtrasFromBooking(
      booking.ExtraOptions,
      "AirportBookExtraOption",
      roundTrip
    );
  } else {
    legCar = legCarFareFromCar(car, {
      bookingKind: "P2P",
      distanceInMiles: booking.distanceInMiles,
    });
    carFare = Number((legCar * (roundTrip ? 2 : 1)).toFixed(2));
    additionalStopPrice = asMoney(booking.AdditionalStopOnTheWay?.additionalStopPrice);
    extraOptionsPrice = sumExtrasFromBooking(
      booking.ExtraOptions,
      "PointToPointBookExtraOption",
      roundTrip
    );
  }

  const gratuityPct = asMoney(booking.Gratuity?.percentage);
  const gratuity = gratuityOnCarFare(legCar, gratuityPct, tripType);
  const discount = asMoney(booking.discountAmountInDollars);
  const subtotal =
    carFare +
    additionalStopPrice +
    airportPickupPreferencePrice +
    extraOptionsPrice;
  const totalBeforeDiscount = Number((subtotal + gratuity).toFixed(2));
  const total = Number((totalBeforeDiscount - discount).toFixed(2));

  return {
    carFare,
    legCarFare: legCar,
    additionalStopPrice,
    airportPickupPreferencePrice,
    extraOptionsPrice,
    gratuity,
    gratuityPercentage: gratuityPct,
    discount,
    subtotal,
    total,
    roundTrip,
  };
}
