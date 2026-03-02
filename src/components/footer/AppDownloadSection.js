import React from 'react';
import { Box, Stack, useTheme } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import styled from '@emotion/styled';
import RSTypography from '../RSTypography';

// Google Play Store Logo Component (Colorful Triangle)
const GooglePlayLogo = () => (
  <Box
    sx={{
      width: 24,
      height: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mr: 1,
    }}
  >
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.6 3 21.09 3 20.5Z"
        fill="#00D9FF"
      />
      <path
        d="M16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12Z"
        fill="#00FF88"
      />
      <path
        d="M16.81 8.88L14.54 11.15L6.05 2.66L16.81 8.88Z"
        fill="#FFB800"
      />
      <path
        d="M3.84 2.15L13.69 12L3.84 21.85L6.05 21.34L6.05 2.66L3.84 2.15Z"
        fill="#FF3A44"
      />
    </svg>
  </Box>
);

// Apple App Store Logo Component
const AppleLogo = () => (
  <Box
    sx={{
      width: 20,
      height: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mr: 1,
    }}
  >
    <svg
      width="20"
      height="24"
      viewBox="0 0 20 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.671 12.577c-.02-2.024 1.652-2.999 1.727-3.045-0.94-1.373-2.405-1.562-2.926-1.583-1.246-0.126-2.431 0.733-3.064 0.733-0.631 0-1.607-0.714-2.644-0.694-1.36 0.023-2.616 0.791-3.316 2.006-1.412 2.447-0.369 6.074 1.014 8.061 0.673 0.99 1.478 2.101 2.533 2.06 1.03-0.042 1.421-0.667 2.667-0.667 1.245 0 1.596 0.667 2.688 0.647 1.11-0.02 1.81-1.002 2.475-1.998 0.78-1.139 1.101-2.24 1.119-2.295-0.024-0.011-2.149-0.826-2.169-3.286zm-2.405-7.577c0.558-0.677 0.935-1.617 0.832-2.56-0.804 0.033-1.779 0.536-2.356 1.212-0.518 0.6-0.971 1.557-0.85 2.478 0.897 0.07 1.812-0.456 2.374-1.13z"
        fill="white"
      />
    </svg>
  </Box>
);

const AppDownloadContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s ease',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

const QRCodeWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: '#fff',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease',
  flexShrink: 0,
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const StoreButton = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '8px 16px',
  minWidth: '160px',
  height: '50px',
  borderRadius: '8px',
  backgroundColor: '#000',
  color: '#fff',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  textDecoration: 'none',
  '&:hover': {
    backgroundColor: '#1a1a1a',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

const StoreButtonText = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  lineHeight: 1.2,
});

const StoreButtonTopText = styled(Box)({
  fontSize: '10px',
  fontWeight: 400,
  color: '#fff',
  lineHeight: 1.2,
  marginBottom: '2px',
});

const StoreButtonBottomText = styled(Box)({
  fontSize: '16px',
  fontWeight: 600,
  color: '#fff',
  lineHeight: 1.2,
});

const AppDownloadSection = () => {
  const theme = useTheme();
  const white = theme.palette.text.main;
  
  // App Store and Play Store URLs
  const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.odatransportation.app';
  const APP_STORE_URL = 'https://apps.apple.com/app/id6759082899'; // TODO: Replace with actual App Store ID when available
  
  // Smart redirect URL that detects device and redirects accordingly
  // This should be hosted on your server or use a service
  const SMART_REDIRECT_URL = `${window.location.origin}/app-download`;
  
  // Device detection function
  const detectDeviceAndRedirect = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    if (/android/i.test(userAgent)) {
      window.open(PLAY_STORE_URL, '_blank');
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      window.open(APP_STORE_URL, '_blank');
    } else {
      // For desktop, show both options or redirect to website
      window.open(SMART_REDIRECT_URL, '_blank');
    }
  };

  const handleQRClick = () => {
    detectDeviceAndRedirect();
  };

  return (
    <Box>
      <RSTypography 
        txtcolor={white} 
        fontsize="18px"
        sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}
      >
        Download Our App
      </RSTypography>
      
      <AppDownloadContainer>
        {/* QR Code Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <RSTypography 
            txtcolor={white} 
            fontsize="12px"
            sx={{ textAlign: 'center', opacity: 0.9 }}
          >
            Scan to download
          </RSTypography>
          <QRCodeWrapper onClick={handleQRClick} sx={{ cursor: 'pointer' }}>
            <QRCodeSVG
              value={SMART_REDIRECT_URL}
              size={100}
              level="H"
              includeMargin={true}
            />
          </QRCodeWrapper>
        </Box>

        {/* App Store Buttons Section */}
        <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
          {/* Google Play Store Button */}
          <StoreButton
            component="a"
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              window.open(PLAY_STORE_URL, '_blank');
            }}
          >
            <GooglePlayLogo />
            <StoreButtonText>
              <StoreButtonTopText>GET IT ON</StoreButtonTopText>
              <StoreButtonBottomText>Google Play</StoreButtonBottomText>
            </StoreButtonText>
          </StoreButton>

          {/* Apple App Store Button */}
          <StoreButton
            component="a"
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              window.open(APP_STORE_URL, '_blank');
            }}
          >
            <AppleLogo />
            <StoreButtonText>
              <StoreButtonTopText>Download on the</StoreButtonTopText>
              <StoreButtonBottomText>App Store</StoreButtonBottomText>
            </StoreButtonText>
          </StoreButton>
        </Stack>
      </AppDownloadContainer>
    </Box>
  );
};

export default AppDownloadSection;
