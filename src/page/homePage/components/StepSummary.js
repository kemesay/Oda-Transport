import React from "react";
import { Box, Stack, useTheme, Grid } from "@mui/material";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import RSTypography from "../../../components/RSTypography";
function StepSummary({
  rideSummaryData,
  vehicleSummaryData,
  tripSummaryData,
  contactSummaryData,
  screenType,
  travelRouteId,
}) {
  const theme = useTheme();
  const location = useLocation();
  const tripType = rideSummaryData.tripType;
  var travelType = travelRouteId ?? location.pathname.split("/").pop();
  const isAirportTravel = travelType == "1";
  const isPointToPointTravel = travelType == "2";
  const isHourlyTravel = travelType == "3";
  const { fee, totalFee, feeBreakdown } = useSelector((state) => state.bookReducer);

  const isRoundTrip = () => {
    return (
      tripType == "Round-Trip" ||
      tripType == "Ride to the airport(round trip)" ||
      tripType == "Ride from the airport(round trip)"
    );
  };

  const isReturnAddrVisible = () => {
    const isVisible =
      (isPointToPointTravel || isAirportTravel) && isRoundTrip();
    return isVisible;
  };

  const getPickupAddr = () => {
    var pickupAddr = null;
    switch (travelType) {
      case "2":
      case "3":
        pickupAddr = rideSummaryData.pickupPhysicalAddress;
        break;
      case "1": {
        const isFromAirport =
          tripType === "Ride from the airport(round trip)" ||
          tripType === "Ride from the airport(one way)";
        const isToAirport =
          tripType === "Ride to the airport(round trip)" ||
          tripType === "Ride to the airport(one way)";
        pickupAddr = isFromAirport
          ? rideSummaryData.airportLocationAddress
          : isToAirport
            ? rideSummaryData.hotel
            : null;
        break;
      }
      default:
        break;
    }
    return pickupAddr;
  };

  const getDropoffAddr = () => {
    var dropoffAddr = null;
    switch (travelType) {
      case "2":
      case "3":
        dropoffAddr = rideSummaryData.dropoffPhysicalAddress;
        break;
      case "1": {
        const isFromAirport =
          tripType === "Ride from the airport(round trip)" ||
          tripType === "Ride from the airport(one way)";
        const isToAirport =
          tripType === "Ride to the airport(round trip)" ||
          tripType === "Ride to the airport(one way)";
        dropoffAddr = isFromAirport
          ? rideSummaryData.hotel
          : isToAirport
            ? rideSummaryData.airportLocationAddress
            : null;
        break;
      }
      default:
        break;
    }
    return dropoffAddr;
  };

  const generateSummaryData = () => {
    const summaryDataTemp = [
      { label: "Trip type- ", value: tripType, isVisible: !isHourlyTravel },
      {
        label: "Pickup addr.",
        value: getPickupAddr(),
        isVisible: true,
      },
      {
        label: "Dropoff addr.",
        value: getDropoffAddr(),
        isVisible: true,
      },
      {
        label: "Return Pickup addr.",
        value: getDropoffAddr(),
        isVisible: isReturnAddrVisible(),
      },
      {
        label: "Return Dropoff addr.",
        value: getPickupAddr(),
        isVisible: isReturnAddrVisible(),
      },
      {
        label: "Hour",
        value: rideSummaryData?.hour,
        isVisible: isHourlyTravel,
      },
      {
        label: "Airport / terminal",
        value: rideSummaryData?.airportLocationAddress,
        isVisible: isAirportTravel,
      },
      {
        label: "Hotel",
        value: rideSummaryData?.hotel,
        isVisible: isAirportTravel,
      },
    ];
    return summaryDataTemp;
  };

  // Same line items the admin "Fare Detail" view and the confirmation
  // emails show, computed from the exact same breakdown util the backend
  // mirrors (bookingFeeCalculator.calculateServiceFeeBreakdown) — so what a
  // customer sees while booking always matches what they're actually
  // charged and what shows up later on the booking record.
  const generateFareBreakdownData = () => {
    const b = feeBreakdown || {};
    const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;
    return [
      { label: "Fare", value: money(b.fare), isVisible: Number(b.fare) > 0 },
      {
        label: "Return Fare",
        value: money(b.returnFare),
        isVisible: Number(b.returnFare) > 0,
      },
      {
        label: "Extras",
        value: money(b.extraOptionsTotal),
        isVisible: Number(b.extraOptionsTotal) > 0,
      },
      {
        label: "Additional Stop",
        value: money(b.stopOnWayFee),
        isVisible: Number(b.stopOnWayFee) > 0,
      },
      {
        label: "Airport Pickup Preference",
        value: money(b.pickupPreferenceFee),
        isVisible: Number(b.pickupPreferenceFee) > 0,
      },
      {
        label: "Side Detour",
        value: money(b.sideDetourFee),
        isVisible: Number(b.sideDetourFee) > 0,
      },
      {
        label: "Gratuity",
        value: money(b.gratuity),
        isVisible: Number(b.gratuity) > 0,
      },
      {
        label: "Promo Discount",
        value: `-${money(b.promoDiscount)}`,
        isVisible: Number(b.promoDiscount) > 0,
      },
    ];
  };

  const Field = ({ label, value }) => (
    <Stack
      direction={"row"}
      justifyContent={"space-between"}
      padding={0.5}
      backgroundColor={"#EEE"}
    >
      <RSTypography txtcolor={theme.palette.info.light}>{label}</RSTypography>
      <RSTypography>{value}</RSTypography>
    </Stack>
  );

  return (
    <Box>
      <Box sx={{ backgroundColor: "#DDD", padding: 2 }}>
        <RSTypography txtcolor={theme.palette.warning.main}>
          Summary
        </RSTypography>
      </Box>
      <Box padding={1}>
        {screenType == "large" ? (
          <Grid container spacing={2}>
            {[
              // ...generateSummaryData(),
              ...vehicleSummaryData,
              ...tripSummaryData,
              ...contactSummaryData,
            ].map(
              (field, index) =>
                field?.isVisible && (
                  <Grid item xs={12} md={6}>
                    <Field
                      key={field.value}
                      label={field.label}
                      value={field.value}
                    />
                  </Grid>
                )
            )}
            <Grid item xs={12}>
              <RSTypography txtcolor={theme.palette.warning.main}>
                Fare Detail
              </RSTypography>
            </Grid>
            {generateFareBreakdownData().map(
              (field, index) =>
                field.isVisible && (
                  <Grid item xs={12} md={6} key={field.label}>
                    <Field label={field.label} value={field.value} />
                  </Grid>
                )
            )}
            <Grid item xs={12}>
              <Field
                key={"fee"}
                label={"Estimated Total"}
                value={"$" + totalFee.toFixed(2)}
              />
            </Grid>
          </Grid>
        ) : (
          <Stack direction={"column"} spacing={2}>
            {[
              ...generateSummaryData(),
              ...vehicleSummaryData,
              ...tripSummaryData,
              ...contactSummaryData,
            ].map(
              (field, index) =>
                field?.isVisible && (
                  <Field key={index} label={field.label} value={field.value} />
                )
            )}
            {generateFareBreakdownData().map(
              (field) =>
                field.isVisible && (
                  <Field key={field.label} label={field.label} value={field.value} />
                )
            )}
            <Field
              key={"fee"}
              label={"Estimated Total"}
              value={"$" + totalFee.toFixed(2)}
            />
          </Stack>
        )}
      </Box>
    </Box>
  );
}

StepSummary.defaultProperty = {
  screenType: "small",
};
export default StepSummary;
