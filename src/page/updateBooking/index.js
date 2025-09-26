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
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { remote_host } from '../../globalVariable';
import { authHeader } from '../../util/authUtil';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Import your existing components
import RideDetailForm from '../homePage/components/rideDetailForm';
import VehicleForm from '../homePage/components/chooseVehicleForm';
import TripDetailForm from '../homePage/components/tripDetail';
import ContactDetailForm from '../homePage/components/contactDetailForm';
import { updateBooking } from '../../store/actions/bookActions';

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
      airPortId: '',
      airportName: '',
      airportAddressLatitude: '',
      airportAddressLongitude: '',
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
    },
    validationSchema: Yup.object({
      // Add your validation schema here
      vehicle: Yup.string().required('Vehicle selection is required'),
      numberOfPassengers: Yup.number().required('Number of passengers is required'),
      // ... add other validations as needed
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        let endpoint;
        switch (bookingData.travelType.toLowerCase()) {
          case 'airport':
            endpoint = `${remote_host}/api/v1/airport-books/${bookingData.bookId}`;
            break;
          case 'hourly':
            endpoint = `${remote_host}/api/v1/hourly-charter-books/${bookingData.bookId}`;
            break;
          case 'point to point':
            endpoint = `${remote_host}/api/v1/point-to-point-books/${bookingData.bookId}`;
            break;
          default:
            throw new Error('Invalid booking type');
        }

        await axios.put(endpoint, values, authHeader());
        
        navigate('/my-order', { 
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
      let endpoint;
      switch (bookingType.toLowerCase()) {
        case 'airport':
          endpoint = `${remote_host}/api/v1/airport-books/${bookingId}`;
          break;
        case 'hourly':
          endpoint = `${remote_host}/api/v1/hourly-charter-books/${bookingId}`;
          break;
        case 'point to point':
          endpoint = `${remote_host}/api/v1/point-to-point-books/${bookingId}`;
          break;
        default:
          throw new Error('Invalid booking type');
      }

      const response = await axios.get(endpoint, authHeader());

      const detailedBookingData = {
        ...response.data,
        travelType: bookingType,
      };


      
      setBookingData(detailedBookingData);
      // Update formik values with the fetched data
      formik.setValues({
        ...formik.values,
        ...detailedBookingData,
        vehicle: detailedBookingData.carId,
        vehicleName: detailedBookingData.Car?.name,
        
        // Map other fields as needed
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!location.state?.bookingData) {
      navigate('/orders');
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

    fetchBookingDetails(travelType, bookingId);
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
            locationChecker={locationChecker}
            setLocationChecker={setLocationChecker}
            accomAddrChecker={accomAddrChecker}
            setAccomAddrChecker={setAccomAddrChecker}
          />
        );
      case 1:
        return (
          <VehicleForm 
            formik={formik}
            rideSummaryData={{
              tripType: formik.values.tripType,
              pickupPhysicalAddress: formik.values.pickupPhysicalAddress,
              dropoffPhysicalAddress: formik.values.dropoffPhysicalAddress,
              hour: formik.values.hour,
              airPortId: formik.values.airPortId,
              hotel: formik.values.hotel,
            }}
          />
        );
      case 2:
        return (
          <TripDetailForm 
            formik={formik}
            vehicleSummaryData={[]}
            rideSummaryData={{
              tripType: formik.values.tripType,
              pickupPhysicalAddress: formik.values.pickupPhysicalAddress,
              dropoffPhysicalAddress: formik.values.dropoffPhysicalAddress,
              hour: formik.values.hour,
              airPortId: formik.values.airPortId,
              hotel: formik.values.hotel,
            }}
          />
        );
      case 3:
        return (
          <ContactDetailForm 
            formik={formik}
            vehicleSummaryData={[]}
            rideSummaryData={{
              tripType: formik.values.tripType,
              pickupPhysicalAddress: formik.values.pickupPhysicalAddress,
              dropoffPhysicalAddress: formik.values.dropoffPhysicalAddress,
              hour: formik.values.hour,
              airPortId: formik.values.airPortId,
              hotel: formik.values.hotel,
            }}
            tripSummaryData={[]}
          />
        );
      default:
        return null;
    }
  };

  const handleChangeTripType = (event) => {
    const travelType = event.target.value;
    formik.setFieldValue('travelType', travelType);
    // Reset location checkers when travel type changes
    setLocationChecker({
      isUnsupportedLocation: false,
      errorMessage: "",
    });
    setAccomAddrChecker({
      isUnsupportedLocation: false,
      errorMessage: "",
    });
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
            <Button color="inherit" size="small" onClick={() => navigate('/my-order')}>
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
