import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, Receipt as OrderIcon,
} from '@mui/icons-material';
import { remote_host } from '../../globalVariable';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import {
  FlightTakeoff as FlightIcon,
  Schedule as HourlyIcon,
  Route as RouteIcon,
} from '@mui/icons-material';

const ResponsiveGrid = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    '& .MuiGrid-item': {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
}));

const ResponsiveCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
  },
  backgroundColor: 'rgba(3, 147, 10, 0.02)',
  border: '1px solid rgba(3, 147, 10, 0.08)',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 20px rgba(3, 147, 10, 0.1)',
  },
}));

const StatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  borderRadius: '8px',
  backgroundColor: '#fff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
}));

function UserProfile() {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [tempData, setTempData] = useState(null);
  const [totalRides, setTotalRides] = useState(0);
  const [showAlert, setShowAlert] = useState({ show: false, severity: 'success', message: '' });

  const defaultValues = {
    joinDate: "January 2024",
    preferredPayment: "VISA ending in 3681"
  };
  const [rideBreakdown, setRideBreakdown] = useState('');

  const [rideStats, setRideStats] = useState({
    total: 0,
    pointToPoint: 0,
    hourly: 0,
    airport: 0,
  });

  // Fetch user data and booking data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = sessionStorage.getItem('access_token');

        // Fetch user data
        const userResponse = await axios.get(
          `${remote_host}/api/v1/users/me`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        // Fetch booking data
        const bookingsResponse = await axios.get(
          `${remote_host}/api/v1/users/bookings/mine`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const {
          pointToPointBookings = [],
          hourlyCharterBookings = [],
          airportBookings = []
        } = bookingsResponse.data;

        // Calculate totals with breakdown
        const totalPointToPoint = pointToPointBookings.length;
        const totalHourly = hourlyCharterBookings.length;
        const totalAirport = airportBookings.length;

        const totalRides = totalPointToPoint + totalHourly + totalAirport;

        const rideSummary = `🚗 Total Rides: ${totalRides} — (🛣️ Point-to-Point: ${totalPointToPoint}, ⏱️ Hourly: ${totalHourly}, ✈️ Airport: ${totalAirport})`;

        // Format user data
        const formattedUserData = {
          name: userResponse.data.fullName || '',
          email: userResponse.data.email || '',
          phone: userResponse.data.phoneNumber || '',
          address: userResponse.data.address || '',
        };

        setUserData(formattedUserData);
        setTempData(formattedUserData);
        setTotalRides(totalRides);
        setRideBreakdown(rideSummary); // 👈 Create a state for this

        setRideStats({
          total: pointToPointBookings.length + hourlyCharterBookings.length + airportBookings.length,
          pointToPoint: pointToPointBookings.length,
          hourly: hourlyCharterBookings.length,
          airport: airportBookings.length,
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load user data. Please try again later.');
        setShowAlert({
          show: true,
          severity: 'error',
          message: 'Failed to load user data. Please try again later.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = () => {
    setTempData(userData);
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      const token = sessionStorage.getItem('access_token');

      // Prepare update payload
      const updatePayload = {
        fullName: tempData.name,
        email: tempData.email,
        phoneNumber: tempData.phone
      };

      // Make update request
      await axios.put(
        `${remote_host}/api/v1/users`,
        updatePayload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setUserData(tempData);
      setEditing(false);
      setShowAlert({
        show: true,
        severity: 'success',
        message: 'Profile updated successfully!'
      });

      // Hide alert after 3 seconds
      setTimeout(() => setShowAlert({ ...showAlert, show: false }), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setShowAlert({
        show: true,
        severity: 'error',
        message: 'Failed to update profile. Please try again.'
      });
    }
  };

  const handleCancel = () => {
    setTempData(userData);
    setEditing(false);
  };

  // Add this new component for ride statistics
  const RideStatistics = () => (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#03930A', fontWeight: 600, mb: 3 }}>
        Ride Statistics
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <StatsCard>
            <StatItem>
              <OrderIcon sx={{ color: '#03930A', fontSize: 28 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 400, color: '#03930A' }}>
                  {rideStats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Rides
                </Typography>
              </Box>
            </StatItem>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={4}>
          <StatsCard>
            <StatItem>
              <RouteIcon sx={{ color: '#000', fontSize: 24 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#03930A' }}>
                  {rideStats.pointToPoint}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Point-to-Point
                </Typography>
              </Box>
            </StatItem>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={4}>
          <StatsCard>
            <StatItem>
              <HourlyIcon sx={{ color: 'red', fontSize: 24 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#03930A' }}>
                  {rideStats.hourly}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hourly
                </Typography>
              </Box>
            </StatItem>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={4}>
          <StatsCard>
            <StatItem>
              <FlightIcon sx={{ color: 'cyan-blue', fontSize: 24 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#03930A' }}>
                  {rideStats.airport}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Airport
                </Typography>
              </Box>
            </StatItem>
          </StatsCard>
        </Grid>
      </Grid>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress sx={{ color: '#03930A' }} />
      </Box>
    );
  }

  if (error && !userData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }, 
      maxWidth: '100%',
      margin: '0 auto'
    }}>
      {showAlert.show && (
        <Alert severity={showAlert.severity} sx={{ mb: 2 }}>
          {showAlert.message}
        </Alert>
      )}

      <ResponsiveCard elevation={3}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'center', sm: 'flex-start' },
          gap: 2,
          mb: 3 
        }}>
          <Avatar
            sx={{
              width: { xs: 80, sm: 100 },
              height: { xs: 80, sm: 100 },
              bgcolor: '#03930A',
              fontSize: { xs: '2rem', sm: '2.5rem' },
            }}
          >
            {userData?.name?.charAt(0)}
          </Avatar>
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              {userData?.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Member since {defaultValues.joinDate}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <ResponsiveGrid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Full Name"
              value={editing ? tempData?.name : userData?.name}
              onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
              disabled={!editing}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              value={editing ? tempData?.email : userData?.email}
              onChange={(e) => setTempData({ ...tempData, email: e.target.value })}
              disabled={!editing}
              margin="normal"
            />

          </Grid>
          <Grid item xs={12} md={6}>
            {/* <TextField
              fullWidth
              label="Address"
              value={editing ? tempData?.address : userData?.address}
              onChange={(e) => setTempData({ ...tempData, address: e.target.value })}
              disabled={!editing}
              margin="normal"
              multiline
              rows={2}
            /> */}
            <TextField
              fullWidth
              label="Phone"
              value={editing ? tempData?.phone : userData?.phone}
              onChange={(e) => setTempData({ ...tempData, phone: e.target.value })}
              disabled={!editing}
              margin="normal"
            />
            <Box sx={{ mt: 2 }}>
              {/* <Typography variant="subtitle2" color="text.secondary">
                Total Rides: {totalRides}
              </Typography> */}
              <Typography variant="subtitle2" color="text.secondary">
                Preferred Payment: {defaultValues.preferredPayment}
              </Typography>
            </Box>
          </Grid>
        </ResponsiveGrid>

        <Divider sx={{ my: 3 }} />

        {/* Add the new statistics section */}
        <RideStatistics />

        {editing && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              sx={{
                bgcolor: '#03930A',
                '&:hover': { bgcolor: '#03830A' }
              }}
            >
              Save Changes
            </Button>
          </Box>
        )}
      </ResponsiveCard>
    </Box>
  );
}

export default UserProfile; 