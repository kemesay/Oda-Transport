import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Typography,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import * as yup from "yup";
import { useFormik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import { BACKEND_API } from "../../../../store/utils/API";

// A date column from the API comes back as a full ISO timestamp — the
// <TextField type="date"> input only accepts "YYYY-MM-DD".
const toDateInputValue = (value) => (value ? value.slice(0, 10) : "");

export default function EditPromoCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const promoCode = location.state?.rowData;

  const [submitState, setSubmitState] = useState({
    loading: false,
    successMessage: "",
    errorMessage: "",
  });

  const promoCodeValidationSchema = yup.object({
    discountType: yup
      .string()
      .oneOf(["percent", "flat"])
      .required("Discount type is required"),
    discountValue: yup
      .number()
      .typeError("Must be a number")
      .min(0.01, "Must be greater than 0")
      .required("Discount value is required"),
    maxRedemptionsPerUser: yup
      .number()
      .typeError("Must be a whole number")
      .integer("Must be a whole number")
      .min(1, "Must be at least 1")
      .required("Required — how many times one customer can use this code"),
    maxTotalRedemptions: yup
      .number()
      .typeError("Must be a whole number")
      .integer("Must be a whole number")
      .min(1, "Must be at least 1")
      .nullable(),
    startsAt: yup.date().nullable(),
    expiresAt: yup.date().nullable(),
  });

  const formik = useFormik({
    initialValues: {
      discountType: promoCode?.discountType || "percent",
      discountValue: promoCode?.discountValue ?? "",
      maxRedemptionsPerUser: promoCode?.maxRedemptionsPerUser ?? 5,
      maxTotalRedemptions: promoCode?.maxTotalRedemptions ?? "",
      startsAt: toDateInputValue(promoCode?.startsAt),
      expiresAt: toDateInputValue(promoCode?.expiresAt),
      isActive: promoCode?.isActive ?? true,
    },
    validationSchema: promoCodeValidationSchema,
    onSubmit: (values) => handleUpdate(values),
  });

  const handleUpdate = async (values) => {
    setSubmitState({ loading: true, successMessage: "", errorMessage: "" });
    try {
      const payload = {
        discountType: values.discountType,
        discountValue: Number(values.discountValue),
        maxRedemptionsPerUser: Number(values.maxRedemptionsPerUser),
        maxTotalRedemptions:
          values.maxTotalRedemptions !== "" ? Number(values.maxTotalRedemptions) : null,
        startsAt: values.startsAt || null,
        expiresAt: values.expiresAt || null,
        isActive: values.isActive,
      };
      await BACKEND_API.patch(`/api/v1/promo-codes/${promoCode.code}`, payload);
      setSubmitState({
        loading: false,
        successMessage: `Promo code "${promoCode.code}" was updated successfully.`,
        errorMessage: "",
      });
    } catch (error) {
      setSubmitState({
        loading: false,
        successMessage: "",
        errorMessage: error?.response?.data?.message || "Failed to update promo code.",
      });
    }
  };

  const isPercent = formik.values.discountType === "percent";

  if (!promoCode) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          No promo code was selected to edit. Go back to the list and pick one to edit.
        </Alert>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate("/dashboard/promo-codes")}>
          Back to Promo Codes
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ backgroundColor: "#DDD", padding: 2, mb: 2 }}>
        <center>
          <Typography sx={{ fontSize: 20, color: "#03930A", fontWeight: "bold" }}>
            Edit Promo Code — {promoCode.code}
          </Typography>
        </center>
      </Box>
      <Box>
        <Grid container alignItems={"center"} spacing={2}>
          <Grid item xs={12} md={6} lg={4}>
            <TextField
              fullWidth
              disabled
              label={"Code"}
              value={promoCode.code}
              helperText="The code text can't be changed once created."
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <TextField
              fullWidth
              select
              label={"Discount Type"}
              {...formik.getFieldProps("discountType")}
            >
              <MenuItem value="percent">Percentage off</MenuItem>
              <MenuItem value="flat">Flat dollar amount off</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <TextField
              fullWidth
              type="number"
              label={isPercent ? "Discount Percentage" : "Discount Amount ($)"}
              helperText={formik.touched.discountValue && formik.errors.discountValue}
              error={
                formik.touched.discountValue && Boolean(formik.errors.discountValue)
              }
              {...formik.getFieldProps("discountValue")}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <TextField
              fullWidth
              type="number"
              label={"Uses Per Customer"}
              helperText={
                (formik.touched.maxRedemptionsPerUser &&
                  formik.errors.maxRedemptionsPerUser) ||
                "How many times one customer can redeem this code"
              }
              error={
                formik.touched.maxRedemptionsPerUser &&
                Boolean(formik.errors.maxRedemptionsPerUser)
              }
              {...formik.getFieldProps("maxRedemptionsPerUser")}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <TextField
              fullWidth
              type="number"
              label={"Total Use Limit (optional)"}
              helperText={
                (formik.touched.maxTotalRedemptions &&
                  formik.errors.maxTotalRedemptions) ||
                "Leave blank for unlimited uses across all customers"
              }
              error={
                formik.touched.maxTotalRedemptions &&
                Boolean(formik.errors.maxTotalRedemptions)
              }
              {...formik.getFieldProps("maxTotalRedemptions")}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <TextField
              fullWidth
              type="date"
              label={"Start Date (optional)"}
              InputLabelProps={{ shrink: true }}
              helperText={
                (formik.touched.startsAt && formik.errors.startsAt) ||
                "Leave blank for a code that's usable right away"
              }
              error={formik.touched.startsAt && Boolean(formik.errors.startsAt)}
              {...formik.getFieldProps("startsAt")}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <TextField
              fullWidth
              type="date"
              label={"Expires On (optional)"}
              InputLabelProps={{ shrink: true }}
              helperText={
                (formik.touched.expiresAt && formik.errors.expiresAt) ||
                "Leave blank for a code that never expires"
              }
              error={formik.touched.expiresAt && Boolean(formik.errors.expiresAt)}
              {...formik.getFieldProps("expiresAt")}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4} sx={{ display: "flex", alignItems: "center" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.isActive}
                  onChange={(e) => formik.setFieldValue("isActive", e.target.checked)}
                  color="success"
                />
              }
              label={
                formik.values.isActive
                  ? "Active — turning this on deactivates any other public promotion"
                  : "Inactive"
              }
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

          <Grid item xs={12} sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color={"warning"}
              onClick={() => formik.handleSubmit()}
              disabled={submitState.loading}
            >
              {submitState.loading ? (
                <CircularProgress size={20} sx={{ color: "#FFF" }} />
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button variant="outlined" onClick={() => navigate("/dashboard/promo-codes")}>
              Back to Promo Codes
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
