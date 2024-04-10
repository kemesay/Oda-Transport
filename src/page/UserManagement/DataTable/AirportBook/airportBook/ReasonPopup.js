import React, { useState } from "react";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ReasonPopup({
  open,
  handleClose,
  bookingId,
  bookingType,
}) {
  const [reason, setReason] = useState("");
  const [isRejected, setIsRejected] = useState(false);
  const navigate = useNavigate();

  const handleReject = async () => {
    await axios
      .post("http://api.odatransportation.com/api/v1/admin/bookings/approve", {
        bookingId: bookingId,
        bookingType: bookingType.toUpperCase(),
        action: "REJECTED",
        rejectionReason: reason,
      })
      .then((response) => {
        if (response.status === 200) {
          handleClose();
          setIsRejected(true);
        }
        // navigate("/dashboard/airportbook")
      });
  };

  const handleSnackbarClose = () => {
    setIsRejected(false);
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
        <DialogTitle>Reason</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please, Insert reason of rejection
          </DialogContentText>
          <TextField
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            autoFocus
            required
            margin="dense"
            id="name"
            name="email"
            label="Reason"
            type="text"
            fullWidth
            variant="standard"
          />
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
          <Button   variant="contained"
            sx={{
              backgroundColor: "#03930a", // Set background color to #03930a
              color: "white", // Set text color to white or any color you prefer
              "&:hover": {
                backgroundColor: "#027c08", // Change color on hover if needed
              },
            }}
            fullWidth onClick={handleReject}>Submit</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={isRejected}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Book Rejected Successfully
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
}
