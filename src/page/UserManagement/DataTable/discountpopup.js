import React, { useState, useCallback } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { BACKEND_API } from "../../../store/utils/API";
import { toast } from 'react-toastify';

export default function DiscountPopup({
  open,
  handleClose,
  bookingId,
  bookingType,
}) {
  const [discountAmount, setDiscountAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Safe function to get endpoint
  const getEndpoint = useCallback(() => {
    if (!bookingId) {
      toast.error("Booking ID is required");
      return null;
    }
    
    const basePath = `/api/v1`;
    switch (String(bookingType).toUpperCase()) {
      case "AIRPORT":
        return `${basePath}/airport-books/${bookingId}/apply-discount`;
      case "HOURLY_CHARTER":
        return `${basePath}/hourly-charter-books/${bookingId}/apply-discount`;
      case "P2P":
      case "POINT_TO_POINT":
      default:
        return `${basePath}/point-to-point-books/${bookingId}/apply-discount`;
    }
  }, [bookingId, bookingType]);

  const getBookingTypeDisplayName = useCallback(() => {
    switch (String(bookingType).toUpperCase()) {
      case "AIRPORT":
        return "Airport";
      case "HOURLY_CHARTER":
        return "Hourly Charter";
      case "P2P":
      case "POINT_TO_POINT":
        return "Point to Point";
      default:
        return "Booking";
    }
  }, [bookingType]);

  const handleApplyDiscount = async () => {
    try {
      // Validation
      if (!discountAmount || isNaN(discountAmount) || parseFloat(discountAmount) <= 0) {
        toast.error("Please enter a valid discount amount greater than 0");
        return;
      }

      setLoading(true);

      const endpoint = getEndpoint();
      if (!endpoint) {
        toast.error("Invalid booking information");
        return;
      }

      const response = await BACKEND_API.put(endpoint, {
        discountAmount: parseFloat(discountAmount)
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(
          response?.data?.message || 
          `$${discountAmount} discount applied successfully!`, 
          { autoClose: 6000 }
        );
        
        // Use setTimeout to ensure state updates happen after the current execution context
        setTimeout(() => {
          setDiscountAmount("");
          if (handleClose && typeof handleClose === 'function') {
            handleClose();
          }
        }, 100);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.error || 
        `Error applying discount. Please try again.`, 
        {
          autoClose: 6000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setDiscountAmount(value);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyDiscount();
    }
  };

  const handleCancel = () => {
    setDiscountAmount("");
    if (handleClose && typeof handleClose === 'function') {
      handleClose();
    }
  };

  // Safe guard for handleClose function
  const safeHandleClose = useCallback((event, reason) => {
    if (reason && reason === 'backdropClick' && loading) {
      return; // Prevent closing when loading and clicking backdrop
    }
    handleCancel();
  }, [loading]);

  return (
    <Dialog
      open={open}
      onClose={safeHandleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>Apply Discount</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Enter the discount amount for {getBookingTypeDisplayName()} booking (ID: {bookingId})
        </DialogContentText>
        <TextField
          value={discountAmount}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          autoFocus
          margin="dense"
          label="Discount Amount ($)"
          type="text"
          fullWidth
          variant="outlined"
          placeholder="0.00"
          InputProps={{
            startAdornment: <span style={{ marginRight: '8px', color: '#666' }}>$</span>,
          }}
          helperText="Enter amount greater than 0"
          sx={{ mt: 2 }}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="outlined"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleApplyDiscount}
          disabled={loading || !discountAmount || parseFloat(discountAmount) <= 0}
          sx={{ 
            backgroundColor: "#03930a",
            color: "white",
            "&:hover": { backgroundColor: "#027c08" },
            "&:disabled": { backgroundColor: '#ccc', color: '#666' }
          }}
        >
          {loading ? "Applying..." : "Apply Discount"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}