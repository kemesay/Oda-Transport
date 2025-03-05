import React, { useState } from "react";
import {
  Box,
  Grid,
  Stack,
  CircularProgress,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Paper,
} from "@mui/material";
import {
  Person,
  Email,
  Phone,
  Lock,
  Visibility,
  VisibilityOff,
  Badge,
} from "@mui/icons-material";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RSTextField from "../../../../../components/RSTextField";
import * as yup from "yup";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../../../../../store/actions/authAction";

function Index() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const { signupLoanding, signupErrorMessage, isSignUpFail } = useSelector(
    (state) => state.authReducer
  );

  const phoneRegex = /^[0-9]{10,15}$/;
  
  const signInValidationSchema = yup.object({
    firstname: yup
      .string()
      .min(2, "First name must be at least 2 characters")
      .matches(/^[A-Za-z]+$/, "First name should only contain letters")
      .required("First name is required"),
    lastname: yup
      .string()
      .min(2, "Last name must be at least 2 characters")
      .matches(/^[A-Za-z]+$/, "Last name should only contain letters")
      .required("Last name is required"),
    email: yup
      .string()
      .email("Please enter a valid email address")
      .required("Email is required"),
    phone: yup
      .string()
      .matches(phoneRegex, "Please enter a valid phone number (10-15 digits)")
      .required("Phone number is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(/[^A-Za-z0-9]/, "Password must contain at least one special character")
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match")
      .required("Please confirm your password"),
  });

  const formikSignup = useFormik({
    initialValues: {
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: signInValidationSchema,
    onSubmit: (values) => {
      dispatch(signup(values));
    },
  });

  // Toast configuration
  const showErrorToast = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  };

  React.useEffect(() => {
    if (isSignUpFail && signupErrorMessage) {
      showErrorToast(signupErrorMessage);
    }
  }, [isSignUpFail, signupErrorMessage]);

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold', color: '#03930A' }}>
          Create Your Account
        </Typography>

        <form onSubmit={formikSignup.handleSubmit}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500, color: 'text.secondary' }}>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <RSTextField
                    label="First Name"
                    color="info"
                    fullWidth
                    {...formikSignup.getFieldProps("firstname")}
                    error={formikSignup.touched.firstname && Boolean(formikSignup.errors.firstname)}
                    helperText={formikSignup.touched.firstname && formikSignup.errors.firstname}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RSTextField
                    label="Last Name"
                    color="info"
                    fullWidth
                    {...formikSignup.getFieldProps("lastname")}
                    error={formikSignup.touched.lastname && Boolean(formikSignup.errors.lastname)}
                    helperText={formikSignup.touched.lastname && formikSignup.errors.lastname}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Badge color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500, color: 'text.secondary' }}>
                Contact Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <RSTextField
                    label="Phone Number"
                    type="tel"
                    color="info"
                    fullWidth
                    {...formikSignup.getFieldProps("phone")}
                    error={formikSignup.touched.phone && Boolean(formikSignup.errors.phone)}
                    helperText={formikSignup.touched.phone && formikSignup.errors.phone}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RSTextField
                    label="Email Address"
                    type="email"
                    color="info"
                    fullWidth
                    {...formikSignup.getFieldProps("email")}
                    error={formikSignup.touched.email && Boolean(formikSignup.errors.email)}
                    helperText={formikSignup.touched.email && formikSignup.errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Password Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500, color: 'text.secondary' }}>
                Security
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <RSTextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    color="info"
                    fullWidth
                    {...formikSignup.getFieldProps("password")}
                    error={formikSignup.touched.password && Boolean(formikSignup.errors.password)}
                    helperText={formikSignup.touched.password && formikSignup.errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RSTextField
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    color="info"
                    fullWidth
                    {...formikSignup.getFieldProps("confirmPassword")}
                    error={formikSignup.touched.confirmPassword && Boolean(formikSignup.errors.confirmPassword)}
                    helperText={formikSignup.touched.confirmPassword && formikSignup.errors.confirmPassword}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={signupLoanding}
                sx={{
                  mt: 2,
                  py: 1.5,
                  backgroundColor: "#03930A",
                  '&:hover': {
                    backgroundColor: "#027c08",
                  },
                }}
              >
                {signupLoanding ? (
                  <CircularProgress size={24} sx={{ color: "#FFF" }} />
                ) : (
                  "Sign Up"
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Box>
  );
}

export default Index;
