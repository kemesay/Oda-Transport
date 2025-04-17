import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { remote_host } from '../../globalVariable';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { format, addYears, isAfter, parse } from 'date-fns';

// Styled components
const PaymentCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  position: 'relative',
  backgroundColor: '#161F36',
  color: '#fff',
  borderRadius: '15px',
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

const CardNumber = styled(Typography)({
  letterSpacing: '3px',
  fontSize: '1.2rem',
  marginTop: '20px',
  fontFamily: 'monospace',
});

const LoadingOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  borderRadius: '15px',
  zIndex: 1,
});

const CardTypeIndicator = styled(Box)({
  position: 'absolute',
  top: 16,
  right: 16,
  width: 40,
  height: 25,
  borderRadius: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const PrimaryBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 20,
  backgroundColor: '#03930A',
  color: '#fff',
  padding: '4px 12px',
  borderRadius: '0 0 8px 8px',
  fontSize: '0.75rem',
  fontWeight: 600,
  zIndex: 1,
  boxShadow: theme.shadows[2],
}));

// Validation schema
const cardValidationSchema = Yup.object().shape({
  creditCardNumber: Yup.string()
    .required('Card number is required')
    .matches(/^[0-9]{16}$/, 'Must be a valid 16-digit card number'),
  cardOwnerName: Yup.string()
    .required('Cardholder name is required')
    .matches(/^[a-zA-Z\s]+$/, 'Only letters and spaces allowed'),
  expirationDate: Yup.string()
    .required('Expiration date is required')
    .test('valid-date', 'Invalid expiration date', (value) => {
      if (!value) return false;
      const [month, year] = value.split('/');
      if (!month || !year || month.length !== 2 || year.length !== 2) return false;
      
      const expDate = parse(`01/${month}/20${year}`, 'dd/MM/yyyy', new Date());
      const currentDate = new Date();
      return isAfter(expDate, currentDate);
    }),
  securityCode: Yup.string()
    .required('Security code is required')
    .matches(/^[0-9]{3,4}$/, 'Must be 3 or 4 digits'),
  zipCode: Yup.string()
    .required('ZIP code is required')
    .matches(/^[0-9]{5}(?:-[0-9]{4})?$/, 'Must be a valid ZIP code'),
  isPrimary: Yup.boolean(),
});

function PaymentCards() {
  const [cards, setCards] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cardLoading, setCardLoading] = useState({});
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showSecurityCode, setShowSecurityCode] = useState(false);
  const [cardType, setCardType] = useState('unknown');

  // Formik form handling
  const formik = useFormik({
    initialValues: {
      creditCardNumber: '',
      expirationDate: '',
      zipCode: '',
      securityCode: '',
      cardOwnerName: '',
      isPrimary: false,
    },
    validationSchema: cardValidationSchema,
    onSubmit: async (values) => {
      await handleSaveCard(values);
    },
  });

  // Detect card type based on number
  const detectCardType = (number) => {
    const num = number.replace(/\D/g, '');
    if (/^4/.test(num)) return 'visa';
    if (/^5[1-5]/.test(num)) return 'mastercard';
    if (/^3[47]/.test(num)) return 'amex';
    if (/^6(?:011|5)/.test(num)) return 'discover';
    return 'unknown';
  };

  // Fetch all cards
  const fetchCards = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('access_token');
      const response = await axios.get(
        `${remote_host}/api/v1/users/payment-detail/paymentCards`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCards(response.data);
    } catch (err) {
      setError('Failed to load payment cards');
      showSnackbar('Failed to load payment cards', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // Update card type when card number changes
  useEffect(() => {
    if (formik.values.creditCardNumber.length >= 4) {
      const type = detectCardType(formik.values.creditCardNumber);
      setCardType(type);
    } else {
      setCardType('unknown');
    }
  }, [formik.values.creditCardNumber]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAddCard = () => {
    setEditingCard(null);
    formik.resetForm();
    setOpenDialog(true);
  };

  const handleEditCard = async (paymentDetailId) => {
    try {
      const token = sessionStorage.getItem('access_token');
      const response = await axios.get(
        `${remote_host}/api/v1/users/payment-detail/${paymentDetailId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setEditingCard(response.data);
      formik.setValues({
        creditCardNumber: response.data.creditCardNumber,
        expirationDate: response.data.expirationDate,
        zipCode: response.data.zipCode,
        securityCode: response.data.securityCode,
        cardOwnerName: response.data.cardOwnerName,
        isPrimary: response.data.isPrimary,
      });
      setOpenDialog(true);
    } catch (err) {
      showSnackbar('Failed to load card details', 'error');
    }
  };

  const handleDeleteCard = async (paymentDetailId) => {
    try {
      setCardLoading(prev => ({ ...prev, [paymentDetailId]: true }));
      const token = sessionStorage.getItem('access_token');
      await axios.delete(
        `${remote_host}/api/v1/users/payment-detail/${paymentDetailId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      await fetchCards(); // Refresh the list
      showSnackbar('Card deleted successfully');
    } catch (err) {
      showSnackbar('Failed to delete card', 'error');
    } finally {
      setCardLoading(prev => ({ ...prev, [paymentDetailId]: false }));
    }
  };

  const handleSetPrimary = async (paymentDetailId) => {
    try {
      setCardLoading(prev => ({ ...prev, [paymentDetailId]: true }));
      const token = sessionStorage.getItem('access_token');

      // Call the set-primary endpoint
      await axios.patch(
        `${remote_host}/api/v1/users/payment-detail/${paymentDetailId}/set-primary`,
        {},  // Empty body since the logic is handled in backend
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      await fetchCards(); // Refresh the list to get updated primary status
      showSnackbar('Primary card updated successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to set primary card';
      showSnackbar(errorMessage, 'error');
    } finally {
      setCardLoading(prev => ({ ...prev, [paymentDetailId]: false }));
    }
  };

  const handleSaveCard = async (values) => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('access_token');
      
      if (editingCard) {
        // Update existing card
        await axios.put(
          `${remote_host}/api/v1/users/payment-detail/${editingCard.paymentDetailId}`,
          values,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        // If this card is being set as primary, use the set-primary endpoint
        if (values.isPrimary) {
          await axios.patch(
            `${remote_host}/api/v1/users/payment-detail/${editingCard.paymentDetailId}/set-primary`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
        }

        showSnackbar('Card updated successfully');
      } else {
        // Create new card
        const response = await axios.post(
          `${remote_host}/api/v1/users/payment-detail/validate-card`,
          values,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        // If this new card should be primary, set it using the new endpoint
        if (values.isPrimary && response.data.paymentDetailId) {
          await axios.patch(
            `${remote_host}/api/v1/users/payment-detail/${response.data.paymentDetailId}/set-primary`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
        }

        showSnackbar('Card added successfully');
      }
      
      await fetchCards(); // Refresh the list
      setOpenDialog(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save card';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Format card number for display (mask all but last 4 digits)
  const formatCardNumber = (number) => {
    if (!number) return '';
    const visibleDigits = 4;
    const masked = number.slice(0, -visibleDigits).replace(/\d/g, '•');
    const visible = number.slice(-visibleDigits);
    return `${masked}${visible}`.replace(/(.{4})/g, '$1 ').trim();
  };

  // Format expiration date for display
  const formatExpirationDate = (date) => {
    if (!date) return '';
    const [month, year] = date.split('/');
    return `${month}/${year}`;
  };

  // Format cardholder name (uppercase)
  const formatCardholderName = (name) => {
    if (!name) return '';
    return name.toUpperCase();
  };

  // Generate month options for expiration date
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString().padStart(2, '0'),
    label: (i + 1).toString().padStart(2, '0'),
  }));

  // Generate year options for expiration date (next 10 years)
  const currentYear = new Date().getFullYear() % 100;
  const years = Array.from({ length: 10 }, (_, i) => ({
    value: (currentYear + i).toString().padStart(2, '0'),
    label: `20${currentYear + i}`,
  }));

  // Add this new function to handle primary card switch changes
  const handlePrimarySwitchChange = (e) => {
    const newIsPrimary = e.target.checked;
    
    // If trying to unset primary card, prevent it
    if (!newIsPrimary && formik.values.isPrimary) {
      showSnackbar('You cannot unset a primary card. Set another card as primary instead.', 'warning');
      return;
    }

    // If setting as primary, show confirmation dialog if there's already a primary card
    if (newIsPrimary && cards.some(card => card.isPrimary)) {
      if (window.confirm('This will remove primary status from the current primary card. Continue?')) {
        formik.setFieldValue('isPrimary', newIsPrimary);
      }
    } else {
      formik.setFieldValue('isPrimary', newIsPrimary);
    }
  };

  // Add a new component for the primary card switch
  const PrimaryCardSwitch = ({ card, disabled, onChange }) => {
    return (
      <Tooltip title={
        card.isPrimary 
          ? "This is your primary card"
          : disabled 
            ? "Action in progress..."
            : "Set as primary card"
      }>
        <span>
          <IconButton
            size="small"
            onClick={onChange}
            disabled={disabled}
            sx={{
              color: card.isPrimary ? '#03930A' : '#fff',
              '&:hover': {
                color: '#03930A',
              },
            }}
          >
            {card.isPrimary ? <StarIcon /> : <StarBorderIcon />}
          </IconButton>
        </span>
      </Tooltip>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h5" fontWeight="600">
          Payment Methods
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCard}
          disabled={loading}
          sx={{
            backgroundColor: '#03930A',
            '&:hover': { backgroundColor: '#03830A' },
            textTransform: 'none',
            fontWeight: '600',
          }}
        >
          Add New Card
        </Button>
      </Box>

      {loading && !cards.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : cards.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '300px',
          textAlign: 'center',
          p: 3,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider',
        }}>
          <CreditCardIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No payment methods saved
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Add a payment method to make checkout faster
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCard}
            sx={{
              backgroundColor: '#03930A',
              '&:hover': { backgroundColor: '#03830A' },
              textTransform: 'none',
            }}
          >
            Add Payment Method
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {cards.map((card) => (
            <Grid item xs={12} md={6} key={card.paymentDetailId}>
              <PaymentCard>
                {card.isPrimary && (
                  <PrimaryBadge>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon fontSize="small" />
                      Primary
                    </Box>
                  </PrimaryBadge>
                )}
                {cardLoading[card.paymentDetailId] && (
                  <LoadingOverlay>
                    <CircularProgress sx={{ color: 'white' }} />
                  </LoadingOverlay>
                )}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <CreditCardIcon sx={{ fontSize: 40 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PrimaryCardSwitch
                        card={card}
                        disabled={cardLoading[card.paymentDetailId]}
                        onChange={() => handleSetPrimary(card.paymentDetailId)}
                      />
                    </Box>
                  </Box>
                  <CardNumber>
                    {formatCardNumber(card.creditCardNumber)}
                  </CardNumber>
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      Card Holder
                    </Typography>
                    <Typography variant="body2">
                      Expires
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ textTransform: 'uppercase' }}>
                      {formatCardholderName(card.cardOwnerName)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography>{formatExpirationDate(card.expirationDate)}</Typography>
                      <Tooltip title="Edit card">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditCard(card.paymentDetailId)} 
                          sx={{ color: '#fff' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={card.isPrimary ? "Primary card cannot be deleted" : "Delete card"}>
                        <span>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteCard(card.paymentDetailId)}
                            disabled={card.isPrimary || cardLoading[card.paymentDetailId]}
                            sx={{ color: card.isPrimary ? 'grey.500' : '#fff' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
                <CardTypeIndicator>
                  {cardType === 'visa' && (
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>VISA</Typography>
                  )}
                  {cardType === 'mastercard' && (
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>MC</Typography>
                  )}
                  {cardType === 'amex' && (
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>AMEX</Typography>
                  )}
                  {cardType === 'discover' && (
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>DISC</Typography>
                  )}
                </CardTypeIndicator>
              </PaymentCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Card Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => !loading && setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            '& .MuiDialogTitle-root': {
              borderBottom: '1px solid',
              borderColor: 'divider',
              pb: 2,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 24,
                right: 24,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.12), transparent)',
              }
            },
            '& .MuiDialogContent-root': {
              mt: 3,
              pt: 3,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 24,
                right: 24,
                height: '8px',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, transparent 100%)',
              }
            }
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            '& .MuiSvgIcon-root': {
              color: '#03930A',
            }
          }}>
            <CreditCardIcon />
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              background: 'linear-gradient(45deg, #161F36, #03930A)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {editingCard ? 'Edit Payment Card' : 'Add New Payment Card'}
            </Typography>
          </Box>
        </DialogTitle>

        <Box sx={{ 
          px: 3, 
          py: 1.5,
          background: 'linear-gradient(180deg, rgba(3,147,10,0.04) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(3,147,10,0.1)',
        }}>
          <Typography variant="body2" color="text.secondary">
            {editingCard 
              ? 'Update your card information below'
              : 'Please enter your card details to add a new payment method'}
          </Typography>
        </Box>
        
        <DialogContent>
          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                name="creditCardNumber"
                label="Card Number"
                value={formik.values.creditCardNumber}
                onChange={(e) => {
                  // Only allow numbers and limit to 16 digits
                  const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                  formik.setFieldValue('creditCardNumber', value);
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.creditCardNumber && Boolean(formik.errors.creditCardNumber)}
                helperText={formik.touched.creditCardNumber && formik.errors.creditCardNumber}
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {cardType === 'visa' && (
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>VISA</Typography>
                      )}
                      {cardType === 'mastercard' && (
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>MC</Typography>
                      )}
                      {cardType === 'amex' && (
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>AMEX</Typography>
                      )}
                      {cardType === 'discover' && (
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>DISC</Typography>
                      )}
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                name="cardOwnerName"
                label="Card Holder Name"
                value={formik.values.cardOwnerName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.cardOwnerName && Boolean(formik.errors.cardOwnerName)}
                helperText={formik.touched.cardOwnerName && formik.errors.cardOwnerName}
                fullWidth
                required
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Expiration Month</InputLabel>
                  <Select
                    name="expirationMonth"
                    value={formik.values.expirationDate?.split('/')[0] || ''}
                    onChange={(e) => {
                      const month = e.target.value;
                      const year = formik.values.expirationDate?.split('/')[1] || '';
                      formik.setFieldValue('expirationDate', year ? `${month}/${year}` : month);
                    }}
                    label="Expiration Month"
                  >
                    {months.map((month) => (
                      <MenuItem key={month.value} value={month.value}>
                        {month.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Expiration Year</InputLabel>
                  <Select
                    name="expirationYear"
                    value={formik.values.expirationDate?.split('/')[1] || ''}
                    onChange={(e) => {
                      const year = e.target.value;
                      const month = formik.values.expirationDate?.split('/')[0] || '';
                      formik.setFieldValue('expirationDate', month ? `${month}/${year}` : `01/${year}`);
                    }}
                    label="Expiration Year"
                  >
                    {years.map((year) => (
                      <MenuItem key={year.value} value={year.value}>
                        {year.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  name="securityCode"
                  label="Security Code"
                  type={showSecurityCode ? 'text' : 'password'}
                  value={formik.values.securityCode}
                  onChange={(e) => {
                    // Only allow numbers and limit to 4 digits
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    formik.setFieldValue('securityCode', value);
                  }}
                  onBlur={formik.handleBlur}
                  error={formik.touched.securityCode && Boolean(formik.errors.securityCode)}
                  helperText={formik.touched.securityCode && formik.errors.securityCode}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowSecurityCode(!showSecurityCode)}
                          edge="end"
                        >
                          {showSecurityCode ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              
              <TextField
                name="zipCode"
                label="ZIP Code"
                value={formik.values.zipCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.zipCode && Boolean(formik.errors.zipCode)}
                helperText={formik.touched.zipCode && formik.errors.zipCode}
                required
              />
              
              <FormControlLabel
                control={
                  <Switch
                    name="isPrimary"
                    checked={formik.values.isPrimary}
                    onChange={handlePrimarySwitchChange}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>Set as primary payment method</Typography>
                    <Tooltip title="Only one card can be primary at a time. The primary card will be used as the default payment method.">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </Box>
          </form>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid', borderColor: 'red', p: 2 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            disabled={loading}
            sx={{ textTransform: 'none', fontWeight: '600' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={formik.handleSubmit}
            variant="contained"
            disabled={loading || !formik.isValid}
            sx={{
              backgroundColor: '#03930A',
              '&:hover': { backgroundColor: '#03830A' },
              textTransform: 'none',
              fontWeight: '600',
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              editingCard ? 'Update Card' : 'Add Card'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PaymentCards;