import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
  Grid,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  LocalTaxi as TaxiIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';

const TransportationReceipt = ({ open, onClose, payment }) => {
  const receiptRef = React.useRef();

  const handleDownload = async () => {
    try {
      const element = receiptRef.current;
      if (!element) return;

      const canvas = await html2canvas(element);
      const data = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      
      link.href = data;
      link.download = `receipt-${payment.transactionId || 'transport'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating receipt:', error);
      // You might want to add a way to show this error to the user
    }
  };

  const formatAmount = (amount) => {
    return typeof amount === 'number' ? amount.toFixed(2) : '0.00';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: '#fff'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: '#161F36',
        color: 'white'
      }}>
        <Typography variant="h6">Transportation Receipt</Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box ref={receiptRef} sx={{ p: 2 }}>
          {/* Company Logo and Info */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <img 
              src="https://odatransportation.com/static/media/ODA_Primary%20Logo.6715e0b164c507dbe1f2.png" 
              alt="Company Logo" 
              style={{ height: 60, marginBottom: 8 }}
            />
            <Typography variant="h6" sx={{ color: '#161F36', fontWeight: 600 }}>
              ODA Transportation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your Trusted Transportation Partner
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Receipt Details */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Transaction ID
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {payment.transactionId}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">
                  {format(new Date(payment.date), 'dd/MM/yyyy HH:mm')}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Ride Details */}
          <Box sx={{ 
            bgcolor: 'rgba(22, 31, 54, 0.05)', 
            p: 2, 
            borderRadius: 2,
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TaxiIcon color="green" />
              <Typography variant="subtitle1" fontWeight={600}>
                {payment.bookingDetails.serviceType} Service
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {format(new Date(payment.bookingDetails.pickupTime), 'HH:mm, dd MMM yyyy')}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <LocationIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {payment.bookingDetails.pickupPhysicalAddress} - {payment.bookingDetails.dropoffPhysicalAddress}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {payment.bookingDetails.dropoffLocation}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Payment Details */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Payment Details
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Base Fare
                </Typography>
                <Typography variant="body2">
                  $ {formatAmount(payment?.bookingDetails?.baseFare)}
                </Typography>
              </Box> */}

              {payment?.bookingDetails?.waitingTime > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Waiting Time ({payment.bookingDetails.waitingTime} mins)
                  </Typography>
                  <Typography variant="body2">
                    $ {formatAmount(payment.bookingDetails.waitingCharge)}
                  </Typography>
                </Box>
              )}

              {payment.bookingDetails.extraCharges > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Additional Charges
                  </Typography>
                  <Typography variant="body2">
                    $ {formatAmount(payment.bookingDetails.extraCharges)}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Total Amount
                </Typography>
                <Typography variant="subtitle2" fontWeight={600}>
                  $ {formatAmount(payment.amount)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Payment Method */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Payment Method
            </Typography>
            <Typography variant="body1">
              {payment.paymentMethod} 
            </Typography>
          </Box>

          <Divider sx={{ my: 2, color: 'red'}} />

          {/* Footer */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Thank you for choosing ODA Transportation
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              For support: info@odatransportation.com
            </Typography>
          </Box>
        </Box>

        {/* Download Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{
              bgcolor: '#03930A',
              '&:hover': { bgcolor: '#03830A' },
            }}
          >
            Download Receipt
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TransportationReceipt; 