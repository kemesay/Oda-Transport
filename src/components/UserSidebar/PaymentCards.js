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
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { BACKEND_API } from '../../store/utils/API';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import SquareWalletAddCard from './SquareWalletAddCard';
import { fetchSquareConfig, isSquareEnabled } from '../../services/squareConfigService';

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

const editCardSchema = Yup.object().shape({
  isPrimary: Yup.boolean(),
});

function detectCardType(number) {
  const num = String(number || '').replace(/\D/g, '');
  if (/^4/.test(num)) return 'visa';
  if (/^5[1-5]/.test(num)) return 'mastercard';
  if (/^3[47]/.test(num)) return 'amex';
  if (/^6(?:011|5)/.test(num)) return 'discover';
  return 'unknown';
}

function PaymentCards() {
  const [cards, setCards] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cardLoading, setCardLoading] = useState({});
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [squareActive, setSquareActive] = useState(false);
  const [walletIsPrimary, setWalletIsPrimary] = useState(false);
  const squareWalletRef = React.useRef(null);

  const formik = useFormik({
    initialValues: {
      isPrimary: false,
    },
    validationSchema: editCardSchema,
    onSubmit: async (values) => {
      await handleSaveCard(values);
    },
  });

  // Fetch all cards
  const fetchCards = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('access_token');
      const response = await BACKEND_API.get(
        "/api/v1/users/payment-detail/paymentCards",
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
    fetchSquareConfig()
      .then((config) => setSquareActive(isSquareEnabled(config)))
      .catch(() => setSquareActive(false));
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAddCard = () => {
    setEditingCard(null);
    formik.resetForm();
    setWalletIsPrimary(false);
    setOpenDialog(true);
  };

  const handleEditCard = async (paymentDetailId) => {
    try {
      const token = sessionStorage.getItem('access_token');
      const response = await BACKEND_API.get(
        `/api/v1/users/payment-detail/${paymentDetailId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setEditingCard(response.data);
      formik.setValues({
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
      await BACKEND_API.delete(
        `/api/v1/users/payment-detail/${paymentDetailId}`,
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
      await BACKEND_API.patch(
        `/api/v1/users/payment-detail/${paymentDetailId}/set-primary`,
        {},
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
        if (values.isPrimary) {
          await BACKEND_API.patch(
            `/api/v1/users/payment-detail/${editingCard.paymentDetailId}/set-primary`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        showSnackbar('Card updated successfully');
      } else if (squareActive) {
        const billing = squareWalletRef.current?.getBillingFields() || {};
        if (!billing.cardOwnerName?.trim() || !billing.zipCode?.trim()) {
          showSnackbar("Cardholder name and billing ZIP are required", "error");
          return;
        }
        const square = await squareWalletRef.current?.tokenizeForSave();
        const response = await BACKEND_API.post(
          "/api/v1/users/payment-detail/validate-square-card",
          {
            sourceId: square.sourceId,
            verificationToken: square.verificationToken,
            cardOwnerName: billing.cardOwnerName.trim(),
            zipCode: billing.zipCode.trim(),
            isPrimary: walletIsPrimary,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (walletIsPrimary && response.data.paymentDetailId) {
          await BACKEND_API.patch(
            `/api/v1/users/payment-detail/${response.data.paymentDetailId}/set-primary`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        showSnackbar("Card saved to your wallet");
      } else {
        showSnackbar("Square payments are required to add a card. Please try again later.", "error");
        return;
      }
      
      await fetchCards();
      setOpenDialog(false);
    } catch (err) {
      const data = err.response?.data;
      const errorMessage =
        data?.message ||
        data?.error ||
        (Array.isArray(data?.errors) ? data.errors.join(", ") : null) ||
        err.message ||
        "Failed to save card";
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (number) => {
    if (!number) return '';
    const digits = String(number).replace(/\D/g, '');
    if (digits.length <= 4) {
      return `•••• •••• •••• ${digits}`.trim();
    }
    const visibleDigits = 4;
    const masked = digits.slice(0, -visibleDigits).replace(/\d/g, '•');
    const visible = digits.slice(-visibleDigits);
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
          {cards.map((card) => {
            const cardType = detectCardType(card.creditCardNumber || card.last4);
            return (
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
                    {formatCardNumber(card.last4 || card.creditCardNumber)}
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
            );
          })}
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
              ? "Update primary status for this saved card"
              : squareActive
                ? "Save a card to your wallet — use it as primary or saved card at checkout"
                : "Card payments are unavailable. Square must be configured to add cards."}
          </Typography>
        </Box>
        
        <DialogContent>
          {squareActive && !editingCard ? (
            <SquareWalletAddCard
              ref={squareWalletRef}
              open={openDialog}
              isPrimary={walletIsPrimary}
              onPrimaryChange={setWalletIsPrimary}
            />
          ) : editingCard ? (
            <Box sx={{ py: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                {editingCard.squareCardId
                  ? "This card is stored securely with Square. You can update primary status only."
                  : "This is a legacy saved card. You can update primary status or delete it and add a new Square card."}
              </Alert>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {formatCardholderName(editingCard.cardOwnerName)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                •••• {editingCard.last4 || '****'}
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    name="isPrimary"
                    checked={formik.values.isPrimary}
                    onChange={handlePrimarySwitchChange}
                    color="primary"
                  />
                }
                label="Set as primary payment method"
              />
            </Box>
          ) : (
            <Alert severity="warning">
              Square payments are not available. You cannot add a card until payment processing is configured.
            </Alert>
          )}
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
            onClick={() => handleSaveCard(formik.values)}
            variant="contained"
            disabled={loading || (!squareActive && !editingCard)}
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