import React, { useState } from "react";
import { useLocation } from "react-router-dom";

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
import useGetData from "../../../../store/hooks/useGetData";
function P2pBookDetail(props) {
  const location = useLocation();
  // const [pointToPointBookId, setPointToPointBookId] = React.useState(null);

  const {
    pointtopointBookId,
    tripType,
    pickupPhysicalAddress,
    dropoffPhysicalAddress,
    distanceInMiles,
    numberOfPassengers,
    numberOfSuitcases,
    pickupDateTime,
    returnPickupDateTime,
    specialInstructions,
    bookingFor,
    passengerFullName,
    passengerCellPhone,
    additionalStopId,
    additionalStopOnTheWayDescription,
    totalTripFeeInDollars,
    paymentStatus,
    bookingStatus,
    userId,
  } = location.state?.rowData || {};

  const pointToPointBookId = location.state?.rowData?.pointToPointBookId; // Provide a default value if Car is undefined

  console.log("vvvv", location.state?.rowData);

  const endpoint = `/api/v1/point-to-point-books/${pointToPointBookId}`;
  const {
    data: response,
    isLoading: isLoadingGet,
    isError: isErrorGet,
    isFetching: isFetchingTax,
    error: errorGet,
  } = useGetData(endpoint);
  console.log("hhhh", response);

  // const extraOptionId = location.state?.rowData?.ExtraOptions?.extraOptionId;
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
        bookingId: pointtopointBookId,
        bookingType: "Hourly",
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
          <Field
            label="pickup Physical Address"
            value={pickupPhysicalAddress}
          />
          <Field
            label="dropoff Physical Address"
            value={dropoffPhysicalAddress}
          />
          <Field label="Distance In Miles" value={distanceInMiles} />
          <Field label="Number Of Passengers" value={numberOfPassengers} />
          <Field label="Special Instructions" value={numberOfSuitcases} />
          <Field label="Return Pickup DateTime" value={returnPickupDateTime} />
          <Field label="Special Instructions" value={specialInstructions} />
          <Field label="Booking For" value={bookingFor} />
          <Field label="Passenger FullName" value={passengerFullName} />
          <Field label="Passenger CellPhone" value={passengerCellPhone} />
          <Field label="Pickup Date Time" value={pickupDateTime} />
          <Field label="TotaTripFee In Dollars" value={totalTripFeeInDollars} />
          <Field label="Payment Status" value={paymentStatus} />
          <Field label="Booking Status" value={bookingStatus} />
          <Field label="User Id" value={userId} />

          <Field
            label="Additional Stop On The Way Description"
            value={additionalStopOnTheWayDescription}
          />
          <Field label="Car Name" value={response?.Car?.carName} />
          <Field label="carId " value={response?.Car?.carId} />
          <Field label="PricePerMile" value={response?.Car?.pricePerMile} />


          <Field label="Additional StopId" value={response?.AdditionalStopOnTheWay?.additionalStopId} />
          <Field label="stop Type" value={response?.AdditionalStopOnTheWay?.stopType} />
          <Field label="Additional Stop Price" value={response?.AdditionalStopOnTheWay?.additionalStopPrice} />
          <Field label="currency" value={response?.AdditionalStopOnTheWay?.currency} />




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
        pointtopointBookId={pointtopointBookId}
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
export default P2pBookDetail;
