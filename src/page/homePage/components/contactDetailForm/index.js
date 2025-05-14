import React, { useEffect, useState } from "react";
import { Stack, Grid, FormControlLabel, Checkbox, Box, FormControl, RadioGroup, FormLabel } from "@mui/material";
import RSRadio from "../../../../components/RSRadio";
import "bootstrap/dist/css/bootstrap.min.css";
import RSTextField from "../../../../components/RSTextField";
import StepSummary from "../StepSummary";
import { remote_host } from "../../../../globalVariable";
import axios from "axios";
import { authHeader } from "../../../../util/authUtil";
import { useDispatch, useSelector } from "react-redux";
import { adGratitudeFee } from "../../../../store/reducers/bookReducers";
import PaymentMethodSelector from '../paymentMethodSelector';

function Index({
  formik,
  vehicleSummaryData,
  rideSummaryData,
  tripSummaryData,
}) {
  const [bookForPassenger, setBookForPassenger] = useState(
    formik.values.bookingFor == "SomeoneElse"
  );
  const [gratuities, setGratuity] = useState([]);
  const [userCards, setUserCards] = useState([]); // State for user's payment cards
  const { fee, totalFee } = useSelector((state) => state.bookReducer);
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.authReducer);

  // Function to fetch user's payment cards
  const fetchUserPaymentCards = async () => {
    try {
      const response = await axios.get(
        `${remote_host}/api/v1/users/payment-detail/paymentCards`,
        authHeader()
      );
      setUserCards(response.data);
    } catch (error) {
      console.error("Error fetching payment cards:", error);
    }
  };

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
      await axios
        .get(`${remote_host}/api/v1/users/me`, authHeader())
        .then((res) => {
          const { fullName, email, phoneNumber } = res.data;
          formik.setFieldValue("passengerFullName", fullName);
          formik.setFieldValue("passengerCellPhone", phoneNumber);
          formik.setFieldValue("email", email);
        });
    } catch (error) { }
  };

  const handleChangeGratitude = (e) => {
    const calculatedFee = totalFee + parseInt(e.target.value) - parseInt(formik.values.prevGratuityFee);
    formik.setFieldValue("gratuityId", e.target.name);
    formik.setFieldValue("prevGratuityFee", e.target.value);
    formik.setFieldValue("gratuityFee", parseInt(e.target.value));
    dispatch(adGratitudeFee(calculatedFee));
  };

  const getGratitude = async () => {
    try {
      axios.get(`${remote_host}/api/v1/gratuities`).then((res) => {
        const gratuityData = res.data.map((gratuity, index) => ({
          ...gratuity,
          gratuityFee: (totalFee * gratuity.percentage / 100).toFixed(2)
        }));
        setGratuity(gratuityData);
      });
    } catch (error) {
      console.log("unable to load gratitudes: ", error);
    }
  };

  useEffect(() => {
    getUserInfo();
    getGratitude();
    
    // Fetch payment cards if user is authenticated
    if (isAuthenticated) {
      fetchUserPaymentCards();
    }
  }, [isAuthenticated]); // Add isAuthenticated to dependency array

  const isFieldDisabled = () => {
    if (isAuthenticated) {
      return !bookForPassenger;
    } else {
      return false;
    }
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
        />
      </Grid>
      <Grid item xs={8} spacing={{ xs: 12, md: 6 }}>
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
            <RadioGroup
              aria-labelledby="gratitude"
              name="radio-gratitude"
              onChange={handleChangeGratitude}
              defaultValue={0}
            >
              <FormLabel id="gratitude_label" sx={{ fontSize: 20 }}>Gratuity</FormLabel>
              {gratuities.map((gratuity) => {
                const { gratuityId, description, gratuityFee } = gratuity;
                return (
                  <FormControlLabel
                    key={gratuityId}
                    value={gratuityFee}
                    name={gratuityId}
                    control={<RSRadio />}
                    label={`${description} ${gratuityFee > 0 ? `$(${gratuityFee})` : ""}`}
                  />
                );
              })}
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} mt={2}>
          <Box>
            <PaymentMethodSelector 
              formik={formik}
              authToken={isAuthenticated ? sessionStorage.getItem('access_token') : null}
              userCards={userCards} // Pass the userCards to PaymentMethodSelector
            />
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Index;