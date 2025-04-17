import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { 
  Box, 
  Grid, 
  CircularProgress, 
  Alert, 
  Typography, 
  Container, 
  Fade,
  Tabs,
  Tab,
  Paper,
  Badge,
  Chip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import OrderCard from "./OrderCard";
import { useDispatch, useSelector } from "react-redux";
import { getPassengerBooks } from "../../store/actions/bookActions";
import { styled } from "@mui/material/styles";
import { MdFlight, MdAccessTime, MdLocationOn } from "react-icons/md";

// Styled components
const PageWrapper = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4, 2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(5, 3),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(6, 4),
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    backgroundColor: '#03930A',
    height: 3,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  minHeight: 64,
  padding: theme.spacing(2, 3),
  '&.Mui-selected': {
    color: '#03930A',
  },
}));

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 0),
}));

const NoBookingsMessage = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  textAlign: 'center',
  backgroundColor: 'rgba(3, 147, 10, 0.02)',
  borderRadius: theme.spacing(2),
}));

function Order() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const [searchParams] = useSearchParams();
  const bookingType = searchParams.get('type') || 'current';
  
  const {
    passengerBooks,
    isGetPassengerBookLoading,
    isGetPassengerBookError,
    getPassengerBookErrorMessage,
  } = useSelector((state) => state.bookReducer);

  useEffect(() => {
    dispatch(getPassengerBooks());
  }, []);

  // Filter bookings based on status
  const filterBookings = (books, type) => {
    if (!books) return [];
    return books.filter(book => {
      if (type === 'history') {
        return book.bookingStatus === 'COMPLETED';
      }
      return book.bookingStatus !== 'COMPLETED';
    });
  };

  // Group bookings by travel type and booking status
  const groupedBookings = {
    airport: filterBookings(
      passengerBooks?.filter(book => book.travelType === "Airport"),
      bookingType
    ),
    pointToPoint: filterBookings(
      passengerBooks?.filter(book => book.travelType === "Point To Point"),
      bookingType
    ),
    hourly: filterBookings(
      passengerBooks?.filter(book => book.travelType === "Hourly"),
      bookingType
    ),
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const TabIcon = ({ type, count }) => (
    <Badge 
      badgeContent={count} 
      color="primary"
      sx={{ 
        '& .MuiBadge-badge': {
          backgroundColor: '#03930A',
          color: 'white',
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {type === 'Airport' && <MdFlight size={20} />}
        {type === 'Hourly' && <MdAccessTime size={20} />}
        {type === 'Point To Point' && <MdLocationOn size={20} />}
        <span>{type}</span>
      </Box>
    </Badge>
  );

  const renderBookings = (bookings) => {
    if (bookings.length === 0) {
      return (
        <NoBookingsMessage type={bookingType} />
      );
    }

    return (
      <Grid container spacing={3}>
        {bookings.map((order) => (
          <Grid
            key={order.bookId}
            item
            xs={12}
            sm={6}
            md={4}
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <OrderCard order={order} />
          </Grid>
        ))}
      </Grid>
    );
  };

  // Add a title based on booking type
  const getPageTitle = () => {
    return bookingType === 'history' ? 'Booking History' : 'Current Bookings';
  };

  if (isGetPassengerBookLoading) {
    return (
      <PageWrapper maxWidth="xl">
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '60vh' 
          }}
        >
          <CircularProgress sx={{ color: "#03930A" }} />
        </Box>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          fontWeight="600"
          color="#03930A"
        >
          {getPageTitle()}
        </Typography>
        
        {/* Add a status legend for better UX */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {bookingType === 'current' ? (
            <>
              <Chip 
                label="Active" 
                size="small" 
                sx={{ bgcolor: '#03930A', color: 'white' }} 
              />
              <Chip 
                label="Pending" 
                size="small" 
                sx={{ bgcolor: '#FFA726', color: 'white' }} 
              />
            </>
          ) : (
            <Chip 
              label="Completed" 
              size="small" 
              sx={{ bgcolor: '#03930A', color: 'white' }} 
            />
          )}
        </Box>
      </Box>

      {isGetPassengerBookError && (
        <Fade in={true}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {getPassengerBookErrorMessage}
          </Alert>
        </Fade>
      )}

      <Paper elevation={0} sx={{ backgroundColor: 'transparent' }}>
        <StyledTabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <StyledTab 
            label={
              <TabIcon 
                type="Airport" 
                count={groupedBookings.airport.length}
              />
            }
          />
          <StyledTab 
            label={
              <TabIcon 
                type="Point To Point" 
                count={groupedBookings.pointToPoint.length}
              />
            }
          />
          <StyledTab 
            label={
              <TabIcon 
                type="Hourly" 
                count={groupedBookings.hourly.length}
              />
            }
          />
        </StyledTabs>

        <AnimatePresence mode="wait">
          <TabPanel hidden={activeTab !== 0}>
            {renderBookings(groupedBookings.airport)}
          </TabPanel>
          <TabPanel hidden={activeTab !== 1}>
            {renderBookings(groupedBookings.pointToPoint)}
          </TabPanel>
          <TabPanel hidden={activeTab !== 2}>
            {renderBookings(groupedBookings.hourly)}
          </TabPanel>
        </AnimatePresence>
      </Paper>
    </PageWrapper>
  );
}

export default Order;