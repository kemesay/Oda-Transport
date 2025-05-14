import React, { useState, useEffect } from 'react';
import {
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Collapse,
  Paper,
  Alert,
} from '@mui/material';
import CreditCardForm from './contactDetailForm/CreditCardForm';
import SelectedPaymentCard from './selectPamymentcard';

const PAYMENT_METHODS = {
  PRIMARY: 'PRIMARY_CARD',
  EXISTING: 'EXISTING_CARD',
  NEW: 'NEW_CARD'
};

const PaymentMethodSelector = ({ formik, authToken, userCards = [] }) => {
  const [selectedMethod, setSelectedMethod] = useState(
    authToken ? PAYMENT_METHODS.PRIMARY : PAYMENT_METHODS.NEW
  );
  
  const hasPrimaryCard = userCards.some(card => card.isPrimary);
  const hasSavedCards = userCards.length > 0;

  useEffect(() => {
    // Initialize form values based on auth state and available cards
    if (authToken) {
      if (hasPrimaryCard && selectedMethod === PAYMENT_METHODS.PRIMARY) {
        formik.setFieldValue('paymentMethod', PAYMENT_METHODS.PRIMARY);
        formik.setFieldValue('paymentDetailId', undefined);
        formik.setFieldValue('cardDetails', undefined);
      } else if (hasSavedCards && selectedMethod === PAYMENT_METHODS.EXISTING) {
        formik.setFieldValue('paymentMethod', PAYMENT_METHODS.EXISTING);
        formik.setFieldValue('paymentDetailId', userCards[0].paymentDetailId);
        formik.setFieldValue('cardDetails', undefined);
      }
    } else {
      // For guests, only new card is available
      formik.setFieldValue('paymentMethod', PAYMENT_METHODS.NEW);
      formik.setFieldValue('cardDetails', {
        cardOwnerName: '',
        creditCardNumber: '',
        expirationDate: '',
        securityCode: '',
        zipCode: '',
      });
      formik.setFieldValue('paymentDetailId', undefined);
    }
  }, [authToken, userCards]);

  const handleMethodChange = (event) => {
    const method = event.target.value;
    setSelectedMethod(method);
    formik.setFieldValue('paymentMethod', method);

    console.log("method", formik.values.paymentMethod);
    
    // Clear previous payment-related fields
    formik.setFieldValue('paymentDetailId', undefined);
    formik.setFieldValue('cardDetails', undefined);

    switch (method) {
      case PAYMENT_METHODS.PRIMARY:
        if (hasPrimaryCard) {
          formik.setFieldValue('paymentMethod', PAYMENT_METHODS.PRIMARY);
        }
        break;
      case PAYMENT_METHODS.EXISTING:
        if (hasSavedCards) {
          formik.setFieldValue('paymentDetailId', userCards[0].paymentDetailId);
        }
        break;
      case PAYMENT_METHODS.NEW:
        formik.setFieldValue('cardDetails', {
          cardOwnerName: '',
          creditCardNumber: '',
          expirationDate: '',
          securityCode: '',
          zipCode: '',
        });
        break;
      default:
        break;
    }
  };

  const handleExistingCardSelect = (event, card) => {
    if (card) {
      formik.setFieldValue('paymentDetailId', card.paymentDetailId);
      formik.setFieldValue('paymentMethod', PAYMENT_METHODS.EXISTING);
      formik.setFieldValue('cardDetails', undefined);
    }
  };

  const handleNewCardSubmit = (cardData) => {
    formik.setFieldValue('cardDetails', cardData);
    formik.setFieldValue('paymentMethod', PAYMENT_METHODS.NEW);
    formik.setFieldValue('paymentDetailId', undefined);
    formik.setFieldValue('isValidCardInfo', true); // Mark card as validated
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#03930A' }}>
        Payment Method
      </Typography>

      <RadioGroup
        value={selectedMethod}
        onChange={handleMethodChange}
        sx={{ mb: 2 }}
      >
        {authToken && (
          <>
            {hasPrimaryCard && (
              <FormControlLabel
                value={PAYMENT_METHODS.PRIMARY}
                control={<Radio sx={{ color: '#03930A', '&.Mui-checked': { color: '#03930A' } }} />}
                label="Use Primary Card"
              />
            )}
            {hasSavedCards && (
              <FormControlLabel
                value={PAYMENT_METHODS.EXISTING}
                control={<Radio sx={{ color: '#03930A', '&.Mui-checked': { color: '#03930A' } }} />}
                label="Select Saved Card"
              />
            )}
          </>
        )}
        <FormControlLabel
          value={PAYMENT_METHODS.NEW}
          control={<Radio sx={{ color: '#03930A', '&.Mui-checked': { color: '#03930A' } }} />}
          label={authToken ? "Add New Card" : "Enter Payment Details"}
        />
      </RadioGroup>

      {!authToken && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please sign in to save payment methods for future use
        </Alert>
      )}

      {/* Existing Card Selection */}
      <Collapse in={selectedMethod === PAYMENT_METHODS.EXISTING && hasSavedCards}>
        <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'rgba(3, 147, 10, 0.05)' }}>
          <SelectedPaymentCard
            authToken={authToken}
            selectedPaymentCard={userCards.find(card => 
              card.paymentDetailId === formik.values.paymentDetailId
            )}
            handlePaymentCardChange={handleExistingCardSelect}
          />
        </Paper>
      </Collapse>

      {/* New Card Form */}
      <Collapse in={selectedMethod === PAYMENT_METHODS.NEW}>
        <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'rgba(3, 147, 10, 0.05)' }}>
          <CreditCardForm 
            formik={formik} 
            onSubmit={handleNewCardSubmit}
            shouldValidate={selectedMethod === PAYMENT_METHODS.NEW}
          />
        </Paper>
      </Collapse>

      {/* Primary Card Info */}
      {selectedMethod === PAYMENT_METHODS.PRIMARY && hasPrimaryCard && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Your primary card will be used for this payment
        </Alert>
      )}
    </Box>
  );
};

export default PaymentMethodSelector;