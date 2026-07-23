import React from "react";
import { Alert, Box, Chip, Typography } from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

/**
 * Summary-step payment state — card was verified on the previous step.
 */
export default function SquarePaymentStatus({
  secured,
  cardholderName,
  billingZip,
  feeMismatch,
  onEditPayment,
}) {
  if (feeMismatch) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Your trip total changed after the card was verified. Go back to Contact
        and tap <strong>Summary</strong> again to re-verify your card.
      </Alert>
    );
  }

  if (!secured) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No card on file for this booking yet. Go back to Contact, complete the
        card fields, and tap <strong>Summary</strong> to verify your card.
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 1,
        bgcolor: "rgba(3, 147, 10, 0.08)",
        border: "1px solid rgba(3, 147, 10, 0.35)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <CheckCircleOutlineIcon sx={{ color: "#03930A" }} />
        <Typography variant="subtitle1" sx={{ color: "#03930A", fontWeight: 600 }}>
          Card verified for this booking
        </Typography>
        <Chip
          size="small"
          icon={<CreditCardIcon />}
          label="Square"
          sx={{ ml: "auto" }}
        />
      </Box>
      <Typography variant="body2" color="text.secondary">
        {cardholderName && <>Cardholder: {cardholderName}</>}
        {cardholderName && billingZip && " · "}
        {billingZip && <>Billing ZIP: {billingZip}</>}
      </Typography>
      {typeof onEditPayment === "function" && (
        <Typography
          component="button"
          type="button"
          variant="body2"
          onClick={onEditPayment}
          sx={{
            mt: 1,
            p: 0,
            border: 0,
            bgcolor: "transparent",
            color: "#03930A",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Change payment details
        </Typography>
      )}
    </Box>
  );
}
