import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateTotalFee, updateFeeBreakdown } from "../store/reducers/bookReducers";
import { calculateServiceFee, calculateServiceFeeBreakdown } from "../utils/bookingFeeCalculator";

/**
 * Same live total as create flow: Formik fee fields → Redux `totalFee` → StepSummary.
 */
export default function useLiveBookingServiceFee({
  enabled,
  travelRouteId,
  tripType,
  vehicleFee,
  minimumStartFee,
  extraOptionFee,
  distanceInMiles,
  hour,
  stopOnWayFee,
  pickupPreferenceFee,
  sideDetourFee,
  promoDiscount,
  gratuityFee,
  gratuityPercentage,
}) {
  const dispatch = useDispatch();
  const { totalFee, feeBreakdown } = useSelector((state) => state.bookReducer);

  useEffect(() => {
    if (!enabled || travelRouteId == null || travelRouteId === "") return;

    const feeParams = {
      travelRouteId,
      tripType,
      vehicleFee,
      minimumStartFee,
      extraOptionFee,
      distanceInMiles,
      hour,
      stopOnWayFee,
      pickupPreferenceFee,
      sideDetourFee,
      promoDiscount,
      gratuityFee,
      gratuityPercentage,
    };

    // Guarded so a dispatch only happens when a value actually changes —
    // this page also selects this same Redux slice, so an unconditional
    // dispatch on every effect run would re-trigger its own re-render
    // forever ("Maximum update depth exceeded"). See homePage/index.js's
    // feeCalculator for the create-flow equivalent of this same guard.
    const total = calculateServiceFee(feeParams);
    if (total !== totalFee) {
      dispatch(updateTotalFee(total));
    }

    const breakdown = calculateServiceFeeBreakdown(feeParams);
    if (JSON.stringify(breakdown) !== JSON.stringify(feeBreakdown)) {
      dispatch(updateFeeBreakdown(breakdown));
    }
  }, [
    enabled,
    dispatch,
    totalFee,
    feeBreakdown,
    travelRouteId,
    tripType,
    vehicleFee,
    minimumStartFee,
    extraOptionFee,
    distanceInMiles,
    hour,
    stopOnWayFee,
    pickupPreferenceFee,
    sideDetourFee,
    promoDiscount,
    gratuityFee,
    gratuityPercentage,
  ]);
}
