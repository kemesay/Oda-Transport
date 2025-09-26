import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Alert,
  Grid,
  Typography,
  Stack,
  Button,
  Snackbar,
  Paper,
  Box,
  Chip,
} from "@mui/material";
import ReasonPopup from "../../ReasonPopup";
import PaymentStatusPopup from "../../PaymentStatus";
import BookingStatusPoup from "../../BookingStatus";
import DiscountPopup from "../../discountpopup"; // Import DiscountPopup
import { BACKEND_API } from "../../../../../store/utils/API";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import useGetData from "../../../../../store/hooks/useGetData";

function ViewBookDetail(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    tripType,
    numberOfPassengers,
    numberOfSuitcases,
    accommodationAddress,
    accommodationLongitude,
    accommodationLatitude,
    airline,
    specialInstructions,
    pickupDateTime,
    returnPickupDateTime,
    arrivalFlightNumber,
    distanceInMiles,
    additionalStopOnTheWayDescription,
    isGuestBooking,
    bookingFor,
    passengerFullName,
    passengerCellPhone,
    passengerEmail,
    totalTripFeeInDollars,
    paymentStatus,
    AdditionalStopOnTheWay,
    bookingStatus,
    paymentDetailId,
    userId,
    additionalStopId,
    pickupPreferenceId,
    returnAirline,
    returnFlightNumber,
  } = location.state?.rowData || {};

  const airportBookId = location.state?.rowData?.airportBookId;
  const airportName = location.state?.rowData?.Airport?.airportName;

  const [open, setOpen] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false); // State for discount popup

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

  // Discount popup handlers
  const handleDiscountOpen = () => {
    setDiscountOpen(true);
  };

  const handleDiscountClose = () => {
    setDiscountOpen(false);
  };

  const endpoint = `/api/v1/admin/bookings/approve`;
  const paymentendpoint = `/api/v1/admin/bookings/update-payment-status`;
  const detailendpoint = `/api/v1/airport-books/${airportBookId}`;

  const {
    data: response,
    isLoading: isLoadingGet,
    isError: isErrorGet,
    isFetching: isFetchingTax,
    error: errorGet,
  } = useGetData(detailendpoint, { enabled: !!airportBookId });

  if (!airportBookId) {
    navigate('/dashboard/airport-books', { state: { error: 'Airport booking ID not provided.' } });
    return null;
  }

  const handleAcceptBook = async () => {
    try {
      const response = await BACKEND_API.post(endpoint, {
        bookingId: airportBookId,
        bookingType: "AIRPORT",
        action: "ACCEPTED",
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(response?.data?.message || `Book Updated successfully!`, {
          autoClose: 6000,
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || " Network error...", {});
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPayment = async () => {
    try {
      const response = await BACKEND_API.post(paymentendpoint, {
        bookingId: airportBookId,
        bookingType: "AIRPORT",
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(response?.data?.message || `Payment Taken successfully!`, {
          autoClose: 6000,
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || " Network error...", {});
    } finally {
      setLoading(false);
    }
  };

  const getBackgroundColorforpayment = (paymentStatus) => {
    switch (paymentStatus) {
      case "PAID":
        return "green";
      case "CANCELLED":
        return "red";
      default:
        return "orange";
    }
  };

  const getBackgroundColorforbooking = (bookingStatus) => {
    switch (bookingStatus) {
      case "ACCEPTED":
        return "green";
      case "COMPLETED":
        return "green";
      case "CANCELLED":
        return "red";
      case "REJECTED":
        return "red";
      default:
        return "orange";
    }
  };

  const Field = ({ label, value, direction = { xs: "column", sm: "row" } }) => {
    return (
      <Grid item xs={12} md={6}>
        <Stack
          direction={direction}
          justifyContent={{ xs: "center", sm: "space-between" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ backgroundColor: "#EEE", padding: 2, borderRadius: 2, flexGrow: 1 }}
        >
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "16px", md: "20px" },
              marginBottom: { xs: 1, sm: 0 },
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "16px", md: "20px" },
              wordBreak: "break-word",
              textAlign: { xs: "left", sm: "right" },
            }}
          >
            {value}
          </Typography>
        </Stack>
      </Grid>
    );
  };

  // Function to render description with proper formatting
  const renderDescription = (description) => {
    if (!description) return 'N/A';
    
    return (
      <Box sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {description}
      </Box>
    );
  };

  const formatDateToPacific = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      }).format(date);
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  };

  return (
    <Grid
      container
      justifyContent={"center"}
      alignItems={"center"}
      spacing={3}
      sx={{ p: { xs: 2, md: 3 } }}
    >
      <Grid item xs={12} md={10} lg={9}>
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}
          >
            Airport Booking Details
          </Typography>

          {response?.hasDiscountApplied && (
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 2, 
                    backgroundColor: '#e3f2fd', 
                    border: '2px solid #1976d2',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    💰 Discount Applied
                  </Typography>
                  <Typography variant="body1">
                    Discount Amount: <strong>${response?.discountAmountInDollars}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                    Original Total: ${(parseFloat(response?.totalTripFeeInDollars || 0) + parseFloat(response?.discountAmountInDollars || 0)).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    New Total: <strong>${response?.totalTripFeeInDollars}</strong>
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}

          <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  color: "white",
                  backgroundColor: getBackgroundColorforpayment(response?.paymentStatus || paymentStatus),
                  border: "1px solid",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  textAlign: "center",
                  fontSize: { xs: "16px", md: "18px" },
                  fontWeight: "bold",
                }}
              >
                Payment Status: {response?.paymentStatus || paymentStatus}
                {response?.hasDiscountApplied && " (Discount Applied)"}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  color: "white",
                  backgroundColor: getBackgroundColorforbooking(bookingStatus),
                  border: "1px solid",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  textAlign: "center",
                  fontSize: { xs: "16px", md: "18px" },
                  fontWeight: "bold",
                }}
              >
                Booking Status: {bookingStatus}
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={2} mt={2}>
            <Field label="Trip Type" value={tripType} />
            <Field label="Number Of Passengers" value={numberOfPassengers} />
            <Field label="Number Of Suitcases" value={numberOfSuitcases} />
            <Field label="Accommodation Address" value={accommodationAddress} />
            <Field label="Airline" value={airline} />
            <Field label="Arrival Flight Number" value={arrivalFlightNumber} />
            <Field label="Return Airline" value={returnAirline} />
            <Field label="Return Flight Number" value={returnFlightNumber} />
            <Field label="Special Instructions" value={specialInstructions} />
            <Field label="Pickup Date Time" value={formatDateToPacific(pickupDateTime)} />
            <Field label="Distance In Miles" value={distanceInMiles} />
            <Field label="Additional Stop On The Way Description" value={additionalStopOnTheWayDescription} />
            <Field label="Booking For" value={bookingFor} />
            <Field label="Passenger Full Name" value={passengerFullName} />
            <Field label="Total Trip Fee In Dollars" value={totalTripFeeInDollars} />
            <Field label="User Id" value={userId} />
            <Field label="Additional Stop Id" value={additionalStopId} />
            <Field label="Pickup Preference Id" value={pickupPreferenceId} />
            <Field label="Return Pickup Date Time" value={formatDateToPacific(returnPickupDateTime)} />
            <Field label="Is Guest Booking" value={isGuestBooking} />
            <Field label="Passenger Cell Phone" value={passengerCellPhone} />
            <Field label="Passenger Email" value={passengerEmail} />
            <Field label="Payment Detail Id" value={paymentDetailId} />
            <Field label="Credit Card Number" value={response?.PaymentDetail?.creditCardNumber} />
            <Field label="Expiration Date" value={response?.PaymentDetail?.expirationDate} />
            <Field label="Security Code" value={response?.PaymentDetail?.securityCode} />
            <Field label="Zip Code" value={response?.PaymentDetail?.zipCode} />
            <Field label="Airport ID" value={response?.Airport?.airportId} />
            <Field label="Airport Name" value={response?.Airport?.airportName} />
            <Field label="Airport Address" value={response?.Airport?.airportAddress} />
            <Field label="Additional Stop On the Way" value={AdditionalStopOnTheWay} />
            <Field label="Car Id" value={response?.Car?.carId} />
            <Field label="Car Name" value={response?.Car?.carName} />
            <Field label="Price Per Mile" value={response?.Car?.pricePerMile} />
            <Field label="Price Per Hour" value={response?.Car?.pricePerHour} />
          </Grid>

          {/* Enhanced Extra Options Section */}
          <Grid container item xs={12} spacing={2} mt={4}>
            <Typography variant="h6" sx={{ ml: 2, mb: 2, fontWeight: 'bold' }}>
              Extra Options:
            </Typography>
          </Grid>

          {response?.ExtraOptions && response.ExtraOptions.length > 0 ? (
            <Grid container spacing={3} mb={3}>
              {response.ExtraOptions.map((option, index) => (
                <Grid item xs={12} md={6} key={option.extraOptionId || index}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 3, 
                      height: '100%',
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {option.name || `Extra Option ${index + 1}`}
                      </Typography>
                      <Chip 
                        label={`ID: ${option.extraOptionId}`} 
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                      />
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                          Description:
                        </Typography>
                        <Box 
                          sx={{ 
                            mt: 1,
                            p: 1.5,
                            backgroundColor: 'white',
                            borderRadius: 1,
                            border: '1px solid #e0e0e0',
                            minHeight: '60px'
                          }}
                        >
                          {renderDescription(option.description)}
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                          Price:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          ${option.pricePerItem || '0.00'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                          Quantity:
                        </Typography>
                        <Typography variant="body1">
                          {option.quantity || 1}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper elevation={1} sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
              <Typography variant="body1" color="text.secondary">
                No extra options selected for this booking.
              </Typography>
            </Paper>
          )}

          <Grid container justifyContent="center" spacing={2} mt={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#03930a",
                  color: "white",
                  "&:hover": { backgroundColor: "#027c08" },
                }}
                fullWidth
                onClick={handleAcceptBook}
              >
                ACCEPT BOOKING
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "red",
                  color: "white",
                  "&:hover": { backgroundColor: "#d32f2f" },
                }}
                fullWidth
                onClick={() => handleClickOpen("REJECT")}
              >
                REJECT BOOKING
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                color="warning"
                fullWidth
                onClick={() => handleClickOpen("EDIT_BOOKING_STATUS")}
              >
                EDIT BOOKING STATUS
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#03930a",
                  color: "white",
                  "&:hover": { backgroundColor: "#027c08" },
                }}
                fullWidth
                onClick={handleAcceptPayment}
              >
                TAKE PAYMENT
              </Button>
            </Grid>

           {/* New Discount Button */}
           <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: response?.hasDiscountApplied ? "#6a1b9a" : "#1976d2",
                  color: "white",
                  "&:hover": { 
                    backgroundColor: response?.hasDiscountApplied ? "#4a148c" : "#1565c0" 
                  },
                }}
                fullWidth
                onClick={handleDiscountOpen}
                disabled={response?.paymentStatus === "PAID"}
              >
                {response?.hasDiscountApplied ? "UPDATE DISCOUNT" : "APPLY DISCOUNT"}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {popupType === "REJECT" && (
        <ReasonPopup
          bookingId={airportBookId}
          bookingType="AIRPORT"
          open={open}
          handleClose={handleClose}
        />
      )}

      {popupType === "EDIT_BOOKING_STATUS" && (
        <BookingStatusPoup
          bookingId={airportBookId}
          bookingType="airport"
          open={open}
          handleClose={handleClose}
        />
      )}

      {popupType === "EDIT_PAYMENT_STATUS" && (
        <PaymentStatusPopup
          bookingId={airportBookId}
          bookingType="airport"
          open={open}
          handleClose={handleClose}
        />
      )}

      {/* Discount Popup */}
      <DiscountPopup
        bookingId={airportBookId}
        bookingType="AIRPORT"
        open={discountOpen}
        handleClose={handleDiscountClose}
      />
      
      <ToastContainer position="top-center" />
    </Grid>
  );
}

export default ViewBookDetail;