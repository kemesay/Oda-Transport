import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { Box, FormControlLabel, Switch, Typography, Alert } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import SquarePaymentForm from "../SquarePaymentForm";
import { BACKEND_API } from "../../store/utils/API";
import { authHeader } from "../../util/authUtil";
import { NAME_PART_REGEX, isPlaceholderName, formatFullName } from "../../utils/nameUtil";
import { validateZip } from "../../utils/zipUtil";

const schema = Yup.object({
  cardDetails: Yup.object({
    cardOwnerName: Yup.string()
      .required("Cardholder name is required")
      .test(
        "is-valid-cardholder-name",
        "Enter the cardholder's first and last name (letters only)",
        (value) => {
          const parts = String(value || "").trim().replace(/\s+/g, " ").split(" ");
          return parts.length >= 2 && parts.every((part) => NAME_PART_REGEX.test(part));
        }
      )
      .test(
        "is-not-placeholder-cardholder-name",
        'Enter the actual name on the card, not "Cardholder Name"',
        (value) => !isPlaceholderName(value)
      ),
    zipCode: Yup.string()
      .required("ZIP code is required")
      .test(
        "is-valid-zip",
        "Enter a valid US ZIP code (e.g. 90210 or 90210-1234)",
        (value) => !validateZip(value)
      ),
  }),
});

const SquareWalletAddCard = forwardRef(function SquareWalletAddCard(
  { open, isPrimary, onPrimaryChange },
  ref
) {
  const formik = useFormik({
    initialValues: {
      cardDetails: { cardOwnerName: "", zipCode: "" },
      email: "",
      passengerCellPhone: "",
      square: undefined,
      squareTokenize: undefined,
      isValidCardInfo: false,
    },
    validationSchema: schema,
    onSubmit: () => {},
  });

  useEffect(() => {
    if (!open) return;
    BACKEND_API.get("/api/v1/users/me", authHeader())
      .then((res) => {
        const { fullName, email, phoneNumber } = res.data || {};
        if (fullName && !formik.values.cardDetails?.cardOwnerName) {
          formik.setFieldValue("cardDetails.cardOwnerName", formatFullName(fullName));
        }
        if (email) formik.setFieldValue("email", email);
        if (phoneNumber) formik.setFieldValue("passengerCellPhone", phoneNumber);
      })
      .catch(() => {
        /* guest or profile unavailable */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useImperativeHandle(ref, () => ({
    async tokenizeForSave() {
      if (typeof formik.values.squareTokenize === "function") {
        return formik.values.squareTokenize();
      }
      if (formik.values.square?.sourceId) {
        return formik.values.square;
      }
      throw new Error("Please complete the Square card form.");
    },
    getBillingFields() {
      return {
        cardOwnerName: formik.values.cardDetails?.cardOwnerName || "",
        zipCode: formik.values.cardDetails?.zipCode || "",
      };
    },
  }));

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Cards saved here appear at checkout as <strong>Primary</strong> or{" "}
        <strong>Saved card</strong> — you won&apos;t need to re-enter them each time.
      </Alert>
      <SquarePaymentForm
        formik={formik}
        visible={open}
        tokenizeIntent="STORE"
        variant="wallet"
      />
      <FormControlLabel
        control={
          <Switch
            checked={isPrimary}
            onChange={(e) => onPrimaryChange(e.target.checked)}
            color="primary"
          />
        }
        label={
          <Typography variant="body2">
            Set as primary payment method for future bookings
          </Typography>
        }
        sx={{ mt: 2 }}
      />
    </Box>
  );
});

export default SquareWalletAddCard;
