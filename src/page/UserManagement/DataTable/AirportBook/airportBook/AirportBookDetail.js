import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Alert,
  Grid,
  Typography,
  Stack,
  Button,
  Snackbar,
} from "@mui/material";
import ReasonPopup from "./ReasonPopup";
import axios from "axios";
function ViewBookDetail(props) {
  const location = useLocation();
  const {
    airportBookId,
    tripType,
    airportId,
    numberOfPassengers,
    numberOfSuitcases,
    accommodationAddress,
    accommodationLongitude,
    accommodationLatitude,
    airline,
    arrivalFlightNumber,
    specialInstructions,
    pickupDateTime,
    returnPickupDateTime,
    distanceInMiles,
    carId,
    additionalStopId,
    additionalStopOnTheWayDescription,
    pickupPreferenceId,
    extraOptions,
    bookingFor,
    passengerFullName,
    passengerCellPhone,
  } = location.state?.rowData || {};


  const extraOptionId = location.state?.rowData?.ExtraOptions?.extraOptionId;



  const [open, setOpen] = React.useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  // const navigate = useNavigate();
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleSnackbarClose = (event, reason) => {
    setIsAccepted(false);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleAcceptBook = async () => {
    await axios
      .post("http://api.odatransportation.com/api/v1/admin/bookings/approve", {
        bookingId: airportBookId,
        bookingType: "AIRPORT",
        action: "ACCEPTED",
      })
      .then((response) => {
        if (response.status == 200) {
          setIsAccepted(true);
          // navigate("/dashboard/airportbook");
        }
        console.log("response: ", response);
      });
  };
  const Field = ({ label, value }) => {
    return (
      <Grid item xs={6}>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          sx={{ backgroundColor: "#EEE", padding: 2, borderRadius: 2 }}
        >
          <Typography sx={{ fontWeight: "bold", fontSize: "20px" }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: "20px" }}>{value}</Typography>
        </Stack>
      </Grid>
    );
  };
  return (
    <>
      <Grid
        container
        justifyContent={"center"}
        alignItems={"center"}
        spacing={2}
      >
        <Grid item container xs={11} lg={10} spacing={2} mt={2}>
          <Field label="Trip Type" value={tripType} />
          <Field label="Airport id" value={airportId} />
          <Field label="Num. of Passenger" value={numberOfPassengers} />
          <Field label="Num. of Suitcase" value={numberOfSuitcases} />
          <Field label="Accomodation Addr." value={accommodationAddress} />
          <Field label="Airline" value={airline} />
          <Field label="Flight Num." value={arrivalFlightNumber} />

          {/* <Field label="Length" value={length} />
        <Field label="Interior Color" value={interiorColor} />
        <Field label="Exterior Color" value={exteriorColor} />
        <Field label="Power" value={power} />
        <Field label="Transmission Type" value={transmissionType} />
        <Field label="Fuel Type" value={fuelType} />
        <Field label="Extras" value={extras} /> */}
        </Grid>
        <Grid item lg={5}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleAcceptBook}
          >
            ACCEPT
          </Button>
        </Grid>

        <Grid item lg={5}>
          <Button
            variant="contained"
            color="warning"
            fullWidth
            onClick={handleClickOpen}
          >
            REJECT
          </Button>
        </Grid>
      </Grid>
      <ReasonPopup
        airportBookId={airportBookId}
        open={open}
        handleClickOpen={handleClickOpen}
        handleClose={handleClose}
      />
      <Snackbar
        open={isAccepted}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Book Accepted Successfully
        </Alert>
      </Snackbar>
    </>
  );
}
export default ViewBookDetail;
