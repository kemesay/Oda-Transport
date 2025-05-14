import React, { useState, useEffect } from 'react';
import { Box, TextField, Checkbox, Autocomplete, Alert } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import axios from 'axios';
import { remote_host } from '../../../globalVariable';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const maskCardNumber = (cardNumber) => {
  if (!cardNumber) return '';
  const lastFourDigits = cardNumber.slice(-4);
  const maskedPart = '•'.repeat(12);
  return `${maskedPart} ${lastFourDigits}`;
};

const getCardTypeDisplay = (cardNumber) => {
  if (!cardNumber) return '';
  const firstDigit = cardNumber[0];
  switch (firstDigit) {
    case '4': return 'VISA';
    case '5': return 'MASTERCARD';
    case '3': return 'AMEX';
    case '6': return 'DISCOVER';
    default: return 'CARD';
  }
};

const SelectedPaymentCard = ({ 
  selectedPaymentCard,
  handlePaymentCardChange,
  authToken
}) => {
  const [paymentCards, setPaymentCards] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPaymentCards = async () => {
      if (!authToken) {
        setError('Authentication token is required');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${remote_host}/api/v1/users/payment-detail/paymentCards`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const formattedCards = response.data.map(card => ({
          ...card,
          maskedNumber: maskCardNumber(card.creditCardNumber),
          cardType: getCardTypeDisplay(card.creditCardNumber),
          displayName: `${getCardTypeDisplay(card.creditCardNumber)} •••• ${card.creditCardNumber.slice(-4)}${card.isPrimary ? ' (Primary)' : ''}`
        }));

        setPaymentCards(formattedCards);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch payment cards');
        console.error('Error fetching payment cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentCards();
  }, [authToken]);

  const handleChange = (event, newValue) => {
    handlePaymentCardChange(event, newValue);
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Autocomplete
      id="payment-card-selector"
      options={paymentCards}
      value={selectedPaymentCard || null}
      onChange={handleChange}
      isOptionEqualToValue={(option, value) => 
        option?.paymentDetailId === value?.paymentDetailId
      }
      getOptionLabel={(option) => option?.displayName || ''}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox
            icon={icon}
            checkedIcon={checkedIcon}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              fontWeight: 'bold',
              color: option.isPrimary ? '#03930A' : 'inherit',
              minWidth: 80
            }}>
              {option.cardType}
            </Box>
            <Box sx={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>
              {option.maskedNumber}
            </Box>
            {option.isPrimary && (
              <Box sx={{ ml: 1, color: '#03930A', fontSize: '0.875rem', fontWeight: 500 }}>
                (Primary)
              </Box>
            )}
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField 
          {...params} 
          label="Select Payment Card"
          placeholder={loading ? 'Loading cards...' : 'Choose a payment method'}
          error={!!error}
        />
      )}
      loading={loading}
      disabled={loading}
    />
  );
};

export default SelectedPaymentCard;