import React, { useEffect, useState, useCallback, useRef } from "react";
import { Stack, Grid, FormControlLabel, Checkbox, Box, FormControl, RadioGroup, FormLabel } from "@mui/material";
import RSRadio from "../../../../components/RSRadio";
import "bootstrap/dist/css/bootstrap.min.css";
import RSTextField from "../../../../components/RSTextField";
import StepSummary from "../StepSummary";
import { BACKEND_API } from "../../../../store/utils/API";
import { authHeader } from "../../../../util/authUtil";
import { useDispatch, useSelector } from "react-redux";
import { adGratitudeFee } from "../../../../store/reducers/bookReducers";
import PaymentMethodSelector from '../paymentMethodSelector';
import {
  computeGratuityOnCarFare,
  getLegCarPrice,
} from "../../../../utils/bookingFeeCalculator";
import {
  normalizePaymentCardsResponse,
  isSquareReadyCard,
} from "../../../../utils/paymentCards";
import { PAYMENT_METHODS } from "../../../../constants/paymentMethods";
import { formatFullName } from "../../../../utils/nameUtil";

function Index({
  formik,
  vehicleSummaryData,
  rideSummaryData,
  tripSummaryData,
  skipAutoContactFill,
  hidePaymentSection,
  travelRouteId,
  feeParams = {},
}) {
  const [bookForPassenger, setBookForPassenger] = useState(
    formik.values.bookingFor == "SomeoneElse"
  );
  const [gratuities, setGratuity] = useState([]);
  const [userCards, setUserCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [cardsError, setCardsError] = useState(null);
  const { totalFee } = useSelector((state) => state.bookReducer);
  const dispatch = useDispatch();

  // Formik's returned bag is a new object on every render (it isn't
  // memoized), so we can't put `formik` in a useCallback/useEffect
  // dependency array without that effect re-firing on every keystroke.
  // Route reads through a ref so fetchUserPaymentCards always sees the
  // latest formik state without needing `formik` itself as a dependency.
  const formikRef = useRef(formik);
  useEffect(() => {
    formikRef.current = formik;
  }, [formik]);

  const { isAuthenticated } = useSelector((state) => state.authReducer);
  const authToken = isAuthenticated
    ? sessionStorage.getItem("access_token")
    : null;

  const tripType = rideSummaryData?.tripType ?? formik.values.tripType;
  const legCarPriceForTip = () =>
    getLegCarPrice(travelRouteId, {
      vehicleFee: feeParams.vehicleFee ?? formik.values.vehicleFee,
      minimumStartFee: feeParams.minimumStartFee ?? formik.values.minimumStartFee,
      distanceInMiles:
        feeParams.distanceInMiles ??
        formik.values.distanceInMiles ??
        rideSummaryData?.distanceInMiles,
      hour: feeParams.hour ?? formik.values.hour ?? rideSummaryData?.hour,
    });

  const tipDollarsForPercentage = (percentage) =>
    computeGratuityOnCarFare(legCarPriceForTip(), percentage, tripType);

  const fetchUserPaymentCards = useCallback(async () => {
    const currentFormik = formikRef.current;
    if (!isAuthenticated || !authToken) {
      setUserCards([]);
      setCardsError(null);
      if (!currentFormik.values.paymentMethod) {
        currentFormik.setFieldValue("paymentMethod", PAYMENT_METHODS.SQUARE_NEW);
      }
      return;
    }

    setCardsLoading(true);
    setCardsError(null);

    try {
      const response = await BACKEND_API.get(
        "/api/v1/users/payment-detail/paymentCards",
        authHeader()
      );
      const list = normalizePaymentCardsResponse(response.data);
      const squareCards = list.filter(isSquareReadyCard);
      setUserCards(squareCards);

      if (squareCards.length === 0 && !currentFormik.values.paymentMethod) {
        currentFormik.setFieldValue("paymentMethod", PAYMENT_METHODS.SQUARE_NEW);
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Could not load saved payment methods.";
      setCardsError(message);
      setUserCards([]);
      if (!currentFormik.values.paymentMethod) {
        currentFormik.setFieldValue("paymentMethod", PAYMENT_METHODS.SQUARE_NEW);
      }
    } finally {
      setCardsLoading(false);
    }
  }, [isAuthenticated, authToken]);

  const handleBookForPassenger = (e) => {
    setBookForPassenger(e.target.checked);
    formik.setFieldValue(
      "bookingFor",
      e.target.checked ? "SomeoneElse" : "Myself"
    );
    if (!e.target.checked) {
      getUserInfo();
    } else if (isAuthenticated) {
      formik.setFieldValue("passengerFullName", "");
      formik.setFieldValue("passengerCellPhone", "");
      formik.setFieldValue("email", "");
    }
  };

  const getUserInfo = async () => {
    try {
      await BACKEND_API.get("/api/v1/users/me", authHeader()).then((res) => {
        const { fullName, email, phoneNumber } = res.data;
        formik.setFieldValue("passengerFullName", fullName);
        formik.setFieldValue("passengerCellPhone", phoneNumber);
        formik.setFieldValue("email", email);
      });
    } catch (error) {
      /* guest may continue without profile */
    }
  };

  const handleChangeGratitude = (e) => {
    const gratuityId = Number(e.target.value);
    const g = gratuities.find((x) => Number(x.gratuityId) === gratuityId);
    if (!g) return;
    const pct = Number(g.percentage) || 0;
    const newFee = pct > 0 ? tipDollarsForPercentage(pct) : 0;
    const oldFee = parseFloat(formik.values.prevGratuityFee) || 0;
    formik.setFieldValue("gratuityId", gratuityId);
    formik.setFieldValue("gratuityPercentage", pct);
    formik.setFieldValue("prevGratuityFee", newFee);
    formik.setFieldValue("gratuityFee", newFee);
    dispatch(adGratitudeFee(totalFee + newFee - oldFee));
  };

  const getGratitude = async () => {
    try {
      const res = await BACKEND_API.get("/api/v1/gratuities");
      const gratuityData = res.data.map((gratuity) => ({
        ...gratuity,
        gratuityFee: tipDollarsForPercentage(gratuity.percentage).toFixed(2),
      }));
      setGratuity(gratuityData);
      const selected = gratuityData.find(
        (x) => Number(x.gratuityId) === Number(formik.values.gratuityId)
      );
      if (selected && Number(selected.percentage) > 0) {
        const tip = tipDollarsForPercentage(selected.percentage);
        formik.setFieldValue("gratuityPercentage", selected.percentage);
        formik.setFieldValue("gratuityFee", tip);
        formik.setFieldValue("prevGratuityFee", tip);
      }
    } catch (error) {
      console.log("unable to load gratitudes: ", error);
    }
  };

  useEffect(() => {
    const vehicleFee = feeParams.vehicleFee ?? formik.values.vehicleFee;
    if (!travelRouteId || !vehicleFee) return;
    setGratuity((prev) => {
      if (!prev.length) return prev;
      return prev.map((g) => ({
        ...g,
        gratuityFee: tipDollarsForPercentage(g.percentage).toFixed(2),
      }));
    });
  }, [
    travelRouteId,
    tripType,
    feeParams.vehicleFee,
    feeParams.minimumStartFee,
    feeParams.distanceInMiles,
    feeParams.hour,
    formik.values.vehicleFee,
    formik.values.minimumStartFee,
    formik.values.distanceInMiles,
    formik.values.hour,
    formik.values.extraOptionFee,
    formik.values.stopOnWayFee,
    formik.values.pickupPreferenceFee,
  ]);

  useEffect(() => {
    if (!skipAutoContactFill) {
      getUserInfo();
    }
    getGratitude();
    fetchUserPaymentCards();
  }, [isAuthenticated, skipAutoContactFill, fetchUserPaymentCards]);

  const isFieldDisabled = () => {
    if (isAuthenticated) {
      return !bookForPassenger;
    }
    return false;
  };

  return (
    <Grid
      container
      direction={{ xs: "column-reverse", lg: "row" }}
      spacing={1}
      justifyContent={"start"}
    >
      <Grid item xs={3}>
        <StepSummary
          rideSummaryData={rideSummaryData}
          vehicleSummaryData={vehicleSummaryData}
          tripSummaryData={tripSummaryData}
          contactSummaryData={[]}
          travelRouteId={travelRouteId}
        />
      </Grid>
      <Grid item xs={12} lg={8} spacing={{ xs: 12, md: 6 }}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                color="info"
                checked={bookForPassenger}
                onChange={handleBookForPassenger}
              />
            }
            label="I'm booking this for someone else."
          />
        </Grid>

        <Grid item xs={12}>
          <Stack direction={{ md: "row", xs: "column" }} spacing={2}>
            <RSTextField
              label="Passenger Full Name"
              color={"info"}
              fullWidth
              disabled={isFieldDisabled()}
              {...formik.getFieldProps("passengerFullName")}
              onBlur={(e) => {
                formik.handleBlur(e);
                const formatted = formatFullName(e.target.value);
                if (formatted !== e.target.value) {
                  formik.setFieldValue("passengerFullName", formatted);
                }
              }}
              error={
                formik.touched.passengerFullName &&
                Boolean(formik.errors.passengerFullName)
              }
              helperText={
                formik.touched.passengerFullName &&
                formik.errors.passengerFullName
              }
            />
            <RSTextField
              label="Passenger Phone number"
              color={"info"}
              disabled={isFieldDisabled()}
              fullWidth
              {...formik.getFieldProps("passengerCellPhone")}
              error={
                formik.touched.passengerCellPhone &&
                Boolean(formik.errors.passengerCellPhone)
              }
              helperText={
                formik.touched.passengerCellPhone &&
                formik.errors.passengerCellPhone
              }
            />
            <RSTextField
              label="Passenger email"
              color={"info"}
              disabled={isFieldDisabled()}
              fullWidth
              {...formik.getFieldProps("email")}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} my={3}>
          <FormControl>
            <FormLabel id="gratitude_label" sx={{ fontSize: 20 }}>
              Gratuity
            </FormLabel>
            <RadioGroup
              aria-labelledby="gratitude_label"
              name="gratuityId"
              value={String(formik.values.gratuityId ?? "")}
              onChange={handleChangeGratitude}
            >
              {gratuities.map((gratuity) => {
                const { gratuityId, description, gratuityFee } = gratuity;
                return (
                  <FormControlLabel
                    key={gratuityId}
                    value={String(gratuityId)}
                    control={<RSRadio />}
                    label={`${description} ${gratuityFee > 0 ? `$(${gratuityFee})` : ""}`}
                  />
                );
              })}
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} mt={2}>
          {!hidePaymentSection && (
            <Box>
              <PaymentMethodSelector
                formik={formik}
                authToken={authToken}
                userCards={userCards}
                cardsLoading={cardsLoading}
                cardsError={cardsError}
                totalFee={totalFee}
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Index;
