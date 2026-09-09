import React, { useCallback, useEffect, useRef } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import useSquareCardSession from "../hooks/useSquareCardSession";
import { configureSquareCard } from "../services/squareCardService";
import { persistSquareCheckoutNonce, hasVerifiedSquarePayment } from "../services/squareCheckoutSession";
import { buildCheckoutVerificationDetails } from "../utils/squareVerificationDetails";
import { PAYMENT_METHODS } from "../constants/paymentMethods";
import { formatFullName } from "../utils/nameUtil";

/** Stable iframe slot — only the card field needs a fixed height */
const SQUARE_IFRAME_MIN_HEIGHT = 120;

/**
 * Secure card entry via Square Web Payments SDK.
 */
function SquarePaymentForm({
  formik,
  visible = true,
  amountDollars = 0,
  tokenizeIntent = "CHARGE",
  variant = "checkout",
  onReady,
  onError,
  onSecuredChange,
}) {
  const containerRef = useRef(null);
  const formikRef = useRef(formik);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  const onSecuredChangeRef = useRef(onSecuredChange);

  formikRef.current = formik;
  onReadyRef.current = onReady;
  onErrorRef.current = onError;
  onSecuredChangeRef.current = onSecuredChange;

  const buildVerificationDetails = useCallback(() => {
    const values = formikRef.current.values;
    return buildCheckoutVerificationDetails({
      amountDollars,
      intent: tokenizeIntent,
      cardOwnerName: values.cardDetails?.cardOwnerName,
      zipCode: values.cardDetails?.zipCode,
      email: values.email,
      phone: values.passengerCellPhone,
    });
  }, [amountDollars, tokenizeIntent]);

  const { phase, error, isReady, isLoading, tokenize, retry } = useSquareCardSession({
    enabled: visible,
    containerRef,
    getVerificationDetails: buildVerificationDetails,
  });

  const isWallet = variant === "wallet" || tokenizeIntent === "STORE";

  const runTokenize = useCallback(async () => {
    const square = await tokenize();
    await formikRef.current.setFieldValue("square", square);
    await formikRef.current.setFieldValue("isValidCardInfo", true);
    if (!isWallet) {
      persistSquareCheckoutNonce(square, {
        amount: amountDollars,
        paymentMethod: PAYMENT_METHODS.SQUARE_NEW,
      });
    }
    onSecuredChangeRef.current?.(true);
    return square;
  }, [tokenize, amountDollars, isWallet]);

  const tokenizeRef = useRef(runTokenize);
  tokenizeRef.current = runTokenize;

  useEffect(() => {
    formikRef.current.setFieldValue(
      "squareTokenize",
      () => tokenizeRef.current?.()
    );
    return () => {
      formikRef.current.setFieldValue("squareTokenize", undefined);
    };
  }, []);

  useEffect(() => {
    if (isReady) {
      onReadyRef.current?.({ tokenize: () => tokenizeRef.current?.() });
    }
  }, [isReady]);

  useEffect(() => {
    if (error) onErrorRef.current?.(error);
  }, [error]);

  const billingZip = (formik.values.cardDetails?.zipCode || "").trim();

  useEffect(() => {
    if (!isReady || !billingZip) return;
    configureSquareCard({ postalCode: billingZip }).catch(() => {});
  }, [isReady, billingZip]);

  const invalidateToken = useCallback(() => {
    formikRef.current.setFieldValue("isValidCardInfo", false);
    formikRef.current.setFieldValue("square", undefined);
    formikRef.current.setFieldValue("squareTokenizedAtFee", undefined);
    onSecuredChangeRef.current?.(false);
  }, []);

  const handleFieldChange = (field) => (event) => {
    formik.setFieldValue(`cardDetails.${field}`, event.target.value);
    invalidateToken();
  };

  const showVerified =
    !isWallet && hasVerifiedSquarePayment(formik.values);

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 0.75,
        }}
      >
        <Box
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 1,
            bgcolor: "rgba(3, 147, 10, 0.12)",
            color: "#03930A",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.3,
          }}
        >
          STEP 1
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
          Billing details
        </Typography>
      </Box>

      <Grid container spacing={1}>
        <Grid item xs={12} sm={7}>
          <TextField
            fullWidth
            label="Cardholder name"
            margin="dense"
            size="small"
            value={formik.values.cardDetails?.cardOwnerName || ""}
            onChange={handleFieldChange("cardOwnerName")}
            onBlur={(e) => {
              const formatted = formatFullName(e.target.value);
              if (formatted !== e.target.value) {
                formik.setFieldValue("cardDetails.cardOwnerName", formatted);
              }
            }}
            error={Boolean(formik.errors.cardDetails?.cardOwnerName)}
            helperText={formik.errors.cardDetails?.cardOwnerName}
            autoComplete="cc-name"
          />
        </Grid>
        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth
            label="Billing ZIP"
            margin="dense"
            size="small"
            inputProps={{ inputMode: "numeric", autoComplete: "postal-code", maxLength: 10 }}
            value={formik.values.cardDetails?.zipCode || ""}
            onChange={handleFieldChange("zipCode")}
            error={Boolean(formik.errors.cardDetails?.zipCode)}
            helperText={formik.errors.cardDetails?.zipCode}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 1, borderColor: "rgba(3, 147, 10, 0.2)" }} />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 0.5,
        }}
      >
        <Box
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 1,
            bgcolor: "rgba(3, 147, 10, 0.12)",
            color: "#03930A",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.3,
          }}
        >
          STEP 2
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
          Card number, expiry &amp; CVV
        </Typography>
      </Box>

      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: SQUARE_IFRAME_MIN_HEIGHT,
          minHeight: SQUARE_IFRAME_MIN_HEIGHT,
          borderRadius: 1,
          border: "1px solid rgba(0,0,0,0.23)",
          px: 1,
          py: 0.75,
          backgroundColor: "#fff",
          overflow: "hidden",
        }}
      >
        <Box
          ref={containerRef}
          id="square-card-container"
          aria-label="Secure card number, expiry, and security code"
          sx={{
            width: "100%",
            height: SQUARE_IFRAME_MIN_HEIGHT - 12,
            minHeight: SQUARE_IFRAME_MIN_HEIGHT - 12,
            display: "block",
          }}
        />
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
              backgroundColor: "rgba(255,255,255,0.92)",
              zIndex: 1,
            }}
          >
            <CircularProgress size={24} sx={{ color: "#03930A" }} />
            <Typography variant="caption" color="text.secondary">
              Loading secure card field…
            </Typography>
          </Box>
        )}
      </Box>

      {(showVerified || error || (phase === "error" && !error) || (isWallet && formik.values.square?.sourceId)) && (
        <Box sx={{ mt: 0.75 }}>
          {showVerified && (
            <Alert severity="success" sx={{ py: 0 }}>
              Card verified. Tap <strong>Summary</strong> to continue, or edit details above to
              verify again.
            </Alert>
          )}

          {isWallet && formik.values.square?.sourceId && (
            <Alert severity="success" sx={{ py: 0 }}>
              Card ready to save. Click <strong>Save Card</strong> below.
            </Alert>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{ py: 0 }}
              action={
                <Button color="inherit" size="small" onClick={retry}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {phase === "error" && !error && (
            <Alert severity="error" sx={{ py: 0 }}>
              Could not load the card field.
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
}

export default SquarePaymentForm;
