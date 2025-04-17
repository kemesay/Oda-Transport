import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Alert,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import {
  LocalOffer,
  ContentCopy,
  CheckCircle,
} from '@mui/icons-material';

const mockPromoCodes = [
  {
    id: 1,
    code: 'WELCOME2024',
    discount: '20% OFF',
    validUntil: '2024-03-31',
    description: 'Welcome bonus for new users',
    isUsed: false,
    maxDiscount: '$50',
  },
  {
    id: 2,
    code: 'AIRPORT25',
    discount: '25% OFF',
    validUntil: '2024-04-15',
    description: 'Special discount on airport transfers',
    isUsed: false,
    maxDiscount: '$75',
  },
  {
    id: 3,
    code: 'HOURLY15',
    discount: '15% OFF',
    validUntil: '2024-03-15',
    description: 'Discount on hourly bookings',
    isUsed: true,
    maxDiscount: '$100',
  },
];

function PromoCodes() {
  const [codes, setCodes] = useState(mockPromoCodes);
  const [newCode, setNewCode] = useState('');
  const [alert, setAlert] = useState(null);

  const handleApplyCode = () => {
    if (!newCode) {
      setAlert({ type: 'error', message: 'Please enter a promo code' });
      return;
    }
    // Implement promo code validation logic
    setAlert({ type: 'success', message: 'Checking promo code...' });
    setNewCode('');
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setAlert({ type: 'success', message: 'Promo code copied to clipboard!' });
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="600">
        Promo Codes
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Apply Promo Code
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Enter promo code"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              sx={{ maxWidth: 400 }}
            />
            <Button
              variant="contained"
              onClick={handleApplyCode}
              sx={{
                bgcolor: '#03930A',
                '&:hover': { bgcolor: '#03830A' },
              }}
            >
              Apply
            </Button>
          </Box>
          {alert && (
            <Alert 
              severity={alert.type} 
              sx={{ mt: 2 }}
              onClose={() => setAlert(null)}
            >
              {alert.message}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        Available Promo Codes
      </Typography>

      <Grid container spacing={3}>
        {codes.map((promo) => (
          <Grid item xs={12} md={6} key={promo.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocalOffer sx={{ color: '#03930A', mr: 1 }} />
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {promo.discount}
                  </Typography>
                  <Chip
                    label={promo.isUsed ? 'Used' : 'Active'}
                    color={promo.isUsed ? 'default' : 'success'}
                    size="small"
                  />
                </Box>

                <Box sx={{ 
                  bgcolor: 'rgba(3, 147, 10, 0.1)', 
                  p: 1.5, 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2
                }}>
                  <Typography variant="h5" sx={{ letterSpacing: 1 }}>
                    {promo.code}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleCopyCode(promo.code)}
                    disabled={promo.isUsed}
                  >
                    <ContentCopy />
                  </IconButton>
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {promo.description}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Max discount: {promo.maxDiscount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Valid until: {new Date(promo.validUntil).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default PromoCodes; 