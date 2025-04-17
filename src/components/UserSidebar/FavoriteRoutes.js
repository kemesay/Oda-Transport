import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  Button,
} from '@mui/material';
import {
  Favorite,
  DirectionsCar,
  Delete as DeleteIcon,
  LocalAirport,
  AccessTime,
} from '@mui/icons-material';

const mockFavoriteRoutes = [
  {
    id: 1,
    type: 'AIRPORT',
    from: 'Denver International Airport (DEN)',
    to: '123 Main St, Denver, CO 80206',
    frequency: '5 trips',
    lastUsed: '2024-02-10',
  },
  {
    id: 2,
    type: 'POINT_TO_POINT',
    from: 'Denver Tech Center',
    to: 'Downtown Denver',
    frequency: '8 trips',
    lastUsed: '2024-02-15',
  },
  {
    id: 3,
    type: 'HOURLY',
    location: 'Cherry Creek Shopping Center',
    duration: '4 hours',
    frequency: '3 trips',
    lastUsed: '2024-02-01',
  },
];

function FavoriteRoutes() {
  const [routes, setRoutes] = useState(mockFavoriteRoutes);

  const getRouteIcon = (type) => {
    switch (type) {
      case 'AIRPORT':
        return <LocalAirport />;
      case 'HOURLY':
        return <AccessTime />;
      default:
        return <DirectionsCar />;
    }
  };

  const handleDelete = (routeId) => {
    setRoutes(routes.filter(route => route.id !== routeId));
  };

  const handleBookNow = (route) => {
    // Implement booking logic
    console.log('Booking route:', route);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="600">
        Favorite Routes
      </Typography>

      <Grid container spacing={3}>
        {routes.map((route) => (
          <Grid item xs={12} md={6} key={route.id}>
            <Card
              sx={{
                position: 'relative',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconButton size="small" sx={{ color: '#03930A', mr: 1 }}>
                    {getRouteIcon(route.type)}
                  </IconButton>
                  <Typography variant="h6">
                    {route.type === 'HOURLY' ? 'Hourly Charter' : 
                     route.type === 'AIRPORT' ? 'Airport Transfer' : 'Point to Point'}
                  </Typography>
                  <Chip
                    icon={<Favorite sx={{ fontSize: '16px !important' }} />}
                    label={route.frequency}
                    size="small"
                    sx={{
                      ml: 'auto',
                      bgcolor: 'rgba(3, 147, 10, 0.1)',
                      color: '#03930A',
                    }}
                  />
                </Box>

                {route.type === 'HOURLY' ? (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1">
                      {route.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Duration
                    </Typography>
                    <Typography variant="body1">
                      {route.duration}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      From
                    </Typography>
                    <Typography variant="body1">
                      {route.from}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      To
                    </Typography>
                    <Typography variant="body1">
                      {route.to}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Last used: {new Date(route.lastUsed).toLocaleDateString()}
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(route.id)}
                      sx={{ mr: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleBookNow(route)}
                      sx={{
                        bgcolor: '#03930A',
                        '&:hover': { bgcolor: '#03830A' },
                      }}
                    >
                      Book Now
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default FavoriteRoutes; 