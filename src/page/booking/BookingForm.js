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
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { format, parseISO } from 'date-fns';

// Import components
import RideDetailForm from '../homePage/components/rideDetailForm';
import VehicleForm from '../homePage/components/chooseVehicleForm';
import TripDetailForm from '../homePage/components/tripDetail';
import ContactDetailForm from '../homePage/components/contactDetailForm';

const FormContainer = styled(Container)(({ theme }) => ({
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

function BookingForm({ isEditing = false, initialData = null, onSubmit }) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Location checkers for address validation
  const [locationChecker, setLocationChecker] = useState({
    isUnsupportedLocation: false,
    errorMessage: "",
  });

  const [accomAddrChecker, setAccomAddrChecker] = useState({
    isUnsupportedLocation: false,
    errorMessage: "",
  });

  // Helper function to format dates
  const formatDateTime = (dateString) => {
    if (!dateString) return { date: null, time: null };
    try {
      const date = new Date(dateString);
      return {
        date,
        time: date,
        formatted: {
          date: format(date, 'yyyy-MM-dd'),
          time: format(date, 'HH:mm')
        }
      };
    } catch (error) {
      console.error('Date parsing error:', error);
      return { date: null, time: null };
    }
  };

  // Initialize formik with proper values
  const formik = useFormik({
    initialValues: {
      // Default values for new booking
      travelType: '1', // Default to airport service
      tripType: '',
      vehicle: '',
      vehicleName: '',
      vehicleFee: 0,
      numberOfPassengers: 1,
      numberOfSuitcases: 0,
      airPortId: '',
      airportName: '',
      airportAddressLatitude: '',
      airportAddressLongitude: '',
      accommodationAddress: '',
      accommodationLatitude: '',
      accommodationLongitude: '',
      pickupPhysicalAddress: '',
      dropoffPhysicalAddress: '',
      pickupLatitude: '',
      pickupLongitude: '',
      dropoffLatitude: '',
      dropoffLongitude: '',
      distanceInMiles: 0,
      duration: '',
      hour: 5,
      pickupDate: null,
      pickupTime: null,
      returnPickupDate: null,
      returnPickupTime: null,
      airline: '',
      arrivalFlightNumber: '',
      returnAirline: '',
      returnFlightNumber: '',
      instruction: '',
      extraOptions: [],
      passengerFullName: '',
      passengerCellPhone: '',
      email: '',
      // ... other default values
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      // Add validation rules
      tripType: Yup.string().required('Trip type is required'),
      numberOfPassengers: Yup.number()
        .required('Number of passengers is required')
        .min(1, 'At least 1 passenger is required'),
      // ... other validations
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        await onSubmit(values);
        navigate('/bookings', { 
          state: { 
            success: true,
            message: `Booking ${isEditing ? 'updated' : 'created'} successfully!` 
          }
        });
      } catch (error) {
        setError(error.message || `Failed to ${isEditing ? 'update' : 'create'} booking`);
      } finally {
        setLoading(false);
      }
    },
  });

  // Update form values when editing
  useEffect(() => {
    if (isEditing && initialData) {
      const pickupDT = formatDateTime(initialData.pickupDateTime);
      const returnDT = formatDateTime(initialData.returnPickupDateTime);

      formik.setValues({
        ...formik.values,
        // Map initial data to form fields
        travelType: initialData.travelType === 'airport' ? '1' : 
                   initialData.travelType === 'point to point' ? '2' : '3',
        tripType: initialData.tripType,
        vehicle: initialData.Car?.carId,
        vehicleName: initialData.Car?.carName,
        vehicleFee: parseFloat(initialData.Car?.pricePerMile || 0),
        numberOfPassengers: initialData.numberOfPassengers,
        numberOfSuitcases: initialData.numberOfSuitcases,
        airPortId: initialData.Airport?.airportId,
        airportName: initialData.Airport?.airportName,
        airportAddressLatitude: initialData.Airport?.latitude,
        airportAddressLongitude: initialData.Airport?.longitude,
        accommodationAddress: initialData.accommodationAddress,
        accommodationLatitude: initialData.accommodationLatitude,
        accommodationLongitude: initialData.accommodationLongitude,
        pickupDate: pickupDT.date,
        pickupTime: pickupDT.time,
        returnPickupDate: returnDT.date,
        returnPickupTime: returnDT.time,
        airline: initialData.airline,
        arrivalFlightNumber: initialData.arrivalFlightNumber,
        returnAirline: initialData.returnAirline,
        returnFlightNumber: initialData.returnFlightNumber,
        instruction: initialData.specialInstructions,
        extraOptions: initialData.ExtraOptions?.map(option => ({
          id: option.extraOptionId,
          quantity: option.AirportBookExtraOption.quantity
        })) || [],
        passengerFullName: initialData.passengerFullName,
        passengerCellPhone: initialData.passengerCellPhone,
        email: initialData.passengerEmail,
        // ... map other fields
      });
    }
  }, [isEditing, initialData]);

  const handleChangeTripType = (event) => {
    const travelType = event.target.value;
    formik.setFieldValue('travelType', travelType);
    formik.setFieldValue('tripType', '');
    // Reset location checkers
    setLocationChecker({ isUnsupportedLocation: false, errorMessage: "" });
    setAccomAddrChecker({ isUnsupportedLocation: false, errorMessage: "" });
  };

  const steps = ['Ride Details', 'Vehicle Selection', 'Trip Details', 'Contact Details'];

  const renderStepContent = (step) => {
    const commonProps = {
      formik,
      locationChecker,
      setLocationChecker,
      accomAddrChecker,
      setAccomAddrChecker,
      isEditing,
    };

    switch (step) {
      case 0:
        return (
          <RideDetailForm 
            {...commonProps}
            handleChangeTripType={handleChangeTripType}
            selectedTripType={formik.values.travelType}
          />
        );
      case 1:
        return (
          <VehicleForm 
            {...commonProps}
            rideSummaryData={{
              tripType: formik.values.tripType,
              pickupPhysicalAddress: formik.values.pickupPhysicalAddress,
              dropoffPhysicalAddress: formik.values.dropoffPhysicalAddress,
              hour: formik.values.hour,
              airPortId: formik.values.airPortId,
              hotel: formik.values.accommodationAddress,
              distanceInMiles: formik.values.distanceInMiles,
              duration: formik.values.duration,
            }}
            selectedVehicle={isEditing ? {
              id: formik.values.vehicle,
              name: formik.values.vehicleName,
              imageUrl: initialData?.Car?.carImageUrl,
            } : null}
          />
        );
      // ... similar updates for other steps
    }
  };

  // ... rest of the component (navigation, UI rendering)
}

export default BookingForm; 