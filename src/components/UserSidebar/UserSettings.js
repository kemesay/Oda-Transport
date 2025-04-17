import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

const initialSettings = {
  notifications: {
    email: true,
    sms: true,
    pushNotifications: false,
    rideUpdates: true,
    promotions: false,
  },
  privacy: {
    shareLocation: true,
    saveSearchHistory: true,
    savePaymentInfo: true,
  },
  preferences: {
    language: 'English',
    currency: 'USD',
    timeZone: 'America/Denver',
  }
};

function UserSettings() {
  const [settings, setSettings] = useState(initialSettings);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [alert, setAlert] = useState(null);

  const handleToggle = (section, setting) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [setting]: !prev[section][setting]
      }
    }));
  };

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAlert({
        type: 'error',
        message: 'New passwords do not match'
      });
      return;
    }
    // Implement password change logic here
    setAlert({
      type: 'success',
      message: 'Password updated successfully'
    });
    setOpenPasswordDialog(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="600">
        Settings
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsIcon sx={{ mr: 1, color: '#03930A' }} />
              Notification Settings
            </Typography>
            <List>
              {Object.entries(settings.notifications).map(([key, value], index) => (
                <React.Fragment key={key}>
                  <ListItem>
                    <ListItemText
                      primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={value}
                        onChange={() => handleToggle('notifications', key)}
                        color="success"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < Object.entries(settings.notifications).length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon sx={{ mr: 1, color: '#03930A' }} />
              Privacy & Security
            </Typography>
            <List>
              {Object.entries(settings.privacy).map(([key, value], index) => (
                <React.Fragment key={key}>
                  <ListItem>
                    <ListItemText
                      primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={value}
                        onChange={() => handleToggle('privacy', key)}
                        color="success"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < Object.entries(settings.privacy).length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
            <Button
              variant="outlined"
              onClick={() => setOpenPasswordDialog(true)}
              sx={{ mt: 2, color: '#03930A', borderColor: '#03930A' }}
            >
              Change Password
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LanguageIcon sx={{ mr: 1, color: '#03930A' }} />
              Preferences
            </Typography>
            <List>
              {Object.entries(settings.preferences).map(([key, value], index) => (
                <React.Fragment key={key}>
                  <ListItem>
                    <ListItemText
                      primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      secondary={value}
                    />
                  </ListItem>
                  {index < Object.entries(settings.preferences).length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>

      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {alert && (
            <Alert severity={alert.type} sx={{ mb: 2 }}>
              {alert.message}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              type="password"
              label="Current Password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              fullWidth
            />
            <TextField
              type="password"
              label="New Password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              fullWidth
            />
            <TextField
              type="password"
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            sx={{
              bgcolor: '#03930A',
              '&:hover': { bgcolor: '#03830A' }
            }}
          >
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserSettings; 