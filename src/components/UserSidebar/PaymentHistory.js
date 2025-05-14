import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { Receipt as ReceiptIcon } from '@mui/icons-material';
import { remote_host } from '../../globalVariable';
import TransportationReceipt from '../Receipt/TransportationReceipt';


const getStatusColor = (status) => {
  switch (status) {
    case 'COMPLETED':
    case 'PAID':
      return { bg: '#03930A', color: '#fff' };
    case 'REFUNDED':
      return { bg: '#FFA500', color: '#fff' };
    case 'PENDING':
    case 'PENDING_APPROVAL':
      return { bg: '#1976D2', color: '#fff' };
    case 'NOT_PAID':
      return { bg: '#757575', color: '#fff' };
    case 'CANCELLED':
      return { bg: '#D32F2F', color: '#fff' };
    default:
      return { bg: '#757575', color: '#fff' };
  }
};

function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const accessToken = sessionStorage.getItem('access_token');
        if (!accessToken) {
          throw new Error('No access token found');
        }

        const response = await fetch(`${remote_host}/api/v1/users/bookings/mine`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });


        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('response Data', data)

        
        // Transform the API data to match our frontend structure
        const transformedPayments = transformApiData(data);
        setPayments(transformedPayments);
      } catch (err) {
        console.error('Error fetching payment history:', err);
        setError(err.message || 'Failed to fetch payment history');
        setSnackbar(prev => ({ ...prev, open: true, message: err.message || 'Failed to fetch payment history', severity: 'error' }));
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, []);

  // Transform the API response to match our frontend data structure
  const transformApiData = (apiData) => {
    const allBookings = [
      ...(apiData.airportBookings || []),
      ...(apiData.pointToPointBookings || []),
      ...(apiData.hourlyCharterBookings || [])
    ];

    return allBookings.map(booking => ({
      id: booking.airportBookId || booking.pointToPointBookId || booking.hourlyCharterBookId,
      date: booking.createdAt,
      amount: parseFloat(booking.totalTripFeeInDollars) || 0,
      status: booking.paymentStatus || 'NOT_PAID',
      paymentMethod: mapPaymentMethod(booking.paymentMethod),
      bookingId: booking.confirmationNumber,
      description: generateDescription(booking),
      originalData: booking // Keep original data for receipt viewing
    }));
  };

  const mapPaymentMethod = (method) => {
    switch (method) {
      case 'PRIMARY_CARD':
        return 'Primary Card';
      case 'EXISTING_CARD':
        return 'Saved Card';
      case 'NEW_CARD':
        return 'New Card';
      default:
        return method || 'Not specified';
    }
  };

  const generateDescription = (booking) => {
    if (booking.airportBookId) {
      return `Airport Transfer - ${booking.airline} ${booking.arrivalFlightNumber || ''}`;
    } else if (booking.pointToPointBookId) {
      return `Point to Point - ${booking.pickupPhysicalAddress} to ${booking.dropoffPhysicalAddress}`;
    } else if (booking.hourlyCharterBookId) {
      return `Hourly Charter - ${booking.selectedHours} Hours`;
    }
    return 'Transport Service';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar(prev => ({
      open: true,
      message,
      severity
    }));
  };

  const handleViewReceipt = (payment) => {
    if (payment.status !== 'PAID') {
      showSnackbar('Payment is not completed. Receipt is not available.', 'warning');
      return;
    }

    // Transform the payment data for the receipt
    const paymentWithDetails = {
      ...payment,
      transactionId: payment.bookingId, // Use booking ID as transaction ID
      bookingDetails: {
        serviceType: getServiceType(payment.originalData),
        pickupTime: payment.originalData.pickupDateTime || payment.date,
        pickupLocation: payment.originalData.pickupPhysicalAddress || payment.originalData.pickupLocation,
        dropoffLocation: payment.originalData.dropoffPhysicalAddress || payment.originalData.dropoffLocation,
        baseFare: payment.amount - (payment.originalData.extraCharges || 0),
        waitingTime: payment.originalData.waitingTime || 0,
        waitingCharge: payment.originalData.waitingCharge || 0,
        extraCharges: payment.originalData.extraCharges || 0,
      },
      paymentMethod: payment.paymentMethod,
      cardLastFour: payment.originalData.cardLastFour || '****',
      amount: payment.amount,
      date: payment.date,
    };

    setSelectedPayment(paymentWithDetails);
    setReceiptOpen(true);
  };

  const getServiceType = (booking) => {
    if (booking.airportBookId) return 'Airport Transfer';
    if (booking.pointToPointBookId) return 'Point to Point';
    if (booking.hourlyCharterBookId) return 'Hourly Charter';
    return 'Transportation';
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'auto' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && payments.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          {error} - Please try again later or contact support.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom fontWeight="600">
        Payment History
      </Typography>

      {payments.length === 0 && !loading && !error ? (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No payment history found. Your bookings will appear here once created.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id} hover>
                  <TableCell>{formatDate(payment.date)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{payment.description}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Booking ID: {payment.bookingId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      ${payment.amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>
                    <Chip
                      label={payment.status}
                      size="small"
                      sx={{
                        bgcolor: getStatusColor(payment.status).bg,
                        color: getStatusColor(payment.status).color,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Receipt">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleViewReceipt(payment)}
                      >
                        <ReceiptIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Receipt Dialog */}
      {selectedPayment && (
        <TransportationReceipt
          open={receiptOpen}
          onClose={() => {
            setReceiptOpen(false);
            setSelectedPayment(null);
          }}
          payment={selectedPayment}
        />
      )}
    </Box>
  );
}

export default PaymentHistory;