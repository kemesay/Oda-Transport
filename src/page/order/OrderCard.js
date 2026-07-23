import * as React from "react";
import { styled } from "@mui/material/styles";
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Stack,
  Typography,
  Chip,
  Box,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import {
  MdAccessTime, MdLocationOn, MdPerson,
  MdFlight, MdConfirmationNumber, MdPayments, MdEmail, MdPhone,
  MdDescription, MdAddLocation, MdSchedule, MdEventAvailable,
  MdElectricBolt, MdTimer,
} from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { PAYMENT_STATUS_COLORS } from '../../constants/paymentStatusColors';
import useBookingPaymentRealtime from '../../hooks/useBookingPaymentRealtime';
import BACKEND_API from '../../store/utils/API';
import { authHeader } from '../../util/authUtil';
import defaultCarImage from '../../assets/images/car.png';

const BOOKING_STATUS_COLORS = {
  PENDING_APPROVAL: '#FFA726', // Orange
  UNDER_REVIEW: '#42A5F5', // Light blue
  ACCEPTED: '#43A047', // Green
  REJECTED: '#FF4B55', // Bright red
  CANCELLED: '#78909C', // Blue grey
  AWAITING_PICKUP: '#FFD54F', // Amber
  PICKUP_COMPLETED: '#26C6DA', // Cyan
  EN_ROUTE: '#7CB342', // Light green
  AWAITING_RETURN_PICKUP: '#FFB74D', // Orange lighter
  RETURN_PICKUP_COMPLETED: '#4DB6AC', // Teal lighter
  OVERDUE: '#EF5350', // Red lighter
  DISPUTED: '#EC407A', // Pink
  COMPLETED: '#03930A' // Green darker
};

const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  borderRadius: '12px',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
}));

const StatusChip = styled(Chip)(({ status, theme }) => ({
  position: 'absolute',
  top: '12px',
  right: '12px',
  zIndex: 1,
  backgroundColor: BOOKING_STATUS_COLORS[status] || '#78909C',
  color: '#fff',
  fontWeight: 600,
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
}));

const PriceTag = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '12px',
  right: '12px',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  padding: '8px 16px',
  borderRadius: '20px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  backdropFilter: 'blur(4px)',
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  backgroundColor: 'rgba(3, 147, 10, 0.05)',
  marginBottom: theme.spacing(1),
}));

const DetailSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: 'rgba(3, 147, 10, 0.02)',
  borderRadius: theme.spacing(1),
}));

const DetailTitle = styled(Typography)(({ theme }) => ({
  color: '#03930A',
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  borderBottom: '1px solid rgba(3, 147, 10, 0.1)',
  paddingBottom: theme.spacing(1),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginRight: theme.spacing(1),
  backgroundColor: 'rgba(3, 147, 10, 0.08)',
  color: '#03930A',
  '&:hover': {
    backgroundColor: 'rgba(3, 147, 10, 0.15)',
  },
}));

export default function OrderCard(props) {
  const {
    bookId,
    confirmationNumber,
    totalTripFeeInDollars,
    bookingStatus,
    travelType,
    tripType,
    numberOfPassengers,
    pickupDateTime,
    distanceInMiles,
    passengerFullName,
    passengerCellPhone,
    passengerEmail,
    bookingFor,
    specialInstructions,
    paymentStatus,
    pickupPhysicalAddress,
    dropoffPhysicalAddress,
    additionalStopOnTheWayDescription,
    accommodationAddress,
    airline,
    arrivalFlightNumber,
    returnAirline,
    returnFlightNumber,
    selectedHours,
    occasion,
    // Car can legitimately be null: it's a soft-deleted / retired vehicle
    // whose past bookings still need to render (backend should now keep
    // resolving it, but never trust that a nested relation is present).
    Car: car,
  } = props.order;
  const carImageUrl = car?.carImageUrl || defaultCarImage;
  const carName = car?.carName || 'Vehicle';

  const { paymentStatus: livePaymentStatus } = useBookingPaymentRealtime({
    travelType,
    bookingId: bookId,
    initialPaymentStatus: paymentStatus,
    enabled: Boolean(bookId && travelType),
  });
  const displayPaymentStatus = livePaymentStatus || paymentStatus;

  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const navigate = useNavigate();

  // Live status polling for EN_ROUTE Hourly bookings
  const [liveStatus, setLiveStatus] = React.useState(null);
  const isLiveHourly = travelType === 'Hourly' && bookingStatus === 'EN_ROUTE';
  const { hourlyCharterBookId } = props.order;

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

  React.useEffect(() => {
    if (isLiveHourly) {
      fetchLiveStatus();
      const id = setInterval(fetchLiveStatus, 15000);
      return () => clearInterval(id);
    }
  }, [isLiveHourly, fetchLiveStatus]);

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'Not specified';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderCommonDetails = () => (
    <DetailSection>
      <DetailTitle variant="subtitle1">Booking Information</DetailTitle>
      <Stack spacing={1.5}>
        <InfoItem>
          <MdConfirmationNumber color="#03930A" size={20} />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Confirmation Number
            </Typography>
            <Typography variant="body2" fontWeight="600">
              {confirmationNumber}
            </Typography>
          </Box>
        </InfoItem>

        <InfoItem>
          <MdPayments color="#03930A" size={20} />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Payment Status
            </Typography>
            <Chip
              label={displayPaymentStatus}
              size="small"
              sx={{
                backgroundColor: PAYMENT_STATUS_COLORS[displayPaymentStatus] || '#78909C',
                color: '#fff',
                fontWeight: 500,
              }}
            />
          </Box>
        </InfoItem>

        <InfoItem>
          <MdDescription color="#03930A" size={20} />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Special Instructions
            </Typography>
            <Typography variant="body2">
              {specialInstructions || 'None'}
            </Typography>
          </Box>
        </InfoItem>
      </Stack>
    </DetailSection>
  );

  const renderContactDetails = () => (
    <DetailSection>
      <DetailTitle variant="subtitle1">Contact Information</DetailTitle>
      <Stack spacing={1.5}>
        <InfoItem>
          <MdPerson color="#03930A" size={20} />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Passenger Details
            </Typography>
            <Typography variant="body2" fontWeight="600">
              {passengerFullName} ({bookingFor})
            </Typography>
          </Box>
        </InfoItem>

        <InfoItem>
          <MdPhone color="#03930A" size={20} />
          <Typography variant="body2">
            {passengerCellPhone}
          </Typography>
        </InfoItem>

        <InfoItem>
          <MdEmail color="#03930A" size={20} />
          <Typography variant="body2">
            {passengerEmail}
          </Typography>
        </InfoItem>
      </Stack>
    </DetailSection>
  );

  const renderTravelDetails = () => {
    switch(travelType) {
      case "Airport":
        return (
          <DetailSection>
            <DetailTitle variant="subtitle1">Flight Details</DetailTitle>
            <Stack spacing={1.5}>
              <InfoItem>
                <MdFlight color="#03930A" size={20} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Outbound Flight
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {airline} - {arrivalFlightNumber}
                  </Typography>
                </Box>
              </InfoItem>

              {returnAirline && (
                <InfoItem>
                  <MdFlight color="#03930A" size={20} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Return Flight
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      {returnAirline} - {returnFlightNumber}
                    </Typography>
                  </Box>
                </InfoItem>
              )}

              <InfoItem>
                <MdLocationOn color="#03930A" size={20} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Accommodation
                  </Typography>
                  <Typography variant="body2">
                    {accommodationAddress}
                  </Typography>
                </Box>
              </InfoItem>
            </Stack>
          </DetailSection>
        );

      case "Hourly":
        return (
          <DetailSection>
            <DetailTitle variant="subtitle1">Service Details</DetailTitle>
            <Stack spacing={1.5}>
              <InfoItem>
                <MdSchedule color="#03930A" size={20} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {selectedHours} Hours
                  </Typography>
                </Box>
              </InfoItem>

              <InfoItem>
                <MdEventAvailable color="#03930A" size={20} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Occasion
                  </Typography>
                  <Typography variant="body2">
                    {occasion}
                  </Typography>
                </Box>
              </InfoItem>

              {props.order.liveExtensionBaseFare && (
                <InfoItem sx={{ bgcolor: 'rgba(196,181,253,0.1)', border: '1px solid rgba(196,181,253,0.3)' }}>
                  <MdElectricBolt color="#c4b5fd" size={20} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Base Fare (Fixed)</Typography>
                    <Typography variant="body2" fontWeight="600" color="#7c3aed">
                      ${Number(props.order.liveExtensionBaseFare).toFixed(2)}
                    </Typography>
                  </Box>
                </InfoItem>
              )}
              {props.order.liveExtensionFareInDollars > 0 && (
                <InfoItem sx={{ bgcolor: 'rgba(196,181,253,0.1)', border: '1px solid rgba(196,181,253,0.3)' }}>
                  <MdElectricBolt color="#c4b5fd" size={20} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Live Extension Charge</Typography>
                    <Typography variant="body2" fontWeight="600" color="#7c3aed">
                      +${Number(props.order.liveExtensionFareInDollars).toFixed(2)}
                    </Typography>
                  </Box>
                </InfoItem>
              )}
              {props.order.billingMode && (
                <InfoItem>
                  <MdElectricBolt color="#03930A" size={20} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Billing Mode</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {props.order.billingMode === 'LIVE' ? 'Live Meter' : props.order.billingMode === 'PRE_BOOKED' ? 'Fixed Rate' : props.order.billingMode}
                      {props.order.convertedToLiveAt ? ' (Converted at Start)' : ''}
                    </Typography>
                  </Box>
                </InfoItem>
              )}
            </Stack>
          </DetailSection>
        );

      case "Point To Point":
        return (
          <DetailSection>
            <DetailTitle variant="subtitle1">Journey Details</DetailTitle>
            <Stack spacing={1.5}>
              <InfoItem>
                <MdLocationOn color="#03930A" size={20} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Pickup Location
                  </Typography>
                  <Typography variant="body2">
                    {pickupPhysicalAddress}
                  </Typography>
                </Box>
              </InfoItem>

              <InfoItem>
                <MdLocationOn color="#03930A" size={20} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Dropoff Location
                  </Typography>
                  <Typography variant="body2">
                    {dropoffPhysicalAddress}
                  </Typography>
                </Box>
              </InfoItem>

              {additionalStopOnTheWayDescription && (
                <InfoItem>
                  <MdAddLocation color="#03930A" size={20} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Additional Stop
                    </Typography>
                    <Typography variant="body2">
                      {additionalStopOnTheWayDescription}
                    </Typography>
                  </Box>
                </InfoItem>
              )}
            </Stack>
          </DetailSection>
        );
      default:
        return null;
    }
  };

  const handleUpdateBooking = () => {
    navigate('/update-booking', { 
      state: { 
        bookingData: props.order,
        isUpdate: true 
      } 
    });
  };

  const isCompleted = bookingStatus === 'COMPLETED';

  return (
    <StyledCard
      sx={{
        opacity: isCompleted ? 0.9 : 1,
        filter: isCompleted ? 'grayscale(20%)' : 'none',
      }}
    >
      <StatusChip
        label={bookingStatus}
        status={bookingStatus}
        size="small"
      />
      
      {isCompleted && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(3, 147, 10, 0.05)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}

      <CardMedia
        sx={{
          height: 200,
          position: 'relative',
        }}
        image={carImageUrl}
        title={carName}
      >
        <PriceTag>
          <Typography variant="h6" fontWeight="bold" color="#03930A">
            fee: ${totalTripFeeInDollars}
          </Typography>
        </PriceTag>
      </CardMedia>

      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            color: '#161F36',
            fontWeight: 600,
            borderBottom: '2px solid #03930A',
            paddingBottom: 1,
            marginBottom: 2,
          }}
        >
          {travelType} - {tripType}
        </Typography>

        <Stack spacing={2}>
          <InfoItem>
            <MdAccessTime color="#03930A" size={20} />
            <Typography variant="body2">
              pick-up Date Time: {formatDateTime(pickupDateTime)}
            </Typography>
          </InfoItem>

          <InfoItem>
            <MdPerson color="#03930A" size={20} />
            <Typography variant="body2">
              {numberOfPassengers} Passengers
            </Typography>
          </InfoItem>

          {travelType === "Airport" && (
            <>
              <InfoItem>
                <MdFlight color="#03930A" size={20} />
                <Box>
                  <Typography variant="body2" fontWeight="600">
                    {airline} - {arrivalFlightNumber}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {accommodationAddress}
                  </Typography>
                </Box>
              </InfoItem>
            </>
          )}

          {(travelType === "Airport" || travelType === "Point To Point") && (
            <InfoItem>
              <MdLocationOn color="#03930A" size={20} />
              <Typography variant="body2">
                {distanceInMiles.toFixed(2)} miles
              </Typography>
            </InfoItem>
          )}
        </Stack>

        {isLiveHourly && liveStatus && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              background: liveStatus.mode === 'EXTENDED'
                ? 'linear-gradient(135deg, #1e0a3c 0%, #2d1458 100%)'
                : liveStatus.mode === 'CONVERTED'
                ? 'linear-gradient(135deg, #0a1628 0%, #142040 100%)'
                : 'linear-gradient(135deg, #0a2010 0%, #143020 100%)',
              borderRadius: 2,
              border: `1px solid ${
                liveStatus.mode === 'EXTENDED' ? 'rgba(196,181,253,0.3)' :
                liveStatus.mode === 'CONVERTED' ? 'rgba(96,165,250,0.3)' :
                'rgba(3,147,10,0.3)'
              }`,
            }}
          >
            {/* Mode badge row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <MdElectricBolt color={
                liveStatus.mode === 'EXTENDED' ? '#c4b5fd' :
                liveStatus.mode === 'CONVERTED' ? '#60a5fa' : '#03930A'
              } size={18} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>
                Live Trip
              </Typography>
              {liveStatus.mode === 'EXTENDED' && (
                <Chip label="⚡ Extended" size="small" sx={{ bgcolor: 'rgba(196,181,253,0.2)', color: '#c4b5fd', border: '1px solid #c4b5fd', fontSize: 11 }} />
              )}
              {liveStatus.mode === 'CONVERTED' && (
                <Chip label="↔ Converted" size="small" sx={{ bgcolor: 'rgba(96,165,250,0.2)', color: '#60a5fa', border: '1px solid #60a5fa', fontSize: 11 }} />
              )}
            </Box>

            {/* Stats row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.07)', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>
                  <MdTimer size={12} /> {liveStatus.mode === 'EXTENDED' ? 'Total Time' : 'Elapsed'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700, fontFamily: 'monospace' }}>
                  {(() => {
                    const mins = liveStatus.mode === 'EXTENDED'
                      ? (liveStatus.totalElapsedMinutes ?? liveStatus.extensionMinutes ?? 0)
                      : (liveStatus.elapsedMinutes || 0);
                    return liveStatus.elapsedFormatted && liveStatus.mode !== 'EXTENDED'
                      ? liveStatus.elapsedFormatted
                      : `${Math.floor(mins / 60)}h ${mins % 60}m`;
                  })()}
                </Typography>
              </Box>
              <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.07)', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>Running Fare</Typography>
                <Typography variant="body2" sx={{ color: '#03930A', fontWeight: 700 }}>
                  ${Number(liveStatus.runningFare || 0).toFixed(2)}
                </Typography>
              </Box>
              {liveStatus.mode === 'EXTENDED' && liveStatus.baseFare != null && (
                <>
                  <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.07)', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>🔒 Base Fare</Typography>
                    <Typography variant="body2" sx={{ color: '#c4b5fd', fontWeight: 700 }}>${Number(liveStatus.baseFare).toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.07)', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>Extension</Typography>
                    <Typography variant="body2" sx={{ color: '#c4b5fd', fontWeight: 700 }}>+${Number(liveStatus.extensionFare || 0).toFixed(2)}</Typography>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        )}
      </CardContent>

      <Divider sx={{ margin: '0 16px' }} />

      <CardActions disableSpacing>
        <ActionButton
          onClick={handleUpdateBooking}
          disabled={isCompleted}
        >
          Update Booking
        </ActionButton>
        <Button
          variant="text"
          onClick={() => setIsDetailsOpen(true)}
          sx={{ color: '#03930A', fontWeight: 600 }}
        >
          View Details
        </Button>
      </CardActions>

      <Dialog
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ color: '#03930A', fontWeight: 700 }}>
          {travelType} Booking Details
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            {renderCommonDetails()}
            {renderContactDetails()}
            {renderTravelDetails()}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setIsDetailsOpen(false)} variant="outlined">
            Close
          </Button>
          <Button
            onClick={() => {
              setIsDetailsOpen(false);
              handleUpdateBooking();
            }}
            variant="contained"
            disabled={isCompleted}
            sx={{
              bgcolor: '#03930A',
              '&:hover': { bgcolor: '#027508' },
            }}
          >
            Update Booking
          </Button>
        </DialogActions>
      </Dialog>
    </StyledCard>
  );
}