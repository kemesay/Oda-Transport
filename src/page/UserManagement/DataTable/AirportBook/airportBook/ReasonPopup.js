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

export default function ReasonPopup({ open, handleClose, airportBookId }) {
  const [reason, setReason] = useState();
  const [isRejected, setIsRejected] = useState(false);
//   const navigate = useNavigate();

  const handleReject = async () => {
    await axios
      .post("http://api.odatransportation.com/api/v1/admin/bookings/approve", {
        bookingId: airportBookId,
        bookingType: "AIRPORT",
        action: "REJECTED",
        rejectionReason: reason,
      })
      .then((response) => {
        if (response.status == 200) {
          handleClose();
          setIsRejected(true);
        }
        // navigate("/dashboard/airportbook")
       });
  };
  const handleSnackbarClose = (event, reason) => {
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
          <Button  onClick={handleClose}>Cancel</Button>
          <Button onClick={handleReject}>Summit</Button>
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
