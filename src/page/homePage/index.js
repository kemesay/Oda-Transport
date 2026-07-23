import React, { useState, useEffect } from "react";
import {
    Box,
    Grid,
    Stack,
    Button,
    Snackbar,
    Alert,
    CircularProgress,
} from "@mui/material";
import Stepper from "./components/stepper/index";
import RideDetailForm from "./components/rideDetailForm";
import ChooseVehicleForm from "./components/chooseVehicleForm";
import ContactDetailForm from "./components/contactDetailForm";
import TripDetail from "./components/tripDetail";
import { useDispatch, useSelector } from "react-redux";
import Summary from "./components/summary";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
import { book } from "../../store/actions/bookActions";
import Success from "./components/Success";
import { getAllCars } from "../../store/actions/carAction";
import { getExtraOptions } from "../../store/actions/extraOptions";
import GuestUser from "./components/GuestUser";
import axios from "axios";
import { addMinimumInitialFee, updateTotalFee } from "../../store/reducers/bookReducers";
import { BACKEND_API } from "../../store/utils/API";
import { calculateServiceFee } from "../../utils/bookingFeeCalculator";
import { PAYMENT_METHODS } from "../../constants/paymentMethods";
import SquarePaymentStatus from "../../components/SquarePaymentStatus";
import {
    clearSquareCheckoutNonce,
    hasVerifiedSquarePayment,
    persistSquareCheckoutNonce,
    resolveSquarePaymentPayload,
} from "../../services/squareCheckoutSession";
import { assertSquarePayloadForBooking } from "../../utils/squareBookingPayload";

function feeChangedSinceTokenize(tokenizedAtFee, currentFee) {
    if (tokenizedAtFee == null || tokenizedAtFee === "") return false;
    return Math.abs(Number(tokenizedAtFee) - Number(currentFee)) > 0.01;
}

async function verifySquareCardForCheckout(formikContact, totalFee) {
    const values = formikContact.values;
    if (values.paymentMethod !== PAYMENT_METHODS.SQUARE_NEW) {
        return true;
    }

    const needsToken =
        !hasVerifiedSquarePayment(values) ||
        feeChangedSinceTokenize(values.squareTokenizedAtFee, totalFee);

    if (!needsToken) {
        const resolved = resolveSquarePaymentPayload(values);
        if (resolved && !values.square?.sourceId) {
            await formikContact.setFieldValue("square", resolved);
        }
        return true;
    }

    if (typeof values.squareTokenize !== "function") {
        throw new Error(
            "Payment form is not ready. Go back to Contact, wait for the card field to load, then tap Summary again."
        );
    }

    const square = await values.squareTokenize();
    persistSquareCheckoutNonce(square, {
        amount: totalFee,
        paymentMethod: PAYMENT_METHODS.SQUARE_NEW,
    });
    await formikContact.setFieldValue("square", square);
    await formikContact.setFieldValue("squareTokenizedAtFee", totalFee);
    return true;
}

function Index() {
    const [activeStep, setActiveStep] = useState(0);
    const [selectedTripType, setSelectedTripType] = React.useState();
    const [entryAsGuestOptionPage, setEntryAsGuestOptionPage] = useState(false);
    const [locationChecker, setLocationCkecker] = useState({
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

    const [tokenizeError, setTokenizeError] = useState(null);
    const [verifyingCard, setVerifyingCard] = useState(false);
    const advanceFromContactRef = React.useRef(null);

    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector(
        (state) => state.authReducer
    );
    const { fee } = useSelector((state) => state.bookReducer);
    const phoneRegex = /^[0-9]{10,15}$/;
    const fullNameRegex = /^[a-zA-Z]+(?: [a-zA-Z]+)$/;

    const location = useLocation();
    const navigate = useNavigate();
    const { isBookSuccess, errorMessage, isError, isBookPending, lastBookingResult } = useSelector(
        (state) => state.bookReducer
    );
    const { totalFee } = useSelector((state) => state.bookReducer);
    var travelType = location.pathname.split("/").pop();
    const [open, setOpen] = useState(false);

    const [rideInfoValidationSchemaObj, setrideInfoValidationSchemaObj] =
        useState({
            tripType: yup.string("Trip Type").required("Trip type is required!"),
            pickupPhysicalAddress: yup
                .string("Pick up address")
                .required("Pick up address is required!"),
            dropoffPhysicalAddress: yup
                .string("Dropoff address")
                .required("Dropoff address is required!"),
        });

    const rideInfoValidationSchema = yup
        .object()
        .shape(rideInfoValidationSchemaObj);

    const rideValidationSchema = yup.object({
        vehicle: yup
            .string("vehicle is string")
            .required("Select at least one vehicle to proceed"),
        numberOfSuitcases: yup
            .number("suitcase is number")
            .default(0)
            .required("Select at least one suitcases"),
        numberOfPassengers: yup
            .number("passengers is number")
            .default(1)
            .required("Select at least one passengers"),
    });

    const formikRideInfo = useFormik({
        initialValues: {
            tripType: "One-Way",
            pickupPhysicalAddress: "",
            pickupLongitude: 0,
            pickupLatitude: 0,
            dropoffPhysicalAddress: "",
            dropoffLongitude: 0,
            dropoffLatitude: 0,
            distanceInMiles: 0,
            duration: null,
            hour: 4,
            billingMode: "PRE_BOOKED",
            airportLocationAddress: "",
            airportLocationLatitude: 0,
            airportLocationLongitude: 0,
            hotel: "",
            accommodationAddress: "",
            accommodationLongitude: 0,
            accommodationLatitude: 0,
            sidePicks: [],
        },
        validationSchema: rideInfoValidationSchema,
        onSubmit: (values) => {
            if (
                (travelType == "2" || travelType == "3") &&
                !locationChecker.isUnsupportedLocation
            ) {
                handleNext();
            } else if (
                travelType == "1" &&
                !accomAddrChecker.isUnsupportedLocation &&
                !airportLocChecker.isUnsupportedLocation
            ) {
                handleNext();
            }
        },
    });
    const isRoundTrip = () => {
        var tripType = formikRideInfo.values.tripType;
        return (
            tripType == "Round-Trip" ||
            tripType == "Ride to the airport(round trip)" ||
            tripType == "Ride from the airport(round trip)"
        );
    };

    const tripDetailValidationSchema = yup.object({
        isHourly: yup.boolean().default(location.pathname.split("/").pop() == 3),
        isAirport: yup.boolean().default(location.pathname.split("/").pop() == 1),
        isRoundTripAirport: yup.boolean().default(location.pathname.split("/").pop() == 1 && isRoundTrip()),

        isRoundTrip: yup.boolean().default(isRoundTrip()),
        additionalStopId: yup.number().default(0),
        additionalStopOnTheWayDescription: yup.string().when("additionalStopId",
            {
                is: (value) => value > 0,
                then: () => yup.string().required("description required"),
                otherwise: () => yup.number().default(0)
            }
        ),
        formattedPickupDate: yup
            .string("should be string value")
            .required("Pickup date is required"),
        formattedPickupTime: yup
            .string("should be string value")
            .required("Pickup time is required"),
        formattedReturnPickupDate: yup.string().when("isRoundTrip", {
            is: true,
            then: (schema) => schema.required("Return pickup date is required"),
            otherwise: (schema) => schema.nullable(true),
        }),
        formattedReturnPickupTime: yup.string().when("isRoundTrip", {
            is: true,
            then: (schema) => schema.required("Return pickup time is required"),
            otherwise: (schema) => schema.nullable(true),
        }),
        instruction: yup
            .string("special instruction shoud be string")
            .nullable(true),

        pickupPreference: yup.number().required("preference require"),
        // .required("special instruction is required"),
        occation: yup.string().when("isHourly", {
            is: true,
            then: (schema) => schema.required("Occation is required"),
            otherwise: (schema) => schema,
        }),
        returnFlightNumber: yup.string().when("isRoundTripAirport", {
            is: true,
            then: (schema) => schema.required("flight number is required"),
            otherwise: (schema) => schema,
        }),

        returnAirline: yup.string().when("isRoundTripAirport", {
            is: true,
            then: (schema) => schema.required("airline is required"),
            otherwise: (schema) => schema,
        }),
    });

    const formikChooseVehicle = useFormik({
        initialValues: {
            vehicle: null,
            vehicleFee: 0,
            prevCarMinimumStartFee: 0,
            vehicleName: "",
            numberOfSuitcases: 0,
            numberOfPassengers: 1,
            extraOptions: [],
            pricePerMile: 0,
            minimumStartFee: 0,
            extraOptionFee: 0
        },
        validationSchema: rideValidationSchema,
        onSubmit: (values) => {
            handleNext();
        },
    });

    const formikTripDetail = useFormik({
        initialValues: {
            tripType: location.pathname.split("/").pop() == 3,
            formattedPickupDate: null,
            pickupDate: null,
            formattedPickupTime: null,
            pickupTime: null,
            formattedReturnPickupDate: null,
            returnPickupDate: null,
            formattedReturnPickupTime: null,
            returnPickupTime: null,
            additionalStopOnTheWayPrice: 0,
            additionalStopId: 0,
            additionalStopOnTheWayDescription: "",
            instruction: "",
            arrivalFlightNumber: "",
            airline: "",
            returnFlightNumber: "",
            returnAirline: "",
            occation: "",
            pickupPreference: 1,
            prevPickupPrefValue: 0,
            pickupPreferenceFee: 0,
            prevAddtionalStopOnTheWayFee: 0,
            stopOnWayFee: 0,

        },
        validationSchema: tripDetailValidationSchema,
        onSubmit: (value) => {
            handleNext();
            if (!isAuthenticated) {
                setEntryAsGuestOptionPage(true);
            }
        },
    });
    const contactValidationSchema = yup.object().shape({
        firstName: yup.string("should be string") /* .required() */,
        lastName: yup.string("should be string") /* .required() */,
        email: yup.string().email("invalid email").required("email required"),
        /* .required("Email required") */
        // confirmEmail: yup
        // .string()
        // .oneOf([yup.ref("email"), null], "Emails must match"),
        cellPhone: yup.string(),
        /* .matches(phoneRegex, "Invalid phone number format") */
        passengerFullName:
            yup.string()
                .matches(fullNameRegex, "invalid full name")
                .required("full name required"),
        // passengerLastName: yup.string(),
        passengerCellPhone: yup
            .string()
            .matches(phoneRegex, "Invalid phone number format")
            .required("phone num. required"),
        isGuestBooking: yup.boolean(),

        paymentMethod: yup.string().required('Payment method is required'),

        paymentDetailId: yup.mixed().when('paymentMethod', {
            is: PAYMENT_METHODS.SQUARE_SAVED,
            then: (schema) => schema.required('Please select a saved card'),
            otherwise: (schema) => schema.nullable(),
        }),
        squareCardId: yup.string().nullable(),
        cardDetails: yup.object().when('paymentMethod', {
            is: PAYMENT_METHODS.SQUARE_NEW,
            then: (schema) => schema.shape({
                cardOwnerName: yup.string().required('Cardholder name is required'),
                zipCode: yup.string().required('Zip code is required'),
            }),
            otherwise: (schema) => schema.nullable(),
        }),
        square: yup.object().nullable(),
    });
    const formikContact = useFormik({
        initialValues: {
            firstName: "",
            lastName: "",
            email: "",
            confirmEmail: "",
            paymentMethod: "",
            paymentDetailId: undefined,
            squareCardId: undefined,
            cardDetails: {
                cardOwnerName: "",
                zipCode: "",
            },
            isValidCardInfo: false,
            square: undefined,
            squareTokenize: undefined,
            squareTokenizedAtFee: undefined,
            cellPhone: "",
            bookingFor: "Myself",
            passengerFullName: "",
            passengerCellPhone: "",
            isGuestBooking: false,
            entryOptionSelected: false,
            gratuityId: 1,
            gratuityPercentage: 0,
            gratuityFee: 0,
            prevGratuityFee: 0,
            feeBeforeGratuity: 0,
        },
        validationSchema: contactValidationSchema,
        validateOnChange: false,
        validateOnBlur: true,
        onSubmit: () => {
            advanceFromContactRef.current?.();
        },
    });
    const formikSummary = useFormik({
        initialValues: {
            concent: false,
        },
        validationSchema: yup.object({
            concent: yup.boolean().oneOf([true], "You should concent to the summary"),
        }),
        onSubmit: (value) => {
            handleFinish();
        },
    });
    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        if (activeStep === 4) {
            setTokenizeError(null);
            formikContact.setFieldValue("square", undefined);
            formikContact.setFieldValue("isValidCardInfo", false);
            formikContact.setFieldValue("squareTokenizedAtFee", undefined);
            clearSquareCheckoutNonce();
        }
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleChangeTripType = (event) => {
        // formikTripDetail.resetForm();
        const selectedType = event.target.value;
        navigate(`/home/${selectedType}`);
        setSelectedTripType(selectedType);
    };

    function setRideDetailFormikData() {
        if (travelType == 2) {
            setrideInfoValidationSchemaObj({
                isUnsupportedLocation: false,
                isUnsupportedDropoffAddr: false,
                isUnsupportedPickupAddr: false,
                tripType: yup.string("Trip Type").required("Trip type is required!"),
                pickupPhysicalAddress: yup
                    .string("Pick up address")
                    .required("Pick up address is required!"),
        /*  .when("isUnsupportedLocation", {
            is: true,
            then: yup
              .string("")
              .required("not providing service at the selected address"),
            otherwise: yup.string(""),
          }) */ dropoffPhysicalAddress: yup
                    .string("Dropoff address")
                    .required("Dropoff address is required!"),
                /* .when("isUnsupportedLocation", {
                    is: true,
                    then: (schema) =>
                      schema.required(
                        yup.ref("isUnsupportedLocation")
                          ? "not providing service at the selected address"
                          : "Dropoff address is required!"
                      ),
                    otherwise: (schema) => schema,
                  }) */
            });
        } else if (travelType == 1) {
            setrideInfoValidationSchemaObj({
                tripType: yup.string("Trip Type").required("Trip type is required!"),
                airportLocationAddress: yup
                    .string()
                    .required("Airport or terminal location is required"),
                airportLocationLatitude: yup
                    .number()
                    .notOneOf([0], "Select airport location from search suggestions"),
                airportLocationLongitude: yup
                    .number()
                    .notOneOf([0], "Select airport location from search suggestions"),
                accommodationAddress: yup
                    .string()
                    .required("Hotel / residence address is required"),
                hotel: yup.string().required("Hotel / residence is required"),
                accommodationLatitude: yup
                    .number()
                    .notOneOf([0], "Select accommodation from search suggestions"),
                accommodationLongitude: yup
                    .number()
                    .notOneOf([0], "Select accommodation from search suggestions"),
            });
        } else if (travelType == 3) {
            setrideInfoValidationSchemaObj({
                isUnsupportedLocation: false,
                pickupPhysicalAddress: yup
                    .string("Pick up address")
                    .required("Pick up address is required!"),
        /*  .when("isUnsupportedLocation", {
            is: true,
            then: (schema) =>
              schema.required("not providing service at the selected address"),
            otherwise: (schema) => schema,
          }) */ dropoffPhysicalAddress: yup
                    .string("Dropoff address")
                    .required("Dropoff address is required!"),
        /* .when("isUnsupportedLocation", {
            is: true,
            then: (schema) =>
              schema.required(
                yup.ref("isUnsupportedLocation")
                  ? "not providing service at the selected address"
                  : "Dropoff address is required!"
              ),
            otherwise: (schema) => schema,
          }) */ hour: yup
                    .number("Hour to travel")
                    .min(4, "Minimum booking is 4 hours")
                    .required("Hour is required!"),
            });
        }
    }


    // const handleFinish = () => {



    //     const contactValues = formikContact.values;

    //     // Create a deep copy of contactValues and remove isPrimary from cardDetails
    //     const cleanedContact = {
    //         ...contactValues,
    //         cardDetails: {
    //             ...contactValues.cardDetails,
    //         },
    //     };
    //     delete cleanedContact.cardDetails.isPrimary;


    //     // Prepare the payment data based on selected method
    //     let paymentData = {};

    //     switch (contactValues.paymentMethod) {
    //         case PAYMENT_METHODS.PRIMARY:
    //             paymentData = {
    //                 paymentMethod: PAYMENT_METHODS.PRIMARY
    //             };
    //             break;
    //         case PAYMENT_METHODS.EXISTING:
    //             paymentData = {
    //                 paymentMethod: PAYMENT_METHODS.EXISTING,
    //                 paymentDetailId: contactValues.paymentDetailId
    //             };
    //             break;
    //         case PAYMENT_METHODS.NEW:
    //             paymentData = {
    //                 paymentMethod: PAYMENT_METHODS.NEW,
    //                 cardDetails: {
    //                     ...contactValues.cardDetails
    //                 }
    //             };
    //             break;
    //         default:
    //             break;
    //     }

    //     const values = {
    //         rideInfo: formikRideInfo.values,
    //         vehicle: formikChooseVehicle.values,
    //         tripDetail: formikTripDetail.values,
    //         contact: {
    //             ...cleanedContact,
    //             ...paymentData
    //         },
    //         travelType: location.pathname.split("/").pop(),
    //     };

    //     console.log("values11: ", values);
    //     dispatch(book(values));
    // };


    const handleFinish = async () => {
        setTokenizeError(null);

        let contact = { ...formikContact.values };

        if (contact.paymentMethod === PAYMENT_METHODS.SQUARE_NEW) {
            try {
                const needsReverify =
                    !hasVerifiedSquarePayment(contact) ||
                    feeChangedSinceTokenize(
                        contact.squareTokenizedAtFee,
                        totalFee
                    );
                if (needsReverify) {
                    await verifySquareCardForCheckout(formikContact, totalFee);
                }
                contact = { ...formikContact.values };
            } catch (err) {
                setTokenizeError(
                    err?.message ||
                        "Card verification failed. Go back to Contact and try again."
                );
                return;
            }

            const bookingError = assertSquarePayloadForBooking(contact);
            if (bookingError) {
                setTokenizeError(bookingError);
                return;
            }
        }

        const cleanedContact = { ...contact };
        delete cleanedContact.cardDetails;
        delete cleanedContact.squareTokenize;
        delete cleanedContact.isValidCardInfo;
        delete cleanedContact.squareTokenizedAtFee;

        if (contact.paymentMethod === PAYMENT_METHODS.SQUARE_NEW) {
            delete cleanedContact.paymentDetailId;
            delete cleanedContact.squareCardId;
            cleanedContact.paymentMethod = PAYMENT_METHODS.SQUARE_NEW;
            cleanedContact.square = resolveSquarePaymentPayload(contact);
        } else if (contact.paymentMethod === PAYMENT_METHODS.SQUARE_SAVED) {
            delete cleanedContact.square;
            cleanedContact.paymentMethod = PAYMENT_METHODS.SQUARE_SAVED;
            cleanedContact.paymentDetailId = contact.paymentDetailId;
            if (contact.squareCardId) {
                cleanedContact.squareCardId = contact.squareCardId;
            }
        }

        const values = {
            rideInfo: formikRideInfo.values,
            vehicle: formikChooseVehicle.values,
            tripDetail: formikTripDetail.values,
            contact: cleanedContact,
            travelType: location.pathname.split("/").pop(),
        };

        dispatch(book(values));
    };

    const advanceFromContactStep = async () => {
        formikContact.setTouched({
            passengerFullName: true,
            passengerCellPhone: true,
            email: true,
            paymentMethod: true,
            paymentDetailId: true,
            cardDetails: { cardOwnerName: true, zipCode: true },
        });

        const errors = await formikContact.validateForm();
        if (Object.keys(errors).length > 0) {
            return;
        }

        setTokenizeError(null);

        if (formikContact.values.paymentMethod === PAYMENT_METHODS.SQUARE_NEW) {
            setVerifyingCard(true);
            try {
                await verifySquareCardForCheckout(formikContact, totalFee);
            } catch (err) {
                setTokenizeError(
                    err?.message ||
                        "Could not verify your card. Check the fields and try again."
                );
                return;
            } finally {
                setVerifyingCard(false);
            }
        }

        handleNext();
    };
    advanceFromContactRef.current = advanceFromContactStep;

    const handleSubmit = () => {
        switch (activeStep) {
            case 0:
                formikRideInfo.handleSubmit();
                break;
            case 1:
                formikChooseVehicle.handleSubmit();
                break;
            case 2:
                formikTripDetail.setTouched({
                    formattedPickupDate: true,
                    formattedPickupTime: true,
                    formattedReturnPickupDate: true,
                    formattedReturnPickupTime: true,
                    pickupPreference: true,
                    occation: true,
                    returnFlightNumber: true,
                    returnAirline: true,
                    additionalStopOnTheWayDescription: true,
                });
                formikTripDetail.handleSubmit();
                break;
            case 3:
                advanceFromContactStep();
                break;
            case 4:
                formikSummary.handleSubmit();
                break;
            default:
                break;
        }
    };

    const getNextButtonLabel = () => {
        switch (activeStep) {
            case 0:
                return "CHOOSE VEHICLE";
            case 1:
                return "TRIP DETAIL";
            case 2:
                return "CONTACT DETAIL";
            case 3:
                return "SUMMARY";
            case 4:
                return "BOOK";
            default:
                break;
        }
    };

    const generateVehicleSummaryData = () => {
        const vehicle = formikChooseVehicle.values;
        const summaryDataTemp = [
            { label: "Suitcases", value: vehicle.numberOfSuitcases, isVisible: true },
            {
                label: "Passengers",
                value: vehicle.numberOfPassengers,
                isVisible: true,
            },
            { label: "Vehicle", value: vehicle.vehicleName, isVisible: true },
        ];
        var extraOptions = [];
        vehicle?.extraOptions?.map((option) => {
            extraOptions.push({
                label: option.name,
                value: option.quantity,
                isVisible: true,
            });
        });
        summaryDataTemp.push(...extraOptions);
        return summaryDataTemp;
    };

    const generateTripSummaryData = () => {
        const tripSummaryData = [
            {
                label: "Pickup date",
                value:
                    formikTripDetail.values.formattedPickupDate +
                    " " +
                    formikTripDetail.values.formattedPickupTime,
                isVisible: true,
            },
            {
                label: "Special instr.",
                value: formikTripDetail.values.instruction,
                isVisible: true,
            },
        ];

        return tripSummaryData;
    };
    const generateContactSummaryData = () => {
        const contactSummaryData = [
            {
                label: "Passenger Full Name",
                value: formikContact.values.passengerFullName,
                isVisible: true,
            },
            {
                label: "Phone num.",
                value: formikContact.values.passengerCellPhone,
                isVisible: true,
            },
        ];
        return contactSummaryData;
    };

    useEffect(() => {
        setRideDetailFormikData();
    }, [location]);

    useEffect(() => {
        if (isBookSuccess) {
            clearSquareCheckoutNonce();
            handleNext();
        }
        if (isError) setOpen((prev) => !prev);
    }, [isBookSuccess, errorMessage, isError]);
    // const addMinFee = async () => {
    //     try {
    //         await axios.get(`${remote_host}/api/v1/minimum-start-fee`).then((res) => {
    //             const minimumFee = parseFloat(res.data.fee);
    //             console.log("min fee: ", minimumFee);

    //             dispatch(addMinimumInitialFee(minimumFee));
    //         });
    //     } catch (error) {
    //         console.log("error: ", error);
    //     }
    // };

    const feeCalculator = () => {
        const { vehicleFee, minimumStartFee, extraOptionFee } =
            formikChooseVehicle.values;
        const { distanceInMiles, hour, tripType } = formikRideInfo.values;
        const { stopOnWayFee, pickupPreferenceFee } = formikTripDetail.values;
        const { gratuityFee, gratuityPercentage } = formikContact.values;

        dispatch(
            updateTotalFee(
                calculateServiceFee({
                    travelRouteId: travelType,
                    tripType,
                    vehicleFee,
                    minimumStartFee,
                    extraOptionFee,
                    distanceInMiles,
                    hour,
                    stopOnWayFee,
                    pickupPreferenceFee,
                    gratuityFee,
                    gratuityPercentage,
                })
            )
        );
    };

    useEffect(() => {
        feeCalculator()

    }, [formikContact,
        formikChooseVehicle,
        formikRideInfo,
        formikTripDetail])

    useEffect(() => {
        dispatch(getAllCars());
        dispatch(getExtraOptions());
        // addMinFee();
    }, []);

    return (
        <Box mt={5}>
            <Stepper step={activeStep} />
            <Grid container justifyContent={"center"} mt={5}>
                <Grid item xs={10}>
                    <Box>
                        {activeStep === 0 && (
                                    <RideDetailForm
                                        formik={formikRideInfo}
                                        handleChangeTripType={handleChangeTripType}
                                        locationChecker={locationChecker}
                                        setLocationCkecker={setLocationCkecker}
                                        accomAddrChecker={accomAddrChecker}
                                        setAccomAddrChecker={setAccomAddrChecker}
                                        airportLocChecker={airportLocChecker}
                                        setAirportLocChecker={setAirportLocChecker}
                                        selectedTripType={selectedTripType}
                                    />
                                )}
                                {activeStep === 1 && (
                                    <ChooseVehicleForm
                                        hour={formikRideInfo.values.hour}
                                        distanceInMiles={formikRideInfo.values.distanceInMiles}
                                        formik={formikChooseVehicle}
                                        rideSummaryData={formikRideInfo.values}
                                    />
                                )}
                                {activeStep === 2 && (
                                    <TripDetail
                                        formik={formikTripDetail}
                                        rideSummaryData={formikRideInfo.values}
                                        vehicleSummaryData={generateVehicleSummaryData()}
                                    />
                                )}
                                {activeStep === 3 &&
                                entryAsGuestOptionPage &&
                                !isAuthenticated &&
                                !formikContact.values.entryOptionSelected ? (
                                    <GuestUser
                                        setEntryAsGuestOptionPage={setEntryAsGuestOptionPage}
                                        formik={formikContact}
                                    />
                                ) : activeStep === 3 ? (
                                    <ContactDetailForm
                                        formik={formikContact}
                                        rideSummaryData={formikRideInfo.values}
                                        vehicleSummaryData={generateVehicleSummaryData()}
                                        tripSummaryData={generateTripSummaryData()}
                                        travelRouteId={travelType}
                                        feeParams={{
                                            vehicleFee: formikChooseVehicle.values.vehicleFee,
                                            minimumStartFee:
                                                formikChooseVehicle.values.minimumStartFee,
                                            extraOptionFee:
                                                formikChooseVehicle.values.extraOptionFee,
                                            distanceInMiles:
                                                formikRideInfo.values.distanceInMiles,
                                            hour: formikRideInfo.values.hour,
                                            tripType: formikRideInfo.values.tripType,
                                            stopOnWayFee:
                                                formikTripDetail.values.stopOnWayFee,
                                            pickupPreferenceFee:
                                                formikTripDetail.values.pickupPreferenceFee,
                                        }}
                                    />
                                ) : null}
                                {activeStep === 3 && tokenizeError && (
                                    <Alert severity="error" sx={{ mt: 2 }}>
                                        {tokenizeError}
                                    </Alert>
                                )}
                                {activeStep === 4 && (
                                    <>
                                        <Summary
                                            formik={formikSummary}
                                            rideSummaryData={formikRideInfo.values}
                                            vehicleSummaryData={generateVehicleSummaryData()}
                                            tripSummaryData={generateTripSummaryData()}
                                            contactSummaryData={generateContactSummaryData()}
                                        />
                                        {formikContact.values.paymentMethod ===
                                            PAYMENT_METHODS.SQUARE_NEW && (
                                            <SquarePaymentStatus
                                                secured={hasVerifiedSquarePayment(
                                                    formikContact.values
                                                )}
                                                cardholderName={
                                                    formikContact.values.cardDetails
                                                        ?.cardOwnerName
                                                }
                                                billingZip={
                                                    formikContact.values.cardDetails?.zipCode
                                                }
                                                feeMismatch={feeChangedSinceTokenize(
                                                    formikContact.values.squareTokenizedAtFee,
                                                    totalFee
                                                )}
                                                onEditPayment={handleBack}
                                            />
                                        )}
                                    </>
                                )}
                                {activeStep === 4 && tokenizeError && (
                                    <Alert severity="error" sx={{ mt: 2 }}>
                                        {tokenizeError}
                                    </Alert>
                                )}
                                {activeStep === 5 && (
                                    <Success bookingResult={lastBookingResult} />
                                )}
                            </Box>
                        </Grid>
                        {activeStep !== 5 && (
                            <Grid item xs={10} mt={3}>
                                <Stack
                                    direction={"row"}
                                    justifyContent={"space-between"}
                                    alignItems={"center"}
                                >
                                    <Button
                                        variant="outlined"
                                        onClick={handleBack}
                                        disabled={activeStep === 0}
                                        color="secondary"
                                    >
                                        BACK
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleSubmit}
                                        disabled={verifyingCard || isBookPending}
                                    >
                                        {verifyingCard || isBookPending ? (
                                            <CircularProgress size={25} sx={{ color: "#FFF" }} />
                                        ) : (
                                            getNextButtonLabel()
                                        )}
                                    </Button>
                                    {/* )} */}
                                </Stack>
                            </Grid>
                        )}
                    </Grid>

                    <Snackbar
                        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                        open={open}
                        onClose={() => setOpen((prev) => !prev)}
                        key={"bottom" + "left"}
                        autoHideDuration={3000}
                    >
                        <Alert
                            onClose={() => setOpen((prev) => !prev)}
                            severity="error"
                            variant="filled"
                            sx={{ width: "100%" }}
                        >
                            {errorMessage}
                        </Alert>
                    </Snackbar>
        </Box>
    );
}

export default Index;