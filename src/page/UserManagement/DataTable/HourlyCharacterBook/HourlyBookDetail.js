import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Alert,
  Grid,
  Typography,
  Stack,
  Button,
  Snackbar,
  Paper,
  Box,
  Chip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Divider,
} from "@mui/material";
import BookingStatusPoup from "../BookingStatus";
import ReasonPopup from "../ReasonPopup";
import DiscountPopup from "../discountpopup"; // Import DiscountPopup
import { BACKEND_API } from "../../../../store/utils/API";
import { ToastContainer, toast } from "react-toastify";
import useGetData from "../../../../store/hooks/useGetData";
import useBookingPaymentRealtime from "../../../../hooks/useBookingPaymentRealtime";
import useAdminTakePayment from "../../../../hooks/useAdminTakePayment";
import { getPaymentStatusBackgroundColor } from "../../../../constants/paymentStatusColors";
import { fareBreakdownFromBooking } from "../../../../utils/fareBreakdownFromBooking";
import { adminApproveBookingType } from "../../../../utils/bookingTypeMap";
import { authHeader } from "../../../../util/authUtil";

function ViewHourlyBookDetail(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    pickupPhysicalAddress,
    pickupLongitude,
    pickupLatitude,
    dropoffPhysicalAddress,
    dropoffLongitude,
    dropoffLatitude,
    pickupDateTime,
    selectedHours,
    occasion,
    specialInstructions,
    isGuestBooking,
    bookingFor,
    passengerFullName,
    passengerCellPhone,
    passengerEmail,
    numberOfPassengers,
    numberOfSuitcases,
    totalTripFeeInDollars,
    paymentStatus,
    bookingStatus,
    paymentDetailId,
    userId,
    carId,
    AdditionalStopOnTheWay,
  } = location.state?.rowData || {};

  const hourlyCharterBookId = location.state?.rowData?.hourlyCharterBookId;

  const [open, setOpen] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [discountOpen, setDiscountOpen] = useState(false); // State for discount popup

  // Trip Controls state
  const [liveStatus, setLiveStatus] = React.useState(null);
  const [tripLoading, setTripLoading] = React.useState(false);
  const [convertToLive, setConvertToLive] = React.useState(false);
  const [showStartDialog, setShowStartDialog] = React.useState(false);

  const handleClickOpen = (type) => {
    setOpen(true);
    setPopupType(type);
  };

  const handleSnackbarClose = (event, reason) => {
    setIsAccepted(false);
  };

  const handleClose = () => {
    setOpen(false);
    setPopupType(null);
  };

  // Discount popup handlers
  const handleDiscountOpen = () => {
    setDiscountOpen(true);
  };

  const handleDiscountClose = () => {
    setDiscountOpen(false);
  };

  const endpoint = `/api/v1/admin/bookings/approve`;
  const detailendpoint = `/api/v1/hourly-charter-books/${hourlyCharterBookId}`;

  const {
    data: response,
    isLoading: isLoadingGet,
    isError: isErrorGet,
    isFetching: isFetchingTax,
    error: errorGet,
  } = useGetData(detailendpoint, { enabled: !!hourlyCharterBookId });

  const hourlyLedgerType = adminApproveBookingType("HOURLY");

  const { paymentStatus: livePaymentStatus } = useBookingPaymentRealtime({
    travelType: "Hourly",
    bookingId: hourlyCharterBookId,
    initialPaymentStatus: response?.paymentStatus || paymentStatus,
    admin: true,
    enabled: !!hourlyCharterBookId,
  });
  const displayPaymentStatus = livePaymentStatus || response?.paymentStatus || paymentStatus;
  const displayBookingStatus = response?.bookingStatus || bookingStatus;

  const { takePayment, takingPayment, canTake, hint: takePaymentHint } =
    useAdminTakePayment({
      bookingId: hourlyCharterBookId,
      bookingType: hourlyLedgerType,
      paymentStatus: displayPaymentStatus,
      bookingStatus: displayBookingStatus,
    });

  // Live status polling
  const fetchLiveStatus = React.useCallback(async () => {
    if (!hourlyCharterBookId) return;
    try {
      const res = await BACKEND_API.get(
        `/api/v1/hourly-charter-books/${hourlyCharterBookId}/live-status`,
        authHeader()
      );
      setLiveStatus(res.data);
    } catch (_) {}
  }, [hourlyCharterBookId]);

  useEffect(() => {
    if (displayBookingStatus === 'EN_ROUTE') {
      fetchLiveStatus();
      const id = setInterval(fetchLiveStatus, 15000);
      return () => clearInterval(id);
    }
  }, [displayBookingStatus, fetchLiveStatus]);

  // Trip action handlers
  const handleStartTrip = async () => {
    setTripLoading(true);
    try {
      await BACKEND_API.patch(
        `/api/v1/hourly-charter-books/${hourlyCharterBookId}/start-trip`,
        { convertToLive },
        authHeader()
      );
      toast.success(convertToLive ? 'Trip started as live meter!' : 'Trip started!');
      setShowStartDialog(false);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to start trip');
    } finally { setTripLoading(false); }
  };

  const handleExtendLive = async () => {
    if (!window.confirm('Activate live meter extension? The original fixed fare will be locked and additional time billed at the live rate.')) return;
    setTripLoading(true);
    try {
      await BACKEND_API.patch(
        `/api/v1/hourly-charter-books/${hourlyCharterBookId}/extend-live`,
        {},
        authHeader()
      );
      toast.success('Live meter extension activated!');
      fetchLiveStatus();
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to extend');
    } finally { setTripLoading(false); }
  };

  const handleEndTrip = async () => {
    if (!window.confirm('End trip and finalize billing?')) return;
    setTripLoading(true);
    try {
      const res = await BACKEND_API.patch(
        `/api/v1/hourly-charter-books/${hourlyCharterBookId}/end-trip`,
        {},
        authHeader()
      );
      toast.success(`Trip ended! Total: $${Number(res.data.totalTripFeeInDollars).toFixed(2)}`);
      fetchLiveStatus();
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to end trip');
    } finally { setTripLoading(false); }
  };

  if (!hourlyCharterBookId) {
    navigate('/dashboard/hourly-charter-books', { state: { error: 'Hourly booking ID not provided.' } });
    return null;
  }

  const handleAcceptBook = async () => {
    try {
      const response = await BACKEND_API.post(endpoint, {
        bookingId: hourlyCharterBookId,
        bookingType: hourlyLedgerType,
        action: "ACCEPTED",
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(response?.data?.message || `Book Updated successfully!`, {
          autoClose: 6000,
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || " Network error...", {});
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPayment = takePayment;

  const getBackgroundColorforpayment = (status) => getPaymentStatusBackgroundColor(status);

  const getBackgroundColorforbooking = (bookingStatus) => {
    switch (bookingStatus) {
      case "ACCEPTED":
        return "green";
      case "COMPLETED":
        return "green";
      case "CANCELLED":
        return "red";
      case "REJECTED":
        return "red";
      default:
        return "orange";
    }
  };

  const Field = ({ label, value, direction = { xs: "column", sm: "row" }, sx }) => {
    return (
      <Grid item xs={12} md={6}>
        <Stack
          direction={direction}
          justifyContent={{ xs: "center", sm: "space-between" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ backgroundColor: "#EEE", padding: 2, borderRadius: 2, flexGrow: 1, ...sx }}
        >
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "16px", md: "20px" },
              marginBottom: { xs: 1, sm: 0 },
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "16px", md: "20px" },
              wordBreak: "break-word",
              textAlign: { xs: "left", sm: "right" },
            }}
          >
            {value}
          </Typography>
        </Stack>
      </Grid>
    );
  };

  // Function to render description with proper formatting
  const renderDescription = (description) => {
    if (!description) return 'N/A';

    return (
      <Box sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {description}
      </Box>
    );
  };

  const formatDateToPacific = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      }).format(date);
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  };

  // Determine billing mode colour
  const billingModeColor = response?.billingMode === 'LIVE' ? '#60a5fa' : '#c4b5fd';

  return (
    <Grid
      container
      justifyContent={"center"}
      alignItems={"center"}
      spacing={3}
      sx={{ p: { xs: 2, md: 3 } }}
    >
      <Grid item xs={12} md={10} lg={9}>
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}
          >
            Hourly Booking Details
          </Typography>

          {/* Discount Information Display */}
          {response?.hasDiscountApplied && (
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    backgroundColor: '#e3f2fd',
                    border: '2px solid #1976d2',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    💰 Discount Applied
                  </Typography>
                  {parseFloat(response?.promoDiscountAmountInDollars || 0) > 0 && (
                    <Typography variant="body1">
                      Promo Discount: <strong>${response?.promoDiscountAmountInDollars}</strong>
                    </Typography>
                  )}
                  {parseFloat(response?.discountAmountInDollars || 0) > 0 && (
                    <Typography variant="body1">
                      Manual Discount: <strong>${response?.discountAmountInDollars}</strong>
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                    Original Total: ${(
                      parseFloat(response?.totalTripFeeInDollars || 0) +
                      parseFloat(response?.promoDiscountAmountInDollars || 0) +
                      parseFloat(response?.discountAmountInDollars || 0)
                    ).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    New Total: <strong>${response?.totalTripFeeInDollars}</strong>
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}

          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  color: "white",
                  backgroundColor: getBackgroundColorforpayment(displayPaymentStatus),
                  border: "1px solid",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  textAlign: "center",
                  fontSize: { xs: "16px", md: "18px" },
                  fontWeight: "bold",
                }}
              >
                Payment Status: {displayPaymentStatus}
                {response?.hasDiscountApplied && " (Discount Applied)"}
              </Box>
            </Grid>
            {takePaymentHint && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
                  {takePaymentHint}
                </Typography>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  color: "white",
                  backgroundColor: getBackgroundColorforbooking(response?.bookingStatus || bookingStatus),
                  border: "1px solid",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  textAlign: "center",
                  fontSize: { xs: "16px", md: "18px" },
                  fontWeight: "bold",
                }}
              >
                Booking Status: {response?.bookingStatus || bookingStatus}
              </Box>
            </Grid>
          </Grid>

          {/* ─────────────────────────────────────────────────────────────
              TRIP CONTROLS SECTION
          ───────────────────────────────────────────────────────────── */}
          <Paper
            elevation={0}
            sx={{
              mb: 4,
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'linear-gradient(135deg, #0f1628 0%, #1a1a2e 100%)',
            }}
          >
            {/* Loading bar */}
            {tripLoading && (
              <LinearProgress
                sx={{
                  height: 3,
                  '& .MuiLinearProgress-bar': { backgroundColor: billingModeColor },
                }}
              />
            )}

            <Box sx={{ p: { xs: 2, md: 3 } }}>
              {/* Section header */}
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                <Box
                  sx={{
                    width: 4,
                    height: 28,
                    borderRadius: 1,
                    backgroundColor: billingModeColor,
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: '#f1f5f9', letterSpacing: 0.5 }}
                >
                  Trip Controls
                </Typography>
              </Stack>

              {/* Billing Mode + Live Status chip row */}
              <Stack direction="row" flexWrap="wrap" gap={1} mb={2.5}>
                {response?.billingMode && (
                  <Chip
                    label={response.billingMode}
                    size="small"
                    sx={{
                      backgroundColor: `${billingModeColor}22`,
                      color: billingModeColor,
                      border: `1px solid ${billingModeColor}55`,
                      fontWeight: 700,
                      letterSpacing: 0.5,
                    }}
                  />
                )}
                {liveStatus?.mode === 'EXTENDED' && (
                  <Chip
                    label="⚡ Extended"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(196,181,253,0.15)',
                      color: '#c4b5fd',
                      border: '1px solid rgba(196,181,253,0.35)',
                      fontWeight: 700,
                    }}
                  />
                )}
                {liveStatus?.mode === 'CONVERTED' && (
                  <Chip
                    label="↔ Converted"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(96,165,250,0.15)',
                      color: '#60a5fa',
                      border: '1px solid rgba(96,165,250,0.35)',
                      fontWeight: 700,
                    }}
                  />
                )}
                {response?.liveExtensionStartedAt && (
                  <Chip
                    label="Live Extending"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(251,191,36,0.15)',
                      color: '#fbbf24',
                      border: '1px solid rgba(251,191,36,0.35)',
                      fontWeight: 700,
                    }}
                  />
                )}
                {displayBookingStatus && (
                  <Chip
                    label={displayBookingStatus}
                    size="small"
                    sx={{
                      backgroundColor:
                        displayBookingStatus === 'EN_ROUTE'
                          ? 'rgba(34,197,94,0.15)'
                          : displayBookingStatus === 'ACCEPTED'
                          ? 'rgba(251,191,36,0.15)'
                          : 'rgba(255,255,255,0.08)',
                      color:
                        displayBookingStatus === 'EN_ROUTE'
                          ? '#4ade80'
                          : displayBookingStatus === 'ACCEPTED'
                          ? '#fbbf24'
                          : '#94a3b8',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontWeight: 600,
                    }}
                  />
                )}
              </Stack>

              {/* Live Status Info Card — visible when EN_ROUTE and liveStatus is loaded */}
              {displayBookingStatus === 'EN_ROUTE' && liveStatus && (
                <Box
                  sx={{
                    mb: 2.5,
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${billingModeColor}33`,
                    background: 'rgba(255,255,255,0.03)',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: '#94a3b8', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}
                  >
                    Live Meter
                  </Typography>
                  <Grid container spacing={1.5} mt={0.5}>
                    {liveStatus?.elapsedMinutes != null && (
                      <Grid item xs={6} sm={4}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: 'rgba(255,255,255,0.06)',
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" sx={{ color: '#f1f5f9', fontWeight: 700, lineHeight: 1 }}>
                            {liveStatus.elapsedMinutes}m
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            Elapsed
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {liveStatus?.extensionMinutes != null && (
                      <Grid item xs={6} sm={4}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: 'rgba(255,255,255,0.06)',
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" sx={{ color: '#c4b5fd', fontWeight: 700, lineHeight: 1 }}>
                            {liveStatus.totalElapsedMinutes ?? liveStatus.extensionMinutes}m
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            Total Time
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {liveStatus?.runningFare != null && (
                      <Grid item xs={6} sm={4}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: 'rgba(255,255,255,0.06)',
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" sx={{ color: '#4ade80', fontWeight: 700, lineHeight: 1 }}>
                            ${Number(liveStatus.runningFare).toFixed(2)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            Running Fare
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {liveStatus?.baseFare != null && (
                      <Grid item xs={6} sm={4}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: 'rgba(255,255,255,0.06)',
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" sx={{ color: '#60a5fa', fontWeight: 700, lineHeight: 1 }}>
                            ${Number(liveStatus.baseFare).toFixed(2)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            Base Fare
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {liveStatus?.extensionFare != null && (
                      <Grid item xs={6} sm={4}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: 'rgba(255,255,255,0.06)',
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" sx={{ color: '#fbbf24', fontWeight: 700, lineHeight: 1 }}>
                            ${Number(liveStatus.extensionFare).toFixed(2)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            Extension Fare
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2.5 }} />

              {/* Action Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap">
                {/* Start Trip — only when ACCEPTED */}
                {displayBookingStatus === 'ACCEPTED' && (
                  <Button
                    variant="contained"
                    disabled={tripLoading}
                    onClick={() => setShowStartDialog(true)}
                    sx={{
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      color: '#fff',
                      fontWeight: 700,
                      px: 3,
                      borderRadius: 2,
                      boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                        boxShadow: '0 6px 18px rgba(22,163,74,0.45)',
                      },
                      '&:disabled': { opacity: 0.5 },
                    }}
                  >
                    ▶ Start Trip
                  </Button>
                )}

                {/* Extend with Live Meter — EN_ROUTE + PRE_BOOKED + not yet extended */}
                {displayBookingStatus === 'EN_ROUTE' &&
                  response?.billingMode === 'PRE_BOOKED' &&
                  !response?.liveExtensionStartedAt && (
                    <Button
                      variant="contained"
                      disabled={tripLoading}
                      onClick={handleExtendLive}
                      sx={{
                        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                        color: '#fff',
                        fontWeight: 700,
                        px: 3,
                        borderRadius: 2,
                        boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)',
                          boxShadow: '0 6px 18px rgba(124,58,237,0.45)',
                        },
                        '&:disabled': { opacity: 0.5 },
                      }}
                    >
                      ⚡ Extend with Live Meter
                    </Button>
                  )}

                {/* End Trip — any EN_ROUTE status */}
                {displayBookingStatus === 'EN_ROUTE' && (
                  <Button
                    variant="contained"
                    disabled={tripLoading}
                    onClick={handleEndTrip}
                    sx={{
                      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                      color: '#fff',
                      fontWeight: 700,
                      px: 3,
                      borderRadius: 2,
                      boxShadow: '0 4px 14px rgba(220,38,38,0.35)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
                        boxShadow: '0 6px 18px rgba(220,38,38,0.45)',
                      },
                      '&:disabled': { opacity: 0.5 },
                    }}
                  >
                    ⏹ End Trip & Finalize
                  </Button>
                )}
              </Stack>
            </Box>
          </Paper>

          {/* Start Trip Dialog */}
          <Dialog
            open={showStartDialog}
            onClose={() => !tripLoading && setShowStartDialog(false)}
            PaperProps={{
              sx: {
                background: 'linear-gradient(135deg, #0f1628 0%, #1a1a2e 100%)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 3,
                color: '#f1f5f9',
                minWidth: { xs: '90vw', sm: 420 },
              },
            }}
          >
            <DialogTitle sx={{ fontWeight: 700, color: '#f1f5f9', pb: 1 }}>
              Start Trip
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                Confirm trip start for booking <strong style={{ color: '#f1f5f9' }}>{hourlyCharterBookId}</strong>.
              </Typography>
              {response?.billingMode === 'PRE_BOOKED' && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid rgba(196,181,253,0.25)',
                    bgcolor: 'rgba(196,181,253,0.07)',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={convertToLive}
                        onChange={(e) => setConvertToLive(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#c4b5fd' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#7c3aed',
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ color: '#f1f5f9', fontWeight: 600 }}>
                          Convert to Live Meter
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          Billing will switch from fixed pre-booked rate to live per-minute metering.
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
              <Button
                onClick={() => setShowStartDialog(false)}
                disabled={tripLoading}
                sx={{
                  color: '#94a3b8',
                  borderColor: 'rgba(255,255,255,0.15)',
                  '&:hover': { borderColor: 'rgba(255,255,255,0.3)', bgcolor: 'rgba(255,255,255,0.05)' },
                }}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartTrip}
                disabled={tripLoading}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  fontWeight: 700,
                  px: 3,
                  borderRadius: 2,
                  '&:disabled': { opacity: 0.5 },
                }}
              >
                {tripLoading ? 'Starting...' : 'Confirm Start'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* General Booking Details Section */}
          <Grid container spacing={2} mt={4} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3, backgroundColor: '#f9f9f9' }}>
            <Typography variant="h6" sx={{ ml: 2, mb: 1, fontWeight: 'bold', width: '100%' }}>
              General Booking Information:
            </Typography>
            <Grid container spacing={2} mt={1} pl={2} pr={2}>
              <Field label="Hourly Charter Book Id" value={hourlyCharterBookId} />
              {(response?.pickupPhysicalAddress || pickupPhysicalAddress) && <Field label="Pickup Physical Address" value={response?.pickupPhysicalAddress || pickupPhysicalAddress} />}
              {(response?.dropoffPhysicalAddress || dropoffPhysicalAddress) && <Field label="Dropoff Physical Address" value={response?.dropoffPhysicalAddress || dropoffPhysicalAddress} />}
              {response?.selectedHours && <Field label="Selected Hours" value={response?.selectedHours} />}
              {response?.occasion && <Field label="Occasion" value={response?.occasion} />}
              {response?.specialInstructions && <Field label="Special Instructions" value={response?.specialInstructions} />}
              {response?.bookingFor && <Field label="Booking For" value={response?.bookingFor} />}
              {(response?.pickupDateTime || pickupDateTime) && <Field label="Pickup Date Time" value={formatDateToPacific(response?.pickupDateTime || pickupDateTime)} />}
              {response?.isGuestBooking !== undefined && <Field label="Is Guest Booking" value={response.isGuestBooking.toString()} />}
              {(response?.passengerFullName || passengerFullName) && <Field label="Passenger Full Name" value={response?.passengerFullName || passengerFullName} />}
              {(response?.passengerCellPhone || passengerCellPhone) && <Field label="Passenger Cell Phone" value={response?.passengerCellPhone || passengerCellPhone} />}
              {(response?.passengerEmail || passengerEmail) && <Field label="Passenger Email" value={response?.passengerEmail || passengerEmail} />}
              {response?.numberOfPassengers && <Field label="Number Of Passengers" value={response?.numberOfPassengers} />}
              {response?.numberOfSuitcases !== undefined && <Field label="Number Of Suitcases" value={response?.numberOfSuitcases} />}
            </Grid>
          </Grid>

          {/* Financial Summary Section */}
          <Grid container spacing={2} mt={4} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3, backgroundColor: '#f9f9f9' }}>
          <Typography variant="h6" sx={{ ml: 2, mb: 1, fontWeight: 'bold', width: '100%', backgroundColor: 'black', color: 'white', padding: 2, borderRadius: 2 }}>
                  Fare Detail
            </Typography>
            <Grid container spacing={2} mt={1} pl={2} pr={2}>
              {/* Billing mode — always shown */}
              {response?.billingMode && (
                <Field label="Billing Mode" value={response.billingMode} />
              )}
              {/* Converted to live */}
              {response?.convertedToLiveAt && (
                <Field label="Billing Mode" value="Converted to Live at Start" />
              )}
              {/* Fixed base fare locked at extension time */}
              {response?.liveExtensionBaseFare && (
                <Field
                  label="Fixed Base Fare"
                  value={`$${response.liveExtensionBaseFare}`}
                />
              )}
              {/* Additional live extension charge */}
              {response?.liveExtensionFareInDollars > 0 && (
                <Field
                  label="Live Extension Charge"
                  value={`+$${response.liveExtensionFareInDollars}`}
                />
              )}
              {/* Calculate values */}
              {(() => {
                const fare = fareBreakdownFromBooking(response || {});
                if (!fare) {
                  return (
                    <Field
                      label="Total Fare"
                      value={`$${parseFloat(response?.totalTripFeeInDollars || totalTripFeeInDollars || 0).toFixed(2)}`}
                    />
                  );
                }
                return (
                  <>
                    <Field
                      label="Fare (hours × rate)"
                      value={`$${fare.carFare.toFixed(2)}`}
                    />
                    {response?.selectedHours != null && (
                      <Field
                        label="Hours"
                        value={String(response.selectedHours)}
                      />
                    )}
                    {fare.extraOptionsPrice > 0 && (
                      <Field
                        label="Extras"
                        value={`$${fare.extraOptionsPrice.toFixed(2)}`}
                      />
                    )}
                    {fare.gratuity > 0 && (
                      <Field
                        label="Gratuity"
                        value={`$${fare.gratuity.toFixed(2)} (${fare.gratuityPercentage}%)`}
                      />
                    )}
                    {fare.discount > 0 && (
                      <Field label="Discount" value={`-$${fare.discount.toFixed(2)}`} />
                    )}
                    <Field
                      label="Total Fare"
                      value={`$${fare.total.toFixed(2)}`}
                      sx={{
                        backgroundColor: '#6a6a6a',
                        color: 'white',
                        fontWeight: 'bold',
                        padding: 2,
                        borderRadius: 2,
                      }}
                    />
                  </>
                );
              })()}
            </Grid>
          </Grid>

          {/* Payment Details Section */}
          {response?.PaymentDetail && (
            <Grid container spacing={2} mt={4} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3, backgroundColor: '#f9f9f9' }}>
              <Typography variant="h6" sx={{ ml: 2, mb: 1, fontWeight: 'bold', width: '100%' }}>
                Payment Details:
              </Typography>
              <Grid container spacing={2} mt={1} pl={2} pr={2}>
                {response.PaymentDetail.creditCardNumber && <Field label="Credit Card Number" value={response.PaymentDetail.creditCardNumber} />}
                {response.PaymentDetail.expirationDate && <Field label="Expiration Date" value={response.PaymentDetail.expirationDate} />}
                {response.PaymentDetail.securityCode && <Field label="Security Code" value={response.PaymentDetail.securityCode} />}
                {response.PaymentDetail.zipCode && <Field label="Zip Code" value={response.PaymentDetail.zipCode} />}
                {response.PaymentDetail.cardOwnerName && <Field label="Card Owner Name" value={response.PaymentDetail.cardOwnerName} />}
              </Grid>
            </Grid>
          )}

          {/* Car Details Section */}
          {response?.Car && (
            <Grid container spacing={2} mt={4} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3, backgroundColor: '#f9f9f9' }}>
              <Typography variant="h6" sx={{ ml: 2, mb: 1, fontWeight: 'bold', width: '100%' }}>
                Car Details:
              </Typography>
              <Grid container spacing={2} mt={1} pl={2} pr={2}>
                {response.Car.carId && <Field label="Car Id" value={response.Car.carId} />}
                {response.Car.carName && <Field label="Car Name" value={response.Car.carName} />}
                {response.Car.pricePerMile && <Field label="Price Per Mile" value={`$${response.Car.pricePerMile}`} />}
                {response.Car.pricePerHour && <Field label="Price Per Hour" value={`$${response.Car.pricePerHour}`} />}
                {response.Car.minimumStartFee && <Field label="Minimum Start Fee" value={`$${response.Car.minimumStartFee}`} />}
                {response.Car.currency && <Field label="Currency" value={response.Car.currency} />}
                {response.Car.engineType && <Field label="Engine Type" value={response.Car.engineType} />}
                {response.Car.length && <Field label="Length" value={response.Car.length} />}
                {response.Car.interiorColor && <Field label="Interior Color" value={response.Car.interiorColor} />}
                {response.Car.exteriorColor && <Field label="Exterior Color" value={response.Car.exteriorColor} />}
                {response.Car.power && <Field label="Power" value={response.Car.power} />}
                {response.Car.transmissionType && <Field label="Transmission Type" value={response.Car.transmissionType} />}
                {response.Car.fuelType && <Field label="Fuel Type" value={response.Car.fuelType} />}
              </Grid>
            </Grid>
          )}

          {/* Enhanced Extra Options Section */}
          <Grid container item xs={12} spacing={2} mt={4} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3, backgroundColor: '#f9f9f9' }}>
            <Typography variant="h6" sx={{ ml: 2, mb: 2, fontWeight: 'bold', width: '100%' }}>
              Extra Options:
            </Typography>
            {response?.ExtraOptions && response.ExtraOptions.length > 0 ? (
              <Grid container spacing={3} mb={3}>
                {response.ExtraOptions.map((option, index) => (
                  <Grid item xs={12} md={6} key={option.extraOptionId || index}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        height: '100%',
                        border: '1px solid #d0d0d0',
                        borderRadius: 2,
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {option.name || `Extra Option ${index + 1}`}
                        </Typography>
                        <Chip
                          label={`ID: ${option.extraOptionId}`}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                            Description:
                          </Typography>
                          <Box
                            sx={{
                              mt: 1,
                              p: 1.5,
                              backgroundColor: '#f5f5f5',
                              borderRadius: 1,
                              border: '1px solid #e0e0e0',
                              minHeight: '60px'
                            }}
                          >
                            {renderDescription(option.description)}
                          </Box>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                            Price:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                            ${option.pricePerItem || '0.00'}
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                            Quantity:
                          </Typography>
                          <Typography variant="body1">
                            {option.HourlyCharterBookExtraOption?.quantity || option.quantity || 1}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper elevation={1} sx={{ p: 3, textAlign: 'center', backgroundColor: '#e8e8e8', border: '1px dashed #c0c0c0' }}>
                <Typography variant="body1" color="text.secondary">
                  No extra options selected for this booking.
                </Typography>
              </Paper>
            )}
          </Grid>

          <Grid container justifyContent="center" spacing={2} mt={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#03930a",
                  color: "white",
                  "&:hover": { backgroundColor: "#027c08" },
                }}
                fullWidth
                onClick={handleAcceptBook}
              >
                ACCEPT BOOKING
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "red",
                  color: "white",
                  "&:hover": { backgroundColor: "#d32f2f" },
                }}
                fullWidth
                onClick={() => handleClickOpen("REJECT")}
              >
                REJECT BOOKING
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                color="warning"
                fullWidth
                onClick={() => handleClickOpen("EDIT_BOOKING_STATUS")}
              >
                EDIT BOOKING STATUS
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#03930a",
                  color: "white",
                  "&:hover": { backgroundColor: "#027c08" },
                }}
                fullWidth
                onClick={handleAcceptPayment}
                disabled={!canTake || takingPayment}
              >
                {takingPayment ? "CAPTURING…" : "TAKE PAYMENT"}
              </Button>
            </Grid>

            {/* New Discount Button */}
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: response?.hasDiscountApplied ? "#6a1b9a" : "#1976d2",
                  color: "white",
                  "&:hover": {
                    backgroundColor: response?.hasDiscountApplied ? "#4a148c" : "#1565c0"
                  },
                }}
                fullWidth
                onClick={handleDiscountOpen}
                disabled={response?.paymentStatus === "PAID"}
              >
                {response?.hasDiscountApplied ? "UPDATE DISCOUNT" : "APPLY DISCOUNT"}
              </Button>
            </Grid>
          </Grid>

          {popupType === "REJECT" && (
            <ReasonPopup
              bookingId={hourlyCharterBookId}
              bookingType={hourlyLedgerType}
              open={open}
              handleClose={handleClose}
            />
          )}

          {popupType === "EDIT_BOOKING_STATUS" && (
            <BookingStatusPoup
              bookingId={hourlyCharterBookId}
              bookingType="hourlyCharter"
              open={open}
              handleClose={handleClose}
            />
          )}

          {/* Discount Popup */}
          <DiscountPopup
            bookingId={hourlyCharterBookId}
            bookingType={hourlyLedgerType}
            open={discountOpen}
            handleClose={handleDiscountClose}
          />

          <ToastContainer position="top-center" />
        </Paper>
      </Grid>
    </Grid>
  );
}

export default ViewHourlyBookDetail;
