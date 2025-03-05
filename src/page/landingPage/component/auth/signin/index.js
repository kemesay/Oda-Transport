import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Stack,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Typography,
  Paper,
  Divider,
  Checkbox,
  FormControlLabel,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  LoginOutlined,
} from "@mui/icons-material";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RSTextField from "../../../../../components/RSTextField";
import * as yup from "yup";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { signIn } from "../../../../../store/actions/authAction";
import { Link, useNavigate } from "react-router-dom";
import { disableIsSigninSuccess } from "../../../../../store/reducers/authReducer";
import { getUserRole } from "../../../../../util/authUtil";

function Index({ usernameFocus }) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [previousError, setPreviousError] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const {
    isSigninSuccess,
    signinLoanding,
    signinSuccessMessage,
    signinErrorMessage,
    isSignInFail,
  } = useSelector((state) => state.authReducer);

  const signInValidationSchema = yup.object({
    username: yup
      .string()
      .email("Please enter a valid email address")
      .required("Email address is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const formikSignIn = useFormik({
    initialValues: {
      username: localStorage.getItem('rememberedEmail') || "",
      password: "",
    },
    validationSchema: signInValidationSchema,
    onSubmit: (values) => {
      setAttemptedSubmit(true);
      setPreviousError("");
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', values.username);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      dispatch(signIn(values));
    },
  });

  const handleTogglePassword = () => setShowPassword((prev) => !prev);
  const handleRememberMe = (event) => setRememberMe(event.target.checked);

  const getErrorMessage = (error) => {
    if (error.includes('credentials')) {
      return "Invalid email or password. Please try again.";
    }
    if (error.includes('locked')) {
      return "Your account has been locked. Please contact support.";
    }
    if (error.includes('network')) {
      return "Network error. Please check your connection and try again.";
    }
    return error || "An error occurred. Please try again.";
  };

  const toastConfig = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
    toastId: Date.now(),
  };

  const showErrorToast = (message) => {
    const errorMessage = getErrorMessage(message);
    
    toast.error(
      <Stack spacing={1}>
        <Typography variant="body2" fontWeight="500">
          {errorMessage}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button 
            size="small" 
            variant="contained" 
            onClick={() => formikSignIn.handleSubmit()}
            sx={{
              bgcolor: 'white',
              color: '#d32f2f',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
              },
              flex: 1,
            }}
          >
            Try Again
          </Button>
          {errorMessage.includes('locked') && (
            <Button 
              size="small" 
              variant="contained" 
              onClick={() => window.location.href = '/contact-support'}
              sx={{
                bgcolor: 'white',
                color: '#d32f2f',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                },
                flex: 1,
              }}
            >
              Contact Support
            </Button>
          )}
        </Stack>
      </Stack>,
      {
        ...toastConfig,
        icon: '⚠️',
        style: {
          background: '#d32f2f',
          color: 'white',
          borderRadius: '8px',
          padding: '16px',
        },
      }
    );
  };

  useEffect(() => {
    if (isSignInFail && attemptedSubmit && signinErrorMessage !== previousError) {
      showErrorToast(signinErrorMessage);
      setPreviousError(signinErrorMessage);
      setTimeout(() => setPreviousError(""), toastConfig.autoClose);
    }
  }, [isSignInFail, signinErrorMessage, attemptedSubmit]);

  useEffect(() => {
    if (isSigninSuccess) {
      toast.success("Welcome back! Redirecting...", {
        ...toastConfig,
        icon: '🎉',
        style: {
          background: '#03930A',
          color: 'white',
          borderRadius: '8px',
          padding: '16px',
        },
      });
      
      const role = getUserRole();
      setTimeout(() => {
        navigate(role === "user" ? "/home/1" : role === "admin" ? "/dashboard" : "/");
      }, 1500);
    }
    return () => dispatch(disableIsSigninSuccess());
  }, [isSigninSuccess]);

  const shouldShowError = (fieldName) => {
    return attemptedSubmit && formikSignIn.touched[fieldName] && formikSignIn.errors[fieldName];
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 450,
          borderRadius: 2,
          position: 'relative',
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={1} alignItems="center">
            <LoginOutlined sx={{ fontSize: 40, color: '#03930A' }} />
            <Typography variant="h4" fontWeight="bold" color="#03930A">
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please sign in to continue
            </Typography>
          </Stack>

          <form onSubmit={formikSignIn.handleSubmit}>
            <Stack spacing={3}>
              <RSTextField
                label="Email Address"
                focused={usernameFocus}
                color="info"
                fullWidth
                {...formikSignIn.getFieldProps("username")}
                error={shouldShowError("username")}
                helperText={shouldShowError("username") && formikSignIn.errors.username}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <RSTextField
                label="Password"
                type={showPassword ? "text" : "password"}
                color="info"
                fullWidth
                {...formikSignIn.getFieldProps("password")}
                error={shouldShowError("password")}
                helperText={shouldShowError("password") && formikSignIn.errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Stack
                direction={isMobile ? "column" : "row"}
                justifyContent="space-between"
                alignItems={isMobile ? "stretch" : "center"}
                spacing={2}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={handleRememberMe}
                      color="primary"
                    />
                  }
                  label="Remember me"
                />

                <Link
                  to="/forget-password"
                  style={{
                    color: '#03930A',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Forgot password?
                </Link>
              </Stack>

              <Button
                type="submit"
                variant="contained"
                disabled={signinLoanding}
                sx={{
                  py: 1.5,
                  bgcolor: '#03930A',
                  '&:hover': {
                    bgcolor: '#027c08',
                  },
                }}
              >
                {signinLoanding ? (
                  <CircularProgress size={24} sx={{ color: "#FFF" }} />
                ) : (
                  "Login"
                )}
              </Button>
            </Stack>
          </form>

          {/* <Stack spacing={2} alignItems="center">
            <Divider sx={{ width: '100%' }} />
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: '#03930A',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign up now
              </Link>
            </Typography>
          </Stack> */}
        </Stack>
      </Paper>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        limit={3}
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
