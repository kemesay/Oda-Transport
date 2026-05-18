import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateTotalFee } from "../store/reducers/bookReducers";
import { calculateServiceFee } from "../utils/bookingFeeCalculator";

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
  gratuityFee,
  gratuityPercentage,
}) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!enabled || travelRouteId == null || travelRouteId === "") return;

    const total = calculateServiceFee({
      travelRouteId,
      tripType,
      vehicleFee,
      minimumStartFee,
      extraOptionFee,
      distanceInMiles,
      hour,
      stopOnWayFee,
      pickupPreferenceFee,
      gratuityFee,
      gratuityPercentage,
    });

    dispatch(updateTotalFee(total));
  }, [
    enabled,
    dispatch,
    travelRouteId,
    tripType,
    vehicleFee,
    minimumStartFee,
    extraOptionFee,
    distanceInMiles,
    hour,
    stopOnWayFee,
    pickupPreferenceFee,
    gratuityFee,
    gratuityPercentage,
  ]);
}
