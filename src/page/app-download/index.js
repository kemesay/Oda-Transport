import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

/**
 * Smart redirect page that detects user's device and redirects to appropriate app store
 * This page is accessed when users scan the QR code
 */
const AppDownload = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToAppStore = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;

      // Android devices
      if (/android/i.test(userAgent)) {
        window.location.href = 'https://play.google.com/store/apps/details?id=com.odatransportation.app';
        return;
      }

      // iOS devices (iPhone, iPad, iPod)
      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        window.location.href = 'https://apps.apple.com/app/id6759082899';
        return;
      }

      // Desktop or other devices - show options or redirect to home
      // You can create a page with both download options here
      navigate('/', { replace: true });
    };

    // Small delay for better UX
    const timer = setTimeout(redirectToAppStore, 500);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 3,
        backgroundColor: '#f5f5f5',
      }}
    >
      <CircularProgress size={50} sx={{ color: '#03930A' }} />
      <Typography variant="h6" color="text.secondary">
        Redirecting to app store...
      </Typography>
    </Box>
  );
};

export default AppDownload;
