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
import { useNavigate } from "react-router-dom";
import { BACKEND_API } from "../../../../store/utils/API";

export default function AddPromoCode() {
  const navigate = useNavigate();
  const [submitState, setSubmitState] = useState({
    loading: false,
    successMessage: "",
    errorMessage: "",
  });

  const promoCodeValidationSchema = yup.object({
    code: yup
      .string()
      .trim()
      .min(3, "Code must be at least 3 characters")
      .max(20, "Code can be at most 20 characters")
      .matches(/^[A-Za-z0-9]+$/, "Letters and numbers only, no spaces")
      .required("A code is required"),
    discountType: yup
      .string()
      .oneOf(["percent", "flat"])
      .required("Discount type is required"),
    discountValue: yup
      .number()
      .typeError("Must be a number")
      .min(0.01, "Must be greater than 0")
      .required("Discount value is required"),
    maxDiscountAmount: yup
      .number()
      .typeError("Must be a number")
      .min(0.01, "Must be greater than 0")
      .nullable(),
    minFareAmount: yup
      .number()
      .typeError("Must be a number")
      .min(0, "Cannot be negative")
      .nullable(),
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
    expiresAt: yup.date().nullable(),
  });

  const formik = useFormik({
    initialValues: {
      code: "",
      discountType: "percent",
      discountValue: "",
      maxDiscountAmount: "",
      minFareAmount: "",
      maxRedemptionsPerUser: 5,
      maxTotalRedemptions: "",
      expiresAt: "",
      isActive: true,
    },
    validationSchema: promoCodeValidationSchema,
    onSubmit: (values) => handleCreate(values),
  });

  const handleCreate = async (values) => {
    setSubmitState({ loading: true, successMessage: "", errorMessage: "" });
    try {
      const payload = {
        // Casing is preserved as typed (e.g. "OdaCar") — redemption still
        // works regardless of how a customer later types it, since the
        // backend's code lookup is case-insensitive.
        code: values.code.trim(),
        discountType: values.discountType,
        discountValue: Number(values.discountValue),
        maxDiscountAmount:
          values.maxDiscountAmount !== "" ? Number(values.maxDiscountAmount) : null,
        minFareAmount: values.minFareAmount !== "" ? Number(values.minFareAmount) : null,
        maxRedemptionsPerUser: Number(values.maxRedemptionsPerUser),
        maxTotalRedemptions:
          values.maxTotalRedemptions !== "" ? Number(values.maxTotalRedemptions) : null,
        expiresAt: values.expiresAt || null,
        isActive: values.isActive,
      };
      const response = await BACKEND_API.post("/api/v1/promo-codes", payload);
      setSubmitState({
        loading: false,
        successMessage: `Promo code "${response.data.code}" was created successfully.`,
        errorMessage: "",
      });
      formik.resetForm();
    } catch (error) {
      setSubmitState({
        loading: false,
        successMessage: "",
        errorMessage: error?.message || "Failed to create promo code.",
      });
    }
  };

  const isPercent = formik.values.discountType === "percent";

  return (
    <Box>
      <Box sx={{ backgroundColor: "#DDD", padding: 2, mb: 2 }}>
        <center>
          <Typography sx={{ fontSize: 20, color: "#03930A", fontWeight: "bold" }}>
            Add Promo Code
          </Typography>
        </center>
      </Box>
      <Box>
        <Grid container alignItems={"center"} spacing={2}>
          <Grid item xs={12} md={6} lg={4}>
            <TextField
              fullWidth
              label={"Code"}
              placeholder="e.g. OdaCar"
              helperText={
                (formik.touched.code && formik.errors.code) ||
                "Shown exactly as typed — customers can still enter it in any case"
              }
              error={formik.touched.code && Boolean(formik.errors.code)}
              {...formik.getFieldProps("code")}
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

          {isPercent && (
            <Grid item xs={12} md={6} lg={4}>
              <TextField
                fullWidth
                type="number"
                label={"Max Discount ($, optional)"}
                helperText={
                  (formik.touched.maxDiscountAmount && formik.errors.maxDiscountAmount) ||
                  "Caps the percentage discount in dollars"
                }
                error={
                  formik.touched.maxDiscountAmount &&
                  Boolean(formik.errors.maxDiscountAmount)
                }
                {...formik.getFieldProps("maxDiscountAmount")}
              />
            </Grid>
          )}

          <Grid item xs={12} md={6} lg={4}>
            <TextField
              fullWidth
              type="number"
              label={"Minimum Fare ($, optional)"}
              helperText={
                (formik.touched.minFareAmount && formik.errors.minFareAmount) ||
                "Leave blank to apply to any fare amount"
              }
              error={formik.touched.minFareAmount && Boolean(formik.errors.minFareAmount)}
              {...formik.getFieldProps("minFareAmount")}
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
              label={formik.values.isActive ? "Active — usable immediately" : "Inactive"}
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
                "Create Promo Code"
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
