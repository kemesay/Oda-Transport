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
  FormControlLabel,
  Switch,
} from "@mui/material";
import * as yup from "yup";
import { useFormik } from "formik";
import useGetData from "../../../../store/hooks/useGetData";
import { BACKEND_API } from "../../../../store/utils/API";

const sideDetourSettingsValidationSchema = yup.object({
  startFee: yup
    .number()
    .typeError("Must be a number")
    .min(0, "Cannot be negative")
    .required("Required"),
});

export default function SideDetourSettings() {
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
  } = useGetData("/api/v1/side-detour-settings");

  const formik = useFormik({
    initialValues: {
      isActive: false,
      startFee: "",
    },
    validationSchema: sideDetourSettingsValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => handleSave(values),
  });

  useEffect(() => {
    if (settings) {
      formik.setValues({
        isActive: Boolean(settings.isActive),
        startFee: settings.startFee,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const handleSave = async (values) => {
    setSubmitState({ loading: true, successMessage: "", errorMessage: "" });
    try {
      await BACKEND_API.patch("/api/v1/side-detour-settings", {
        isActive: values.isActive,
        startFee: Number(values.startFee),
      });
      setSubmitState({
        loading: false,
        successMessage: "Side detour settings saved.",
        errorMessage: "",
      });
      refetch();
    } catch (error) {
      setSubmitState({
        loading: false,
        successMessage: "",
        errorMessage: error?.message || "Failed to save side detour settings.",
      });
    }
  };

  return (
    <Box>
      <Box sx={{ backgroundColor: "#DDD", padding: 2, mb: 2 }}>
        <center>
          <Typography sx={{ fontSize: 20, color: "#03930A", fontWeight: "bold" }}>
            Side Detour Settings
          </Typography>
        </center>
      </Box>

      <Box sx={{ px: 2, mb: 2 }}>
        <Typography sx={{ color: "#666", fontSize: 14 }}>
          An optional flat fee, on top of the normal per-mile fare, for any Point
          to Point or Airport booking where the customer adds at least one
          side-pick detour stop. Applied once per booking — the same for a
          one-way trip and a round trip — and only charged when a detour is
          actually used. Off by default; nothing changes until you turn it on.
        </Typography>
      </Box>

      {isLoadingGet && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {isErrorGet && (
        <Box sx={{ px: 2 }}>
          <Alert severity="error">Could not load the current side detour settings.</Alert>
        </Box>
      )}

      {!isLoadingGet && !isErrorGet && (
        <Box>
          <Grid container alignItems={"center"} spacing={2} sx={{ px: 2 }}>
            <Grid item xs={12} md={6} sx={{ display: "flex", alignItems: "center" }}>
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
                    ? "Active — fee applies to new bookings with a detour"
                    : "Inactive — no side detour fee is charged"
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label={"Start Fee"}
                helperText={
                  (formik.touched.startFee && formik.errors.startFee) ||
                  "Flat amount added once when a booking has a side-pick detour"
                }
                error={formik.touched.startFee && Boolean(formik.errors.startFee)}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                {...formik.getFieldProps("startFee")}
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
