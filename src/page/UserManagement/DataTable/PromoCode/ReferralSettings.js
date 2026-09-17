import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import * as yup from "yup";
import { useFormik } from "formik";
import useGetData from "../../../../store/hooks/useGetData";
import { BACKEND_API } from "../../../../store/utils/API";

const referralSettingsValidationSchema = yup.object({
  referralDiscountPercent: yup
    .number()
    .typeError("Must be a number")
    .min(0.01, "Must be greater than 0")
    .max(100, "Can't exceed 100%")
    .required("Required"),
  maxLifetimePublicRedemptions: yup
    .number()
    .typeError("Must be a whole number")
    .integer("Must be a whole number")
    .min(0, "Cannot be negative")
    .required("Required"),
  maxLifetimeReferralRedemptions: yup
    .number()
    .typeError("Must be a whole number")
    .integer("Must be a whole number")
    .min(0, "Cannot be negative")
    .required("Required"),
});

export default function ReferralSettings() {
  const [submitState, setSubmitState] = useState({
    loading: false,
    successMessage: "",
    errorMessage: "",
  });

  const {
    data: settings,
    isLoading: isLoadingGet,
    isError: isErrorGet,
    refetch,
  } = useGetData("/api/v1/promo-codes/referral-settings");

  const formik = useFormik({
    initialValues: {
      referralDiscountPercent: "",
      maxLifetimePublicRedemptions: "",
      maxLifetimeReferralRedemptions: "",
    },
    validationSchema: referralSettingsValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => handleSave(values),
  });

  // Prefill the form once the current settings arrive — enableReinitialize
  // means Formik picks up initialValues changes after this first render.
  useEffect(() => {
    if (settings) {
      formik.setValues({
        referralDiscountPercent: settings.referralDiscountPercent,
        maxLifetimePublicRedemptions: settings.maxLifetimePublicRedemptions,
        maxLifetimeReferralRedemptions: settings.maxLifetimeReferralRedemptions,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const handleSave = async (values) => {
    setSubmitState({ loading: true, successMessage: "", errorMessage: "" });
    try {
      await BACKEND_API.patch("/api/v1/promo-codes/referral-settings", {
        referralDiscountPercent: Number(values.referralDiscountPercent),
        maxLifetimePublicRedemptions: Number(values.maxLifetimePublicRedemptions),
        maxLifetimeReferralRedemptions: Number(values.maxLifetimeReferralRedemptions),
      });
      setSubmitState({
        loading: false,
        successMessage: "Referral settings saved. This applies to codes and rewards created from now on.",
        errorMessage: "",
      });
      refetch();
    } catch (error) {
      setSubmitState({
        loading: false,
        successMessage: "",
        errorMessage: error?.message || "Failed to save referral settings.",
      });
    }
  };

  return (
    <Box>
      <Box sx={{ backgroundColor: "#DDD", padding: 2, mb: 2 }}>
        <center>
          <Typography sx={{ fontSize: 20, color: "#03930A", fontWeight: "bold" }}>
            Referral Settings
          </Typography>
        </center>
      </Box>

      <Box sx={{ px: 2, mb: 2 }}>
        <Typography sx={{ color: "#666", fontSize: 14 }}>
          These numbers drive the whole referral program — one percentage covers
          both sides: it's the discount a referred friend gets on their first ride,
          and the same percentage the referrer earns as their own reward once that
          ride completes and is paid. Changing a value here only affects codes and
          rewards created afterward; anything already issued keeps the rate it was
          given.
        </Typography>
      </Box>

      {isLoadingGet && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {isErrorGet && (
        <Box sx={{ px: 2 }}>
          <Alert severity="error">Could not load the current referral settings.</Alert>
        </Box>
      )}

      {!isLoadingGet && !isErrorGet && (
        <Box>
          <Grid container alignItems={"center"} spacing={2} sx={{ px: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label={"Referral Discount"}
                helperText={
                  (formik.touched.referralDiscountPercent &&
                    formik.errors.referralDiscountPercent) ||
                  "% off the referred friend's first ride, and the referrer's own reward — never capped in size"
                }
                error={
                  formik.touched.referralDiscountPercent &&
                  Boolean(formik.errors.referralDiscountPercent)
                }
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                {...formik.getFieldProps("referralDiscountPercent")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label={"Public Codes Per Customer (Lifetime)"}
                helperText={
                  (formik.touched.maxLifetimePublicRedemptions &&
                    formik.errors.maxLifetimePublicRedemptions) ||
                  "Max public/marketing codes one customer can ever redeem"
                }
                error={
                  formik.touched.maxLifetimePublicRedemptions &&
                  Boolean(formik.errors.maxLifetimePublicRedemptions)
                }
                {...formik.getFieldProps("maxLifetimePublicRedemptions")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label={"Referral Codes Per Customer (Lifetime)"}
                helperText={
                  (formik.touched.maxLifetimeReferralRedemptions &&
                    formik.errors.maxLifetimeReferralRedemptions) ||
                  "Max friends'invite/reward codes one customer can ever redeem, a separate allowance from public codes"
                }
                error={
                  formik.touched.maxLifetimeReferralRedemptions &&
                  Boolean(formik.errors.maxLifetimeReferralRedemptions)
                }
                {...formik.getFieldProps("maxLifetimeReferralRedemptions")}
              />
            </Grid>

            <Grid item xs={12} px={2}>
              {submitState.successMessage && (
                <Alert severity={"success"}>{submitState.successMessage}</Alert>
              )}
              {submitState.errorMessage && (
                <Alert severity={"error"}>{submitState.errorMessage}</Alert>
              )}
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color={"warning"}
                onClick={() => formik.handleSubmit()}
                disabled={submitState.loading}
              >
                {submitState.loading ? (
                  <CircularProgress size={20} sx={{ color: "#FFF" }} />
                ) : (
                  "Save Settings"
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
}
