import React, { useEffect, useState } from "react";
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
import { calculateDistance, formatDuration } from "../../../../../util/dateUtil";

const Field = ({ label, value, direction = { xs: "column", sm: "row" }, sx }) => {
  return (
    <Grid item xs={12} md={6}>
      <Stack
        direction={direction}
        justifyContent={{ xs: "center", sm: "space-between" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        sx={{ backgroundColor: "#EEE", padding: 2, borderRadius: 2, flexGrow: 1, ...sx }}
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

const ViewBookDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const formatDateToPacific = React.useCallback((dateString) => {
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
  }, []);

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

  const handleAcceptBook = React.useCallback(async () => {
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
  }, [endpoint, airportBookId]);

  const handleAcceptPayment = React.useCallback(async () => {
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
  }, [paymentendpoint, airportBookId]);

  const getBackgroundColorforpayment = React.useCallback((paymentStatus) => {
    switch (paymentStatus) {
      case "PAID":
        return "green";
      case "CANCELLED":
        return "red";
      case "DISCOUNT_APPLIED": // New color for discount applied status
        return "blue";
      default:
        return "orange";
    }
  }, []);

  const getBackgroundColorforbooking = React.useCallback((bookingStatus) => {
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
  }, []);

  const { data: response, isLoading: isLoadingGet, isError: isErrorGet, isFetching: isFetchingTax, error: errorGet } = useGetData(detailendpoint, { enabled: !!airportBookId });

  if (!airportBookId) {
    navigate('/dashboard/airport-books', { state: { error: 'Airport booking ID not provided.' } });
    return null;
  }

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

          {/* Discount Information Display */}
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

          {/* Booking Status and Payment Status section */}
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
                  backgroundColor: getBackgroundColorforbooking(response?.bookingStatus || bookingStatus),
                  border: "1px solid",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  textAlign: "center",
                  fontSize: { xs: "16px", md: "18px" },
                  fontWeight: "bold",
                }}
              >
                Booking Status: {response?.bookingStatus || bookingStatus}
              </Box>
            </Grid>
          </Grid>

          {/* General Booking Details Section */}
          <Grid container spacing={2} mt={4} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3, backgroundColor: '#f9f9f9' }}>
            <Typography variant="h6" sx={{ ml: 2, mb: 1, fontWeight: 'bold', width: '100%' }}>
              General Booking Information:
            </Typography>
            <Grid container spacing={2} mt={1} pl={2} pr={2}>
              <Field label="Airport Book Id" value={airportBookId} />
              {(response?.tripType || tripType) && <Field label="Trip Type" value={response?.tripType || tripType} />}
              {response?.numberOfPassengers && <Field label="Number Of Passengers" value={response?.numberOfPassengers} />}
              {response?.numberOfSuitcases !== undefined && <Field label="Number Of Suitcases" value={response?.numberOfSuitcases} />}
              {(response?.accommodationAddress || accommodationAddress) && <Field label="Accommodation Address" value={response?.accommodationAddress || accommodationAddress} />}
              {response?.airline && <Field label="Airline" value={response?.airline} />}
              {response?.arrivalFlightNumber && <Field label="Arrival Flight Number" value={response?.arrivalFlightNumber} />}
              {response?.returnAirline && <Field label="Return Airline" value={response?.returnAirline} />}
              {response?.returnFlightNumber && <Field label="Return Flight Number" value={response?.returnFlightNumber} />}
              {response?.specialInstructions && <Field label="Special Instructions" value={response?.specialInstructions} />}
              {(response?.pickupDateTime || pickupDateTime) && <Field label="Pickup Date Time" value={formatDateToPacific(response?.pickupDateTime || pickupDateTime)} />}
              {(response?.returnPickupDateTime || returnPickupDateTime) && <Field label="Return Pickup Date Time" value={formatDateToPacific(response?.returnPickupDateTime || returnPickupDateTime)} />}
              {response?.distanceInMiles && <Field label="Distance In Miles" value={response?.distanceInMiles} />}
              {response?.additionalStopOnTheWayDescription && <Field label="Additional Stop On The Way Description" value={response?.additionalStopOnTheWayDescription} />}
              {response?.isGuestBooking !== undefined && <Field label="Is Guest Booking" value={response.isGuestBooking.toString()} />}
              {response?.bookingFor && <Field label="Booking For" value={response?.bookingFor} />}
              {(response?.passengerFullName || passengerFullName) && <Field label="Passenger Full Name" value={response?.passengerFullName || passengerFullName} />}
              {(response?.passengerCellPhone || passengerCellPhone) && <Field label="Passenger Cell Phone" value={response?.passengerCellPhone || passengerCellPhone} />}
              {(response?.passengerEmail || passengerEmail) && <Field label="Passenger Email" value={response?.passengerEmail || passengerEmail} />}
            </Grid>
          </Grid>

          {/* Financial Summary Section */}
          <Grid container spacing={2} mt={4} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3, backgroundColor: '#f9f9f9' }}>
            <Typography variant="h6" sx={{ ml: 2, mb: 1, fontWeight: 'bold', width: '100%', backgroundColor: 'black', color: 'white', padding: 2, borderRadius: 2 }}>
              Fare Detail
            </Typography>
            <Grid container spacing={2} mt={1} pl={2} pr={2}>
              {/* Calculate values */}
              {(() => {
                const initialBaseFare = parseFloat(response?.totalTripFeeInDollars || totalTripFeeInDollars || 0);
                const discount = parseFloat(response?.discountAmountInDollars || 0);
                const childCarSeatFee = 0.00; // Constant value
                const airportPickupPreferenceFee = 0.00; // Value from previous edit, assuming constant for now

                let originalFare = 0;
                let calculatedGratuity = 0;
                if (response?.Gratuity?.percentage !== undefined) {
                  const gratuityPercentage = parseFloat(response.Gratuity.percentage) / 100;
                  // Assuming initialBaseFare includes gratuity, back it out to get the fare before gratuity
                  // Assuming initialBaseFare includes gratuity, back it out to get the fare before gratuity
                  originalFare = initialBaseFare / (1 + gratuityPercentage);
                  calculatedGratuity = originalFare * gratuityPercentage;
                }

                const fareAfterDiscount = originalFare;
                const totalFare = initialBaseFare;
                return (
                  <>
                    <Field label="Fare" value={`$${fareAfterDiscount.toFixed(2)}`} />
                    <Field label="Child Car Seat Fee" value={`$${childCarSeatFee.toFixed(2)}`} />
                    <Field label="Airport Pickup Preference Fee" value={`$${airportPickupPreferenceFee.toFixed(2)}`} />
                    {response?.discountAmountInDollars && <Field label="Discount Amount" value={`$${discount.toFixed(2)}`} />}
                    {response?.Gratuity && response.Gratuity.percentage !== undefined && (
                      <Field label="Gratuity" value={`$${calculatedGratuity.toFixed(2)} (${response.Gratuity.percentage}%)`} />
                    )}
                    <Field
                      label="Total Fare"
                      value={`$${totalFare.toFixed(2)}`}
                      sx={{
                        backgroundColor: '#6a6a6a',
                        color: 'white',
                        fontWeight: 'bold',
                        padding: 2,
                        borderRadius: 2,
                      }}
                    />
                  </>
                );
              })()}
            </Grid>
          </Grid>

          {/* Payment Details Section */}
          {response?.PaymentDetail && (
            <Grid container spacing={2} mt={4} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3, backgroundColor: '#f9f9f9' }}>
              <Typography variant="h6" sx={{ ml: 2, mb: 1, fontWeight: 'bold', width: '100%' }}>
                Payment Details:
              </Typography>
              <Grid container spacing={2} mt={1} pl={2} pr={2}>
                {response.PaymentDetail.creditCardNumber && <Field label="Credit Card Number" value={response.PaymentDetail.creditCardNumber} />}
                {response.PaymentDetail.expirationDate && <Field label="Expiration Date" value={response.PaymentDetail.expirationDate} />}
                {response.PaymentDetail.securityCode && <Field label="Security Code" value={response.PaymentDetail.securityCode} />}
                {response.PaymentDetail.zipCode && <Field label="Zip Code" value={response.PaymentDetail.zipCode} />}
                {response.PaymentDetail.cardOwnerName && <Field label="Card Owner Name" value={response.PaymentDetail.cardOwnerName} />}
              </Grid>
            </Grid>
          )}

          {/* Airport Details Section */}
          {response?.Airport && (
            <Grid container spacing={2} mt={4} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3, backgroundColor: '#f9f9f9' }}>
              <Typography variant="h6" sx={{ ml: 2, mb: 1, fontWeight: 'bold', width: '100%' }}>
                Airport Details:
              </Typography>
              <Grid container spacing={2} mt={1} pl={2} pr={2}>
                {response.Airport.airportId && <Field label="Airport ID" value={response.Airport.airportId} />}
                {response.Airport.airportName && <Field label="Airport Name" value={response.Airport.airportName} />}
                {response.Airport.airportAddress && <Field label="Airport Address" value={response.Airport.airportAddress} />}
              </Grid>
            </Grid>
          )}

          {/* Additional Stop Details Section */}
          {response?.AdditionalStopOnTheWay && (
            <Grid container spacing={2} mt={4} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3, backgroundColor: '#f9f9f9' }}>
              <Typography variant="h6" sx={{ ml: 2, mb: 1, fontWeight: 'bold', width: '100%' }}>
                Additional Stop Details:
              </Typography>
              <Grid container spacing={2} mt={1} pl={2} pr={2}>
                {response.AdditionalStopOnTheWay.additionalStopId && <Field label="Additional Stop Id" value={response.AdditionalStopOnTheWay.additionalStopId} />}
                {response.AdditionalStopOnTheWay.stopType && <Field label="Stop Type" value={response.AdditionalStopOnTheWay.stopType} />}
                {response.AdditionalStopOnTheWay.additionalStopPrice && <Field label="Price" value={`$${response.AdditionalStopOnTheWay.additionalStopPrice}`} />}
                {response.AdditionalStopOnTheWay.currency && <Field label="Currency" value={response.AdditionalStopOnTheWay.currency} />}
              </Grid>
            </Grid>
          )}

          {/* Car Details Section */}
          {response?.Car && (
            <Grid container spacing={2} mt={4} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3, backgroundColor: '#f9f9f9' }}>
              <Typography variant="h6" sx={{ ml: 2, mb: 1, fontWeight: 'bold', width: '100%' }}>
                Car Details:
              </Typography>
              <Grid container spacing={2} mt={1} pl={2} pr={2}>
                {response.Car.carId && <Field label="Car Id" value={response.Car.carId} />}
                {response.Car.carName && <Field label="Car Name" value={response.Car.carName} />}
                {response.Car.pricePerMile && <Field label="Price Per Mile" value={`$${response.Car.pricePerMile}`} />}
                {response.Car.pricePerHour && <Field label="Price Per Hour" value={`$${response.Car.pricePerHour}`} />}
                {response.Car.minimumStartFee && <Field label="Minimum Start Fee" value={`$${response.Car.minimumStartFee}`} />}
                {response.Car.currency && <Field label="Currency" value={response.Car.currency} />}
              </Grid>
            </Grid>
          )}

          {/* Enhanced Extra Options Section */}
          <Grid container item xs={12} spacing={2} mt={4} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3, backgroundColor: '#f9f9f9' }}>
            <Typography variant="h6" sx={{ ml: 2, mb: 2, fontWeight: 'bold', width: '100%' }}>
              Extra Options:
            </Typography>
            {response?.ExtraOptions && response.ExtraOptions.length > 0 ? (
              <Grid container spacing={3} mb={3}>
                {response.ExtraOptions.map((option, index) => (
                  <Grid item xs={12} md={6} key={option.extraOptionId || index}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 3, 
                        height: '100%',
                        border: '1px solid #d0d0d0',
                        borderRadius: 2,
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
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
                              backgroundColor: '#f5f5f5',
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
                            {option.AirportBookExtraOption?.quantity || option.quantity || 1}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper elevation={1} sx={{ p: 3, textAlign: 'center', backgroundColor: '#e8e8e8', border: '1px dashed #c0c0c0' }}>
                <Typography variant="body1" color="text.secondary">
                  No extra options selected for this booking.
                </Typography>
              </Paper>
            )}
          </Grid>

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
};

export default ViewBookDetail;