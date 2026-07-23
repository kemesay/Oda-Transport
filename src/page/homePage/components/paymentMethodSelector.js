import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SelectedPaymentCard from './selectPamymentcard';
import SquarePaymentForm from '../../../components/SquarePaymentForm';
import { PAYMENT_METHODS, PAYMENT_UI } from '../../../constants/paymentMethods';
import {
  formatCardForDisplay,
  isSquareReadyCard,
} from '../../../utils/paymentCards';

/** Only new-card flow needs a floor height while Square iframe mounts */
const SQUARE_NEW_CARD_PANEL_MIN_HEIGHT = 280;

const PaymentMethodSelector = ({
  formik,
  authToken,
  userCards = [],
  cardsLoading = false,
  cardsError = null,
  totalFee = 0,
}) => {
  const squareCards = useMemo(
    () => userCards.filter(isSquareReadyCard).map(formatCardForDisplay),
    [userCards]
  );

  const primaryCard = squareCards.find((c) => c.isPrimary);
  const hasPrimaryCard = Boolean(primaryCard);
  const hasSavedCards = squareCards.length > 0;

  const defaultUi =
    authToken && hasPrimaryCard
      ? PAYMENT_UI.PRIMARY
      : authToken && hasSavedCards
        ? PAYMENT_UI.SAVED
        : PAYMENT_UI.NEW;

  const [selectedUi, setSelectedUi] = useState(PAYMENT_UI.NEW);
  const [initialized, setInitialized] = useState(false);
  const userPickedRef = useRef(false);
  const squarePinnedRef = useRef(false);

  const applySavedCard = (card) => {
    if (!card) return;
    formik.setFieldValue('paymentMethod', PAYMENT_METHODS.SQUARE_SAVED);
    formik.setFieldValue('paymentDetailId', Number(card.paymentDetailId));
    formik.setFieldValue('squareCardId', card.squareCardId || undefined);
    formik.setFieldValue('cardDetails', {
      cardOwnerName: card.cardOwnerName || '',
      zipCode: card.zipCode || '',
    });
    formik.setFieldValue('square', undefined);
    formik.setFieldValue('isValidCardInfo', true);
  };

  const applyNewCard = () => {
    formik.setFieldValue('paymentMethod', PAYMENT_METHODS.SQUARE_NEW);
    formik.setFieldValue('paymentDetailId', undefined);
    formik.setFieldValue('squareCardId', undefined);
    formik.setFieldValue('square', undefined);
    formik.setFieldValue('isValidCardInfo', false);
    const existing = formik.values.cardDetails || {};
    formik.setFieldValue('cardDetails', {
      cardOwnerName: existing.cardOwnerName || formik.values.passengerFullName || '',
      zipCode: existing.zipCode || '',
    });
    squarePinnedRef.current = true;
  };

  useEffect(() => {
    if (initialized || userPickedRef.current) return;
    if (authToken && cardsLoading) return;

    let ui = defaultUi;
    if (authToken && !hasSavedCards && !cardsLoading) {
      ui = PAYMENT_UI.NEW;
    }

    setSelectedUi(ui);

    if (ui === PAYMENT_UI.PRIMARY && primaryCard) {
      applySavedCard(primaryCard);
    } else if (ui === PAYMENT_UI.SAVED && hasSavedCards) {
      const card =
        squareCards.find(
          (c) => Number(c.paymentDetailId) === Number(formik.values.paymentDetailId)
        ) || squareCards[0];
      applySavedCard(card);
    } else {
      applyNewCard();
    }

    if (ui === PAYMENT_UI.NEW) {
      squarePinnedRef.current = true;
    }

    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, cardsLoading, initialized, hasSavedCards, hasPrimaryCard]);

  const handleMethodChange = (event) => {
    userPickedRef.current = true;
    const ui = event.target.value;
    setSelectedUi(ui);

    switch (ui) {
      case PAYMENT_UI.PRIMARY:
        applySavedCard(primaryCard);
        break;
      case PAYMENT_UI.SAVED:
        applySavedCard(squareCards[0]);
        break;
      case PAYMENT_UI.NEW:
      default:
        applyNewCard();
        break;
    }
  };

  const handleExistingCardSelect = (_event, card) => {
    if (card) {
      userPickedRef.current = true;
      setSelectedUi(PAYMENT_UI.SAVED);
      applySavedCard(card);
    }
  };

  const selectedSavedCard = squareCards.find(
    (card) => Number(card.paymentDetailId) === Number(formik.values.paymentDetailId)
  );

  const panelMinHeight =
    selectedUi === PAYMENT_UI.NEW ? SQUARE_NEW_CARD_PANEL_MIN_HEIGHT : undefined;

  if (authToken && cardsLoading && !initialized) {
    return (
      <Box
        sx={{
          mt: 2,
          py: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
        }}
      >
        <CircularProgress size={24} sx={{ color: '#03930A' }} />
        <Typography variant="body2" color="text.secondary">
          Loading saved payment methods…
        </Typography>
      </Box>
    );
  }

  const showSquareForm =
    squarePinnedRef.current || selectedUi === PAYMENT_UI.NEW || !hasSavedCards;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ color: '#03930A', fontWeight: 600, mb: 1 }}>
        Payment Method
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          mb: 1.5,
          borderColor: 'rgba(3, 147, 10, 0.35)',
          bgcolor: 'rgba(3, 147, 10, 0.04)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <LockIcon sx={{ color: '#03930A', mt: 0.15 }} fontSize="small" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
              Secure payment with Square
            </Typography>
            <List dense disablePadding sx={{ mt: 0.25 }}>
              <ListItem disableGutters sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 24 }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#03930A' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Saved wallet card — fastest checkout"
                  primaryTypographyProps={{ variant: 'caption', lineHeight: 1.3 }}
                />
              </ListItem>
              <ListItem disableGutters sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 24 }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#03930A' }} />
                </ListItemIcon>
                <ListItemText
                  primary="New card — billing + secure card field below"
                  primaryTypographyProps={{ variant: 'caption', lineHeight: 1.3 }}
                />
              </ListItem>
            </List>
          </Box>
        </Box>
      </Paper>

      {cardsError && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          {cardsError} You can still pay with a new card below.
        </Alert>
      )}

      <RadioGroup
        value={selectedUi}
        onChange={handleMethodChange}
        sx={{ mb: 1, gap: 0 }}
        aria-label="Payment method"
      >
        {authToken && hasPrimaryCard && (
          <FormControlLabel
            value={PAYMENT_UI.PRIMARY}
            sx={{ my: 0, py: 0.25 }}
            control={<Radio size="small" sx={{ color: '#03930A', '&.Mui-checked': { color: '#03930A' } }} />}
            label={
              <Typography variant="body2" component="span">
                Primary card — <strong>{primaryCard.displayName}</strong>
              </Typography>
            }
          />
        )}
        {authToken && hasSavedCards && (
          <FormControlLabel
            value={PAYMENT_UI.SAVED}
            sx={{ my: 0, py: 0.25 }}
            control={<Radio size="small" sx={{ color: '#03930A', '&.Mui-checked': { color: '#03930A' } }} />}
            label="Select saved card"
          />
        )}
        <FormControlLabel
          value={PAYMENT_UI.NEW}
          sx={{ my: 0, py: 0.25 }}
          control={<Radio size="small" sx={{ color: '#03930A', '&.Mui-checked': { color: '#03930A' } }} />}
          label={authToken ? 'Pay with new card' : 'Enter payment details'}
        />
      </RadioGroup>

      {!authToken && (
        <Alert severity="info" sx={{ mb: 1, py: 0 }}>
          Sign in to save cards on file for faster checkout.
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.25, sm: 1.5 },
          bgcolor: '#fff',
          border: '1px solid rgba(3, 147, 10, 0.25)',
          borderRadius: 2,
          minHeight: panelMinHeight,
          boxSizing: 'border-box',
        }}
      >
        {selectedUi === PAYMENT_UI.PRIMARY && hasPrimaryCard && (
          <Alert severity="success" icon={<CreditCardIcon fontSize="small" />} sx={{ py: 0.5 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
              <strong>{primaryCard.displayName}</strong> will be authorized when you
              complete booking.
            </Typography>
          </Alert>
        )}

        {selectedUi === PAYMENT_UI.SAVED && hasSavedCards && (
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                mb: 0.75,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                Pick a saved card
              </Typography>
              {selectedSavedCard && (
                <Typography
                  variant="caption"
                  sx={{
                    color: '#03930A',
                    bgcolor: 'rgba(3, 147, 10, 0.1)',
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Ready to book
                </Typography>
              )}
            </Box>
            <SelectedPaymentCard
              userCards={squareCards}
              selectedPaymentCard={selectedSavedCard}
              handlePaymentCardChange={handleExistingCardSelect}
              loading={cardsLoading}
              error={cardsError}
            />
            {selectedSavedCard && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.75, lineHeight: 1.35 }}
              >
                Charged when you complete booking — no re-entry needed.
              </Typography>
            )}
          </Box>
        )}

        {selectedUi === PAYMENT_UI.NEW && showSquareForm && (
          <SquarePaymentForm
            formik={formik}
            visible
            amountDollars={totalFee}
          />
        )}
      </Paper>
    </Box>
  );
};

export default PaymentMethodSelector;
