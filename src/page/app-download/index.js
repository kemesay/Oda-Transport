import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const IOS_APP_STORE_URL = 'https://apps.apple.com/app/id6759082899';
const ANDROID_PACKAGE_ID = 'com.odatransportation.app';

/**
 * Smart redirect page that detects the visitor's device and sends them to
 * the right app store — used both for the QR code on the website, and as
 * the landing page behind every referral link (GET /promo-codes/my-referral-code).
 *
 * When a referral code is present, it's carried through the install:
 *  - Android: appended as the Play Store "referrer" param, which the app
 *    reads back after install via the Play Install Referrer API.
 *  - iOS: there's no equivalent official API, so the code is copied to the
 *    clipboard right before handing off to the App Store — the app checks
 *    the clipboard once, on its very first launch, and picks it up from
 *    there. Not bulletproof (a user could clear their clipboard first),
 *    but it's the standard practical technique without a paid attribution
 *    SDK, and manually typing the code at booking time always still works.
 *  - Desktop: no app to install, so the code is preserved into the normal
 *    web booking flow instead of being dropped.
 */
const AppDownload = () => {
  const navigate = useNavigate();
  const [manualUrl, setManualUrl] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const promoCode = (params.get('promoCode') || '').trim().toUpperCase();

    const redirectToAppStore = async () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isAndroid = /android/i.test(userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

      if (isAndroid) {
        const playStoreUrl = promoCode
          ? `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_ID}&referrer=${encodeURIComponent(`promoCode=${promoCode}`)}`
          : `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_ID}`;
        setManualUrl(playStoreUrl);
        window.location.href = playStoreUrl;
        return;
      }

      if (isIOS) {
        if (promoCode && navigator.clipboard?.writeText) {
          try {
            await navigator.clipboard.writeText(promoCode);
          } catch (err) {
            // Clipboard write can be blocked depending on browser/context —
            // harmless either way, the promo code field still takes manual
            // entry once the app is open.
            console.warn('Could not copy referral code to clipboard:', err);
          }
        }
        setManualUrl(IOS_APP_STORE_URL);
        window.location.href = IOS_APP_STORE_URL;
        return;
      }

      // Desktop or anything else — no app to install, so go straight to the
      // regular booking flow with the code preserved instead of dropped.
      navigate(promoCode ? `/?promoCode=${encodeURIComponent(promoCode)}` : '/', {
        replace: true,
      });
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
        textAlign: 'center',
        px: 3,
      }}
    >
      <CircularProgress size={50} sx={{ color: '#03930A' }} />
      <Typography variant="h6" color="text.secondary">
        Redirecting to app store...
      </Typography>
      {manualUrl && (
        <Button
          variant="outlined"
          sx={{ color: '#03930A', borderColor: '#03930A' }}
          onClick={() => {
            window.location.href = manualUrl;
          }}
        >
          Tap here if nothing happens
        </Button>
      )}
    </Box>
  );
};

export default AppDownload;
