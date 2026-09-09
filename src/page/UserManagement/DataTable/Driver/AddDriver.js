import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import * as yup from "yup";
import { useFormik } from "formik";
import BACKEND_API from "../../../../store/utils/API";
import { authHeader } from "../../../../util/authUtil";
import { formatFullName, NAME_PART_REGEX } from "../../../../utils/nameUtil";

const schema = yup.object({
  fullName: yup
    .string()
    .required("Full name required")
    .test(
      "is-valid-full-name",
      "Enter a full name (first and last, letters only)",
      (value) => {
        const parts = String(value || "").trim().replace(/\s+/g, " ").split(" ");
        return parts.length >= 2 && parts.every((part) => NAME_PART_REGEX.test(part));
      }
    ),
  email: yup.string().email("Invalid email").required("Email required"),
  phoneNumber: yup
    .string()
    .matches(/^[0-9]{10,15}$/, "10–15 digit phone number")
    .required("Phone number required"),
  password: yup
    .string()
    .min(8, "At least 8 characters")
    .required("Password required"),
});

export default function AddDriver() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const formik = useFormik({
    initialValues: { fullName: "", email: "", phoneNumber: "", password: "" },
    validationSchema: schema,
    onSubmit: async (values) => {
      setLoading(true);
      setSuccess("");
      setError("");
      try {
        await BACKEND_API.post(
          `/api/v1/users/driver`,
          { ...values, fullName: formatFullName(values.fullName) },
          authHeader()
        );
        setSuccess("Driver account created successfully!");
        formik.resetForm();
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to create driver.");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box>
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          p: 2.5,
          mb: 3,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <DirectionsCarFilledIcon sx={{ color: "#f59e0b", fontSize: 28 }} />
        <Box>
          <Typography sx={{ fontSize: 18, color: "#fff", fontWeight: 700 }}>
            Register New Driver
          </Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
            Driver accounts have access to the driver dashboard and live trip controls
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: 1 }}>
        <Grid container spacing={2.5}>
          {[
            { name: "fullName", label: "Full Name", type: "text" },
            { name: "email", label: "Email Address", type: "email" },
            { name: "phoneNumber", label: "Phone Number (10–15 digits)", type: "tel" },
          ].map(({ name, label, type }) => (
            <Grid item xs={12} md={6} key={name}>
              <TextField
                fullWidth
                type={type}
                label={label}
                {...formik.getFieldProps(name)}
                error={formik.touched[name] && Boolean(formik.errors[name])}
                helperText={formik.touched[name] && formik.errors[name]}
              />
            </Grid>
          ))}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type={showPass ? "text" : "password"}
              label="Password"
              {...formik.getFieldProps("password")}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass((v) => !v)}>
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {success && (
            <Grid item xs={12}>
              <Alert severity="success">{success}</Alert>
            </Grid>
          )}
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={formik.handleSubmit}
              disabled={loading}
              sx={{
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "#1a1a2e",
                fontWeight: 700,
                px: 4,
                "&:hover": {
                  background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                },
                "&.Mui-disabled": { opacity: 0.6 },
              }}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: "#1a1a2e" }} />
              ) : (
                "Create Driver Account"
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
