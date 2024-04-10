import React, { useState } from "react";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function BookingStatusPoup({
  open,
  handleClose,
  bookingId,
  bookingType,
}) {
  const [status, setStatus] = useState("PENDING_APPROVAL"); // Default value
  const [isUpdated, setIsUpdated] = useState(false);
  const bookingStatusOptions = [
    "PENDING_APPROVAL",
    "UNDER_REVIEW",
    "ACCEPTED",
    "REJECTED",
    "CANCELLED",
    "AWAITING_PICKUP",
    "PICKUP_COMPLETED",
    "EN_ROUTE",
    "AWAITING_RETURN_PICKUP",
    "RETURN_PICKUP_COMPLETED",
    "OVERDUE",
    "DISPUTED",
    "COMPLETED",
  ];
  const navigate = useNavigate();

  const handleBook = async () => {
    await axios
      .put(
        `http://api.odatransportation.com/api/v1/${getEndpoint()}/booking-status`,
        {
          status: status,
        }
      )
      .then((response) => {
        if (response.status === 200) {
          handleClose();
          setIsUpdated(true);
        }
        // navigate("/dashboard/airportbook")
      });
  };

  const handleSnackbarClose = () => {
    setIsUpdated(false);
  };

  const getEndpoint = () => {
    switch (bookingType) {
      case "hourlyCharter":
        return `hourly-charter-books/${bookingId}`;
      case "airport":
        return `airport-books/${bookingId}`;
      case "pointToPoint":
        return `point-to-point-books/${bookingId}`;
      default:
        return ""; // Default case
    }
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const email = formJson.email;
            console.log(email);
            handleClose();
          },
        }}
      >
        <DialogTitle>Change Book Status</DialogTitle>
        <DialogContent>
          <DialogContentText>Please, Select Book status</DialogContentText>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            autoFocus
            required
            fullWidth
          >
            {bookingStatusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "red", // Set background color to #03930a
              color: "white", // Set text color to white or any color you prefer
              "&:hover": {
                backgroundColor: "#027c08", // Change color on hover if needed
              },
            }}
            fullWidth
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#03930a", // Set background color to #03930a
              color: "white", // Set text color to white or any color you prefer
              "&:hover": {
                backgroundColor: "#027c08", // Change color on hover if needed
              },
            }}
            fullWidth
            onClick={handleBook}
          >
            Summit
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={isUpdated}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Book Update Successfully
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
}
