import React from "react";
import {
  Box,
  Grid,
  Stack,
  useTheme,
  Badge,
  useMediaQuery,
  Typography,
  Chip,
} from "@mui/material";
import RSTypography from "../../../../components/RSTypography";
import RSButton from "../../../../components/RSButton";
import { BsPeople } from "react-icons/bs";
import { PiSuitcaseDuotone } from "react-icons/pi";
import { useLocation } from "react-router-dom";

function CarComponent({
  carDetail,
  formik,
  handleCarSelect,
  hour,
  distanceInMiles,
  isRoundTrip,
  travelRouteId,
  updateBookingMode,
}) {
  const {
    carName,
    carImageUrl,
    pricePerMile,
    pricePerHour,
    maxPassengers,
    maxSuitcases,
  } = carDetail;

  const currentVehicle = formik.values.vehicle;
  const bookedVehicleId = formik.values.originalCarIdFromBooking;

  const effectiveVehicleId =
    currentVehicle !== "" && currentVehicle != null
      ? currentVehicle
      : bookedVehicleId !== "" && bookedVehicleId != null
        ? bookedVehicleId
        : null;

  const isSelected =
    effectiveVehicleId != null &&
    String(carDetail.carId) === String(effectiveVehicleId);

  const isStillOriginalBookedVehicle =
    updateBookingMode &&
    bookedVehicleId != null &&
    bookedVehicleId !== "" &&
    String(carDetail.carId) === String(bookedVehicleId) &&
    String(currentVehicle) === String(bookedVehicleId);
  const theme = useTheme();
  const location = useLocation();
  var travelType = travelRouteId ?? location.pathname.split("/").pop();
  const matchSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const CarImg = () => {
    return (
      <img
        style={{ width: "100%", height: "auto", objectFit: "contain" }}
        src={carImageUrl}
        alt="car"
      />
    );
  };
  const handleSelect = () => {
    formik.setFieldValue("vehicle", carDetail.carId);
    formik.setFieldValue("vehicleName", carDetail.carName);
    formik.setFieldValue("prevCarMinimumStartFee", carDetail.minimumStartFee);
    formik.setFieldValue("minimumStartFee", parseFloat(carDetail.minimumStartFee));

    if (travelType == "1" || travelType == "2") {
      formik.setFieldValue("vehicleFee", parseFloat(carDetail.pricePerMile));
    } else if (travelType == "3") {
      formik.setFieldValue("vehicleFee", parseFloat(carDetail.pricePerHour));
    }
    handleCarSelect(carDetail.carId);
  };

  const selectCarButtonStyle = { width: { md: 200, xs: "100%", marginBottom: 4 } }

  const calculateCarFee = () => {
    const baseMinimumFee = parseFloat(carDetail.minimumStartFee);
    let calculatedFee = 0;

    if (travelType == "1" || travelType == "2") {
      const carPricePerMile = parseFloat(carDetail.pricePerMile);
      const roundTrip = isRoundTrip();
      
      // Double the minimum fee for round trips
      const minimumCarFee = roundTrip ? baseMinimumFee * 2 : baseMinimumFee;
      const distance = roundTrip ? distanceInMiles * 2 : distanceInMiles;
      
      calculatedFee = (carPricePerMile * distance) + minimumCarFee;
      

    } else if (travelType == "3") {
      const carPricePerHour = parseFloat(carDetail.pricePerHour);
      calculatedFee = (carPricePerHour * hour);

    }
            // calculatedFee = (carPricePerHour * hour) + baseMinimumFee;

    return calculatedFee.toFixed(0);
  };

  return (
    <Box
      sx={{
        padding: 1,
        paddingBottom: matchSmallScreen && 4,
        borderRadius: 1,
        border: isSelected ? "2px solid #03930A" : "2px solid transparent",
        bgcolor: isSelected ? "rgba(3, 147, 10, 0.08)" : "transparent",
        boxShadow: isSelected
          ? "0px 4px 12px rgba(3, 147, 10, 0.25)"
          : "0px 4px 4px rgba(0, 0, 0, 0.25)",
      }}
    >
      <Grid container justifyContent={"space-between"}>
        <Grid item md={5.5} xs={12}>
          <CarImg />
        </Grid>

        <Grid item md={6} xs={12}>
          <Stack
            direction="column"
            justifyContent="space-between"
            alignItems="stretch"
            spacing={2}
            sx={{ height: "100%", margin: matchSmallScreen && 2 }}
          >
                          <Grid item xs={5}>
                <Box>
                  <Stack direction={"row"} justifyContent={"space-between"}>
                    <Stack direction={"row"} justifyContent={"flex-start"}>
                      <Badge
                        color={theme.palette.info.main}
                        badgeContent={maxPassengers}
                      >
                        <BsPeople size={30} />
                      </Badge>
                    </Stack>
                    <Stack direction={"row"} justifyContent={"flex-end"}>
                      <Badge
                        color={theme.palette.info.main}
                        badgeContent={maxSuitcases}
                      >
                        <PiSuitcaseDuotone size={30} />
                      </Badge>
                    </Stack>
                  </Stack>
                </Box>
              </Grid>
            {/* Car Name */}
            <RSTypography
              fontweight={700}
              fontsize={"25px"}
              txtcolor={theme.palette.warning.main}
            >
              {carName}
            </RSTypography>

            {/* Price */}
            <RSTypography fontsize={"25px"}>
              ${calculateCarFee()}
            </RSTypography>

            {isStillOriginalBookedVehicle && (
              <Chip
                size="small"
                variant="outlined"
                label="Booked vehicle (from reservation)"
                sx={{
                  alignSelf: "center",
                  fontWeight: 600,
                  borderColor: "#03930A",
                  color: "#03930A",
                  bgcolor: "rgba(3, 147, 10, 0.06)",
                }}
              />
            )}

            {/* Select Button */}
            <Grid container justifyContent={"center"}>
              <Grid item xs={11} md={6}>
                {isSelected ? (
                  <Stack spacing={0.5} alignItems="center">
                    <RSButton
                      backgroundcolor={"#FF0013"}
                      txtcolor={"#FFF"}
                      sx={selectCarButtonStyle}
                    >
                      Selected
                    </RSButton>
                    {updateBookingMode && (
                      <Typography variant="caption" color="text.secondary" textAlign="center">
                        Choose another vehicle below to switch
                      </Typography>
                    )}
                  </Stack>
                ) : (
                  <RSButton
                    sx={selectCarButtonStyle}
                    variant="outlined"
                    txtcolor={theme.palette.warning.main}
                    bordercolor={theme.palette.warning.main}
                    onClick={handleSelect}
                  >
                    Select
                  </RSButton>
                )}
              </Grid>
            </Grid>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CarComponent;
