import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Alert,
  Paper,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from "react-redux";
import { BACKEND_API } from '../../store/utils/API';
import { authHeader } from '../../util/authUtil';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Import your existing components
import RideDetailForm from '../homePage/components/rideDetailForm';
import VehicleForm from '../homePage/components/chooseVehicleForm';
import TripDetailForm from '../homePage/components/tripDetail';
import ContactDetailForm from '../homePage/components/contactDetailForm';
import {
  mapApiBookingToFormik,
  travelTypeToRouteId,
  resolveCarIdFromApi,
} from "./mapApiBookingToFormik";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getAllCars } from "../../store/actions/carAction";
import { getExtraOptions } from "../../store/actions/extraOptions";
import { updateCars } from "../../store/reducers/carReducer";
import { updateExtraOption } from "../../store/reducers/extraOptionReducer";
import { store } from "../../store";

dayjs.extend(utc);
dayjs.extend(timezone);

const UpdateContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(6),
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: 'rgba(3, 147, 10, 0.02)',
  border: '1px solid rgba(3, 147, 10, 0.1)',
}));

const LoadingWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  gap: theme.spacing(2),
}));

function UpdateBooking() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState(null);
  const [travelRouteId, setTravelRouteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationChecker, setLocationChecker] = useState({
    isUnsupportedLocation: false,
    errorMessage: "",
  });

  const [accomAddrChecker, setAccomAddrChecker] = useState({
    isUnsupportedLocation: false,
    errorMessage: "",
  });

  const [airportLocChecker, setAirportLocChecker] = useState({
    isUnsupportedLocation: false,
    errorMessage: "",
  });

  const formik = useFormik({
    initialValues: {
      // Default values
      vehicle: '',
      vehicleName: '',
      vehicleFee: 0,
      prevCarMinimumStartFee: 0,
      minimumStartFee: 0,
      numberOfPassengers: 1,
      numberOfSuitcases: 0,
      pickupPhysicalAddress: '',
      dropoffPhysicalAddress: '',
      pickupLatitude: '',
      pickupLongitude: '',
      dropoffLatitude: '',
      dropoffLongitude: '',
      distanceInMiles: 0,
      duration: '',
      tripType: '',
      airportLocationAddress: '',
      airportLocationLatitude: '',
      airportLocationLongitude: '',
      hotel: '',
      accommodationAddress: '',
      accommodationLatitude: '',
      accommodationLongitude: '',
      hour: 5,
      pickupDate: null,
      pickupTime: null,
      returnPickupDate: null,
      returnPickupTime: null,
      formattedPickupDate: '',
      formattedPickupTime: '',
      formattedReturnPickupDate: '',
      formattedReturnPickupTime: '',
      airline: '',
      arrivalFlightNumber: '',
      returnAirline: '',
      returnFlightNumber: '',
      instruction: '',
      pickupPreference: '',
      pickupPreferenceFee: 0,
      prevPickupPrefValue: 0,
      occation: '',
      additionalStopId: 0,
      additionalStopOnTheWayDescription: '',
      stopOnWayFee: 0,
      prevAddtionalStopOnTheWayFee: 0,
      extraOptions: [],
      extraOptionFee: 0,
      passengerFullName: '',
      passengerCellPhone: '',
      email: '',
      bookingFor: 'Myself',
      gratuityId: 1,
      prevGratuityFee: 0,
      gratuityFee: 0,
      isValidCardInfo: false,
      creditCardNumber: '',
      cardOwnerName: '',
      expirationDate: '',
      zipCode: '',
      securityCode: '',
      isGuestBooking: false,
      entryOptionSelected: false,
      cardDetails: {
        cardOwnerName: '',
        creditCardNumber: '',
        expirationDate: '',
        securityCode: '',
        zipCode: '',
      },
      /** Set from GET when updating; used to highlight the booked car if `vehicle` is ever cleared. */
      originalCarIdFromBooking: null,
    },
    validationSchema: Yup.object({
      vehicle: Yup.mixed().required('Vehicle selection is required'),
      numberOfPassengers: Yup.number().required('Number of passengers is required'),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const travelType = (bookingData?.travelType || "").toLowerCase();

        const tz = dayjs.tz.guess();
        const formatPatchDateTime = (values, isoFallback) => {
          if (values?.formattedPickupDate && values?.formattedPickupTime) {
            return `${values.formattedPickupDate} ${values.formattedPickupTime}`;
          }
          if (isoFallback) {
            return dayjs(isoFallback).tz(tz).format("YYYY-MM-DD HH:mm:ss");
          }
          return "";
        };

        const formatReturnPatchDateTime = (values, isoFallback) => {
          if (values?.formattedReturnPickupDate && values?.formattedReturnPickupTime) {
            return `${values.formattedReturnPickupDate} ${values.formattedReturnPickupTime}`;
          }
          if (isoFallback) {
            return dayjs(isoFallback).tz(tz).format("YYYY-MM-DD HH:mm:ss");
          }
          return "";
        };

        const extraOptions = Array.isArray(values.extraOptions)
          ? values.extraOptions
              .map((o) => ({
                extraOptionId: o.extraOptionId,
                quantity: o.quantity,
              }))
              .filter((o) => o.extraOptionId && o.quantity)
          : [];

        let endpoint;
        let body;

        if (travelType === "airport") {
          endpoint = `/api/v1/users/bookings/mine/airport/${bookingData.bookId}`;
          body = {
            tripType: values.tripType,
            airportLocationAddress: values.airportLocationAddress,
            airportLocationLatitude: Number(values.airportLocationLatitude),
            airportLocationLongitude: Number(values.airportLocationLongitude),
            numberOfPassengers: Number(values.numberOfPassengers),
            numberOfSuitcases: Number(values.numberOfSuitcases),
            accommodationAddress: values.accommodationAddress,
            accommodationLongitude: Number(values.accommodationLongitude),
            accommodationLatitude: Number(values.accommodationLatitude),
            airline: values.airline,
            arrivalFlightNumber: values.arrivalFlightNumber,
            specialInstructions: values.instruction,
            pickupDateTime: formatPatchDateTime(values, bookingData?.pickupDateTime),
            distanceInMiles: Number(values.distanceInMiles),
            carId: Number(values.vehicle),
            gratuityId: Number(values.gratuityId),
            bookingFor: values.bookingFor,
            passengerFullName: values.passengerFullName,
            passengerCellPhone: values.passengerCellPhone,
            passengerEmail: values.email,
            pickupPreferenceId: Number(values.pickupPreference),
          };

          // Optional fields (match create-booking behavior)
          if (values.additionalStopId && Number(values.additionalStopId) !== 0) {
            body.additionalStopId = Number(values.additionalStopId);
            body.additionalStopOnTheWayDescription = values.additionalStopOnTheWayDescription;
          }

          const returnTrip =
            values.tripType === "Ride from the airport(round trip)" ||
            values.tripType === "Ride to the airport(round trip)";
          if (returnTrip) {
            body.returnPickupDateTime = formatReturnPatchDateTime(
              values,
              bookingData?.returnPickupDateTime
            );
            if (values.returnAirline) body.returnAirline = values.returnAirline;
            if (values.returnFlightNumber) {
              body.returnFlightNumber = values.returnFlightNumber;
            }
          }

          if (extraOptions.length > 0) body.extraOptions = extraOptions;
        } else if (travelType === "point to point") {
          endpoint = `/api/v1/users/bookings/mine/p2p/${bookingData.bookId}`;
          body = {
            tripType: values.tripType,
            pickupPhysicalAddress: values.pickupPhysicalAddress,
            pickupLongitude: Number(values.pickupLongitude),
            pickupLatitude: Number(values.pickupLatitude),
            dropoffPhysicalAddress: values.dropoffPhysicalAddress,
            dropoffLongitude: Number(values.dropoffLongitude),
            dropoffLatitude: Number(values.dropoffLatitude),
            distanceInMiles: Number(values.distanceInMiles),
            numberOfPassengers: Number(values.numberOfPassengers),
            numberOfSuitcases: Number(values.numberOfSuitcases),
            pickupDateTime: formatPatchDateTime(values, bookingData?.pickupDateTime),
            specialInstructions: values.instruction,
            bookingFor: values.bookingFor,
            passengerFullName: values.passengerFullName,
            passengerEmail: values.email,
            passengerCellPhone: values.passengerCellPhone,
            carId: Number(values.vehicle),
            gratuityId: Number(values.gratuityId),
          };

          if (values.tripType === "Round-Trip") {
            body.returnPickupDateTime = formatReturnPatchDateTime(
              values,
              bookingData?.returnPickupDateTime
            );
          }

          if (values.additionalStopId && Number(values.additionalStopId) !== 0) {
            body.additionalStopId = Number(values.additionalStopId);
            body.additionalStopOnTheWayDescription = values.additionalStopOnTheWayDescription;
          }

          if (extraOptions.length > 0) body.extraOptions = extraOptions;
        } else if (travelType === "hourly") {
          endpoint = `/api/v1/users/bookings/mine/hourly/${bookingData.bookId}`;
          body = {
            pickupPhysicalAddress: values.pickupPhysicalAddress,
            pickupLongitude: Number(values.pickupLongitude),
            pickupLatitude: Number(values.pickupLatitude),
            dropoffPhysicalAddress: values.dropoffPhysicalAddress,
            dropoffLongitude: Number(values.dropoffLongitude),
            dropoffLatitude: Number(values.dropoffLatitude),
            selectedHours: Number(values.hour),
            occasion: values.occation,
            numberOfPassengers: Number(values.numberOfPassengers),
            numberOfSuitcases: Number(values.numberOfSuitcases),
            pickupDateTime: formatPatchDateTime(values, bookingData?.pickupDateTime),
            specialInstructions: values.instruction,
            bookingFor: values.bookingFor,
            passengerFullName: values.passengerFullName,
            passengerCellPhone: values.passengerCellPhone,
            passengerEmail: values.email,
            carId: Number(values.vehicle),
            gratuityId: Number(values.gratuityId),
          };
        } else {
          throw new Error("Invalid booking type");
        }

        await BACKEND_API.patch(endpoint, body, authHeader());
        
        navigate('/user/my-order', { 
          state: { 
            updateSuccess: true,
            message: 'Booking updated successfully!' 
          }
        });
      } catch (error) {
        setError(error.response?.data?.message || 'Update failed');
      } finally {
        setLoading(false);
      }
    },
  });

  const fetchBookingDetails = async (bookingType, bookingId) => {
    try {
      setLoading(true);
      setError(null);
      setTravelRouteId(null);
      let endpoint;
      switch (bookingType.toLowerCase()) {
        case "airport":
          endpoint = `/api/v1/airport-books/${bookingId}`;
          break;
        case "hourly":
          endpoint = `/api/v1/hourly-charter-books/${bookingId}`;
          break;
        case "point to point":
          endpoint = `/api/v1/point-to-point-books/${bookingId}`;
          break;
        default:
          throw new Error("Invalid booking type");
      }

      const response = await BACKEND_API.get(endpoint, authHeader());
      const d = response.data;

      const canonicalId =
        d.airportBookId ??
        d.pointToPointBookId ??
        d.hourlyCharterBookId ??
        bookingId;

      const merged = {
        ...d,
        travelType: bookingType,
        bookId: String(canonicalId),
        airportLocationAddress:
          d.airportLocationAddress ??
          d.Airport?.airportName ??
          d.Airport?.name ??
          "",
        airportLocationLatitude:
          d.airportLocationLatitude ??
          d.Airport?.latitude ??
          d.Airport?.airportAddressLatitude ??
          "",
        airportLocationLongitude:
          d.airportLocationLongitude ??
          d.Airport?.longitude ??
          d.Airport?.airportAddressLongitude ??
          "",
        hotel: d.accommodationAddress || d.hotel || "",
      };

      const mapped = mapApiBookingToFormik(bookingType, merged);
      const resolvedCarId = resolveCarIdFromApi(merged);

      await dispatch(getAllCars()).unwrap();
      const carsList = store.getState().carReducer.cars || [];
      const selectedCarId = resolvedCarId || mapped.vehicle;
      dispatch(
        updateCars(
          carsList.map((car) => ({
            ...car,
            isSelected: String(car.carId) === String(selectedCarId),
          }))
        )
      );

      await dispatch(getExtraOptions()).unwrap();
      const catalog = store.getState().extraOptionReducer.extraOptions || [];
      const chosen = mapped.extraOptions || [];
      dispatch(
        updateExtraOption(
          catalog.map((opt) => {
            const row = chosen.find(
              (c) => Number(c.extraOptionId) === Number(opt.extraOptionId)
            );
            if (row && Number(row.quantity) > 0) {
              return {
                ...opt,
                isSelected: true,
                itemQuantity: Number(row.quantity),
              };
            }
            return { ...opt, isSelected: false, itemQuantity: 0 };
          })
        )
      );

      setTravelRouteId(travelTypeToRouteId(bookingType));
      setBookingData(merged);

      formik.resetForm({
        values: {
          ...formik.initialValues,
          ...mapped,
          vehicle:
            resolvedCarId !== "" && resolvedCarId != null
              ? resolvedCarId
              : mapped.vehicle !== "" && mapped.vehicle != null
                ? mapped.vehicle
                : "",
          originalCarIdFromBooking:
            resolvedCarId !== "" && resolvedCarId != null
              ? resolvedCarId
              : mapped.vehicle !== "" && mapped.vehicle != null
                ? mapped.vehicle
                : null,
          cardDetails: {
            ...formik.initialValues.cardDetails,
            ...(mapped.cardDetails || {}),
          },
        },
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch booking details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!location.state?.bookingData) {
      navigate('/user/my-order');
      return;
    }
    const { bookingData } = location.state;
    const bookingId = bookingData.bookId;
    const travelType = bookingData.travelType;

    // Reset location checkers when component mounts
    setLocationChecker({
      isUnsupportedLocation: false,
      errorMessage: "",
    });
    setAccomAddrChecker({
      isUnsupportedLocation: false,
      errorMessage: "",
    });
    setAirportLocChecker({
      isUnsupportedLocation: false,
      errorMessage: "",
    });

    fetchBookingDetails(travelType, bookingId);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: re-run when `location` (state) changes
  }, [location]);

  const steps = ['Ride Details', 'Vehicle Selection', 'Trip Details', 'Contact Details'];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step) => {
    if (!bookingData) return null;

    switch (step) {
      case 0:
        return (
          <RideDetailForm
            formik={formik}
            handleChangeTripType={() => {}}
            selectedTripType={travelRouteId}
            locationChecker={locationChecker}
            setLocationCkecker={setLocationChecker}
            accomAddrChecker={accomAddrChecker}
            setAccomAddrChecker={setAccomAddrChecker}
            airportLocChecker={airportLocChecker}
            setAirportLocChecker={setAirportLocChecker}
            travelRouteId={travelRouteId}
            disableServiceTypeSwitch
          />
        );
      case 1:
        return (
          <VehicleForm
            formik={formik}
            travelRouteId={travelRouteId}
            updateBookingMode
            hour={formik.values.hour}
            distanceInMiles={formik.values.distanceInMiles}
            rideSummaryData={{
              tripType: formik.values.tripType,
              pickupPhysicalAddress: formik.values.pickupPhysicalAddress,
              dropoffPhysicalAddress: formik.values.dropoffPhysicalAddress,
              hour: formik.values.hour,
              airportLocationAddress: formik.values.airportLocationAddress,
              hotel: formik.values.hotel,
            }}
          />
        );
      case 2:
        return (
          <TripDetailForm
            formik={formik}
            travelRouteId={travelRouteId}
            vehicleSummaryData={[]}
            rideSummaryData={{
              tripType: formik.values.tripType,
              pickupPhysicalAddress: formik.values.pickupPhysicalAddress,
              dropoffPhysicalAddress: formik.values.dropoffPhysicalAddress,
              hour: formik.values.hour,
              airportLocationAddress: formik.values.airportLocationAddress,
              hotel: formik.values.hotel,
            }}
          />
        );
      case 3:
        return (
          <ContactDetailForm
            formik={formik}
            travelRouteId={travelRouteId}
            skipAutoContactFill
            hidePaymentSection
            vehicleSummaryData={[]}
            rideSummaryData={{
              tripType: formik.values.tripType,
              pickupPhysicalAddress: formik.values.pickupPhysicalAddress,
              dropoffPhysicalAddress: formik.values.dropoffPhysicalAddress,
              hour: formik.values.hour,
              airportLocationAddress: formik.values.airportLocationAddress,
              hotel: formik.values.hotel,
            }}
            tripSummaryData={[]}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <LoadingWrapper>
        <CircularProgress size={40} sx={{ color: '#03930A' }} />
        <Typography color="text.secondary">
          Loading booking details...
        </Typography>
      </LoadingWrapper>
    );
  }

  if (error) {
    return (
      <UpdateContainer maxWidth="xl">
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/user/my-order')}>
              Return to Orders
            </Button>
          }
        >
          {error}
        </Alert>
      </UpdateContainer>
    );
  }

  if (!bookingData) {
    return null;
  }

  return (
    <UpdateContainer >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <StyledPaper elevation={0}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              color="#03930A"
              fontWeight="600"
            >
              Update {bookingData?.travelType} Booking
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Booking ID: {bookingData?.confirmationNumber}
            </Typography>
          </StyledPaper>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mt: 4 }}>
            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
              {activeStep > 0 && (
                <Button 
                  onClick={handleBack} 
                  variant="outlined"
                  disabled={loading}
                >
                  Back
                </Button>
              )}
              {activeStep === steps.length - 1 ? (
                <Button
                  onClick={formik.handleSubmit}
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: '#03930A',
                    '&:hover': { bgcolor: '#027508' },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Update Booking'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: '#03930A',
                    '&:hover': { bgcolor: '#027508' },
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </motion.div>
      </AnimatePresence>
    </UpdateContainer>
  );
}

export default UpdateBooking; 
