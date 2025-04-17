import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import {
  Home as HomeIcon,
  Work as WorkIcon,
  Place as PlaceIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const mockAddresses = [
  {
    id: 1,
    type: 'HOME',
    address: '123 Main St, Denver, CO 80206',
    label: 'Home',
    isDefault: true,
  },
  {
    id: 2,
    type: 'WORK',
    address: '456 Business Ave, Denver, CO 80202',
    label: 'Office',
    isDefault: false,
  },
  {
    id: 3,
    type: 'OTHER',
    address: '789 Shopping Center, Denver, CO 80203',
    label: 'Mall',
    isDefault: false,
  },
];

function SavedAddresses() {
  const [addresses, setAddresses] = useState(mockAddresses);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    type: 'HOME',
    address: '',
    label: '',
    isDefault: false,
  });

  const getIcon = (type) => {
    switch (type) {
      case 'HOME':
        return <HomeIcon />;
      case 'WORK':
        return <WorkIcon />;
      default:
        return <PlaceIcon />;
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setNewAddress({
      type: 'HOME',
      address: '',
      label: '',
      isDefault: false,
    });
    setOpenDialog(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setNewAddress(address);
    setOpenDialog(true);
  };

  const handleDeleteAddress = (addressId) => {
    setAddresses(addresses.filter(addr => addr.id !== addressId));
  };

  const handleSave = () => {
    if (editingAddress) {
      setAddresses(addresses.map(addr =>
        addr.id === editingAddress.id ? { ...newAddress, id: addr.id } : addr
      ));
    } else {
      setAddresses([...addresses, { ...newAddress, id: addresses.length + 1 }]);
    }
    setOpenDialog(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight="600">
          Saved Addresses
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddAddress}
          sx={{
            bgcolor: '#03930A',
            '&:hover': { bgcolor: '#03830A' }
          }}
        >
          Add New Address
        </Button>
      </Box>

      <Grid container spacing={3}>
        {addresses.map((address) => (
          <Grid item xs={12} md={6} key={address.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconButton size="small" sx={{ mr: 1, color: '#03930A' }}>
                    {getIcon(address.type)}
                  </IconButton>
                  <Typography variant="h6">
                    {address.label}
                  </Typography>
                  {address.isDefault && (
                    <Chip
                      label="Default"
                      size="small"
                      sx={{
                        ml: 1,
                        bgcolor: '#03930A',
                        color: 'white',
                      }}
                    />
                  )}
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {address.address}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEditAddress(address)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteAddress(address.id)}
                    disabled={address.isDefault}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAddress ? 'Edit Address' : 'Add New Address'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Label (e.g., Home, Office)"
              value={newAddress.label}
              onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
              fullWidth
            />
            <TextField
              label="Address"
              value={newAddress.address}
              onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              bgcolor: '#03930A',
              '&:hover': { bgcolor: '#03830A' }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SavedAddresses; 