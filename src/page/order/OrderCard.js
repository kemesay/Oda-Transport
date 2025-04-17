import * as React from "react";
import { styled } from "@mui/material/styles";
import {
  Card,
  Collapse,
  IconButton,
  CardActions,
  CardContent,
  CardMedia,
  Stack,
  Typography,
  Chip,
  Box,
  Divider,
  Button,
} from "@mui/material";
import { 
  MdExpandMore, MdAccessTime, MdLocationOn, MdPerson, 
  MdFlight, MdConfirmationNumber, MdPayments, MdEmail, MdPhone,
  MdDescription, MdAddLocation, MdSchedule, MdEventAvailable,
} from "react-icons/md";
import { useNavigate } from 'react-router-dom';

const PAYMENT_STATUS_COLORS = {
  NOT_PAID: '#FF4B55', // Bright red
  AWAITING_PAYMENT: '#FFA726', // Orange
  PARTIALLY_PAID: '#42A5F5', // Light blue
  PAID: '#03930A', // Green
  PENDING_REFUND: '#AB47BC', // Purple
  REFUNDED: '#26A69A', // Teal
  CANCELLED: '#78909C' // Blue grey
};

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

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
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
    confirmationNumber,
    totalTripFeeInDollars,
    bookingStatus,
    travelType,
    tripType,
    numberOfPassengers,
    pickupDateTime,
    returnPickupDateTime,
    distanceInMiles,
    passengerFullName,
    passengerCellPhone,
    passengerEmail,
    bookingFor,
    specialInstructions,
    paymentStatus,
    createdAt,
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
    numberOfSuitcases,
    Car,
  } = props.order;

  const [expanded, setExpanded] = React.useState(false);
  const navigate = useNavigate();

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
              label={paymentStatus}
              size="small"
              sx={{
                backgroundColor: PAYMENT_STATUS_COLORS[paymentStatus],
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
        image={Car.carImageUrl}
        title={Car.name}
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
      </CardContent>

      <Divider sx={{ margin: '0 16px' }} />

      <CardActions disableSpacing>
        {/* <ActionButton
          startIcon={<MdEdit />}
          onClick={handleUpdateBooking}
          disabled={bookingStatus === 'cancelled'}
        >
          Update Booking
        </ActionButton> */}
        <Typography variant="body2" color="text.secondary">
          View Details
        </Typography>
        <ExpandMore
          expand={expanded}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label="show more"
          sx={{ color: '#03930A' }}
        >
          <MdExpandMore />
        </ExpandMore>
      </CardActions>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Stack spacing={3}>
            {renderCommonDetails()}
            {renderContactDetails()}
            {renderTravelDetails()}
          </Stack>
        </CardContent>
      </Collapse>
    </StyledCard>
  );
}