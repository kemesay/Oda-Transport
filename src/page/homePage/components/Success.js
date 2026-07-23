import React from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { Stack, Box, Chip, Typography } from "@mui/material";
import RSTypography from "../../../components/RSTypography";
import RSButton from "../../../components/RSButton";
import usePaymentRealtime from "../../../hooks/usePaymentRealtime";

const STATUS_COLOR = {
  AUTHORIZED: "warning",
  PAID: "success",
  CANCELLED: "error",
  AWAITING_PAYMENT: "default",
  NOT_PAID: "default",
};

function Success({ bookingResult }) {
  const roomToken = bookingResult?.realtime?.roomToken;
  const initialStatus = bookingResult?.paymentStatus;
  const confirmationNumber =
    bookingResult?.confirmationNumber || bookingResult?.confirmationNo;

  const { paymentStatus: liveStatus } = usePaymentRealtime(roomToken);
  const paymentStatus = liveStatus || initialStatus;

  return (
    <Box>
      <Stack
        direction={"column"}
        justifyContent={"center"}
        alignItems={"center"}
        spacing={2}
        sx={{ backgroundColor: "#EEE", padding: 3, border: "1px solid #DDD" }}
      >
        <FaCircleCheck size={40} color="#03930A" />
        <RSTypography fontsize={"20px"}>
          You've successfully booked for transportation
        </RSTypography>
        {confirmationNumber && (
          <Typography variant="body1">
            Confirmation: <strong>{confirmationNumber}</strong>
          </Typography>
        )}
        {paymentStatus && (
          <Chip
            label={`Payment: ${paymentStatus}`}
            color={STATUS_COLOR[paymentStatus] || "default"}
            variant="outlined"
          />
        )}
        {paymentStatus === "AUTHORIZED" && (
          <Typography variant="body2" color="text.secondary" align="center">
            Your card has been authorized (hold only). Payment will be captured
            when our team completes your trip — not when the booking is accepted.
          </Typography>
        )}
        {paymentStatus === "PAID" && (
          <Typography variant="body2" color="text.secondary" align="center">
            Payment has been captured. Thank you!
          </Typography>
        )}
        <RSTypography txtcolor="#03930A">
          Thank you for using our service!
        </RSTypography>
        <RSButton
          borderradius={"5px"}
          variant="contained"
          backgroundcolor={"#4D4C4C"}
          onClick={() => {
            window.location.reload();
          }}
        >
          new order
        </RSButton>
      </Stack>
    </Box>
  );
}

export default Success;
