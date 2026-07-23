import React, { useMemo } from 'react';
import { Box, TextField, Autocomplete, Alert, Chip, Typography } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import StarIcon from '@mui/icons-material/Star';

/** Per-brand accent colors used in the brand chip */
const BRAND_COLORS = {
  visa:       { bg: '#EEF2FF', color: '#1A1F71', border: '#C7D2FE' },
  mastercard: { bg: '#FFF7ED', color: '#9A3412', border: '#FDBA74' },
  amex:       { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  discover:   { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  default:    { bg: '#F3F4F6', color: '#374151', border: '#D1D5DB' },
};

function brandStyle(raw) {
  const key = (raw || '').toLowerCase();
  return BRAND_COLORS[key] || BRAND_COLORS.default;
}

/** Single card row shown inside the dropdown list */
function CardOptionRow({ option }) {
  const style = brandStyle(option.cardBrand);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
      {/* Brand chip */}
      <Box
        sx={{
          px: 1,
          py: 0.25,
          borderRadius: '6px',
          background: style.bg,
          border: `1px solid ${style.border}`,
          color: style.color,
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          minWidth: 56,
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        {option.cardBrand || 'Card'}
      </Box>

      {/* Masked number */}
      <Typography
        sx={{
          fontFamily: 'monospace',
          fontSize: '0.88rem',
          letterSpacing: '1px',
          color: 'text.primary',
          flex: 1,
        }}
      >
        {option.maskedNumber}
      </Typography>

      {/* Primary badge */}
      {option.isPrimary && (
        <Chip
          icon={<StarIcon sx={{ fontSize: '12px !important' }} />}
          label="Primary"
          size="small"
          sx={{
            height: 20,
            fontSize: '0.65rem',
            fontWeight: 700,
            bgcolor: 'rgba(3,147,10,0.1)',
            color: '#03930A',
            border: '1px solid rgba(3,147,10,0.3)',
            '& .MuiChip-icon': { color: '#03930A' },
          }}
        />
      )}
    </Box>
  );
}

const SelectedPaymentCard = ({
  userCards = [],
  selectedPaymentCard,
  handlePaymentCardChange,
  loading = false,
  error = null,
}) => {
  const options = useMemo(() => userCards, [userCards]);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!loading && options.length === 0) {
    return (
      <Alert severity="info">
        No saved cards available. Choose &quot;Pay with new card&quot; instead.
      </Alert>
    );
  }

  return (
    <Autocomplete
      id="payment-card-selector"
      options={options}
      value={selectedPaymentCard || null}
      onChange={(_event, newValue) => handlePaymentCardChange(_event, newValue)}
      isOptionEqualToValue={(option, value) =>
        Number(option?.paymentDetailId) === Number(value?.paymentDetailId)
      }
      // Text shown in the input when a card is selected: "Visa ···· 4242"
      getOptionLabel={(option) => option?.displayName || ''}
      renderOption={(props, option) => (
        <li {...props} key={option.paymentDetailId}>
          <CardOptionRow option={option} />
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          margin="dense"
          label="Select saved card"
          placeholder={loading ? 'Loading cards…' : 'Choose a saved card'}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <CreditCardIcon sx={{ color: 'text.disabled', fontSize: 18, mr: 0.5 }} />
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
      loading={loading}
      disabled={loading || options.length === 0}
    />
  );
};

export default SelectedPaymentCard;
