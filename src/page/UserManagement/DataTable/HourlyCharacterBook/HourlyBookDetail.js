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
import ReasonPopup from "../AirportBook/airportBook/ReasonPopup";
import axios from "axios";
import BookingStatusPoup from "../BookingStatus";
import PaymentStatusPoup from "../PaymentStatus";

function ViewHourlyBookDetail(props) {
  const location = useLocation();
  const {
    hourlyCharterBookId,
    pickupPhysicalAddress,
    dropoffPhysicalAddress,
    selectedHours,
    occasion,
    specialInstructions,
    bookingFor,
    passengerFullName,
    passengerCellPhone,
    numberOfPassengers,
    numberOfSuitcases,
    totalTripFeeInDollars,
    paymentStatus,
    bookingStatus,
    userId,
    carId,
  } = location.state?.rowData || {};

  const [open, setOpen] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [popupType, setPopupType] = useState(null);

  const handleClickOpen = (type) => {
    setOpen(true);
    setPopupType(type);
  };

  const handleSnackbarClose = (event, reason) => {
    setIsAccepted(false);
  };

  const handleClose = () => {
    setOpen(false);
    setPopupType(null);
  };

  const handleAcceptBook = async () => {
    await axios
      .post("http://api.odatransportation.com/api/v1/admin/bookings/approve", {
        bookingId: hourlyCharterBookId,
        bookingType: "Hourly",
        action: "ACCEPTED",
      })
      .then((response) => {
        if (response.status === 200) {
          setIsAccepted(true);
        }
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
        spacing={3}
      >
        <Grid item container xs={11} lg={10} spacing={2} mt={2}>
          <Field label="hourly Charter BookId" value={hourlyCharterBookId} />
          <Field
            label="pickup Physical Address"
            value={pickupPhysicalAddress}
          />
          <Field
            label="dropoff Physical Address"
            value={dropoffPhysicalAddress}
          />
          <Field label="selected Hours" value={selectedHours} />
          <Field label="Occasion" value={occasion} />
          <Field label="special Instructions" value={specialInstructions} />
          <Field label="bookingFor" value={bookingFor} />

          {/* <Field label="Length" value={length} />
        <Field label="Interior Color" value={interiorColor} />
        <Field label="Exterior Color" value={exteriorColor} />
        <Field label="Power" value={power} />
        <Field label="Transmission Type" value={transmissionType} />
        <Field label="Fuel Type" value={fuelType} />
        <Field label="Extras" value={extras} /> */}
        </Grid>

        <Grid item md={3}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleAcceptBook}
          >
            ACCEPT BOOKING
          </Button>
        </Grid>

        <Grid item sx={5}>
          <Button
            variant="contained"
            color="warning"
            fullWidth
            onClick={() => handleClickOpen("REJECT")}
          >
            REJECT BOOKING
          </Button>
        </Grid>

        <Grid item sx={5}>
          <Button
            variant="contained"
            color="warning"
            fullWidth
            onClick={() => handleClickOpen("EDIT_BOOKING_STATUS")}
          >
            EDIT BOOKING STATUS
          </Button>
        </Grid>

        <Grid item sx={5}>
          <Button
            variant="contained"
            color="warning"
            fullWidth
            onClick={() => handleClickOpen("EDIT_PAYMENT_STATUS")}
          >
            EDIT PAYMENT STATUS
          </Button>
        </Grid>
      </Grid>

      {/* Render the appropriate popup component based on popupType */}
      {popupType === "REJECT" && (
        <ReasonPopup
          hourlyCharterBookId={hourlyCharterBookId}
          open={open}
          handleClose={handleClose}
        />
      )}

      {popupType === "EDIT_BOOKING_STATUS" && (
        <BookingStatusPoup
          bookingId={hourlyCharterBookId}
          bookingType="hourlyCharter"
          open={open}
          handleClose={handleClose}
        />
      )}

      {popupType === "EDIT_PAYMENT_STATUS" && (
        <PaymentStatusPoup
          hourlyCharterBookId={hourlyCharterBookId}
          open={open}
          handleClose={handleClose}
        />
      )}

      {/* Snackbar for success message */}
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
export default ViewHourlyBookDetail;
