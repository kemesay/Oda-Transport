import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Divider,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  NotificationsActive,
  LocalTaxi,
  Payment,
  Discount,
  Delete as DeleteIcon,
  Done as DoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import EmailNotificationService from '../../services/emailNotificationService';

const EmailNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchEmailNotifications();
  }, []);

  const fetchEmailNotifications = async () => {
    try {
      setLoading(true);
      const data = await EmailNotificationService.getEmailNotifications();
      setNotifications(data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch email notifications');
      showSnackbar('Failed to fetch email notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await EmailNotificationService.markAsRead(id);
      setNotifications(notifications.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      ));
      showSnackbar('Notification marked as read', 'success');
    } catch (error) {
      showSnackbar('Failed to mark notification as read', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await EmailNotificationService.deleteNotification(id);
      setNotifications(notifications.filter(notif => notif.id !== id));
      showSnackbar('Notification deleted', 'success');
    } catch (error) {
      showSnackbar('Failed to delete notification', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await EmailNotificationService.markAllAsRead();
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
      showSnackbar('All notifications marked as read', 'success');
    } catch (error) {
      showSnackbar('Failed to mark all notifications as read', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'BOOKING':
        return <LocalTaxi />;
      case 'PAYMENT':
        return <Payment />;
      case 'PROMO':
        return <Discount />;
      default:
        return <EmailIcon />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return diffInHours === 0 ? 'Just now' : `${diffInHours}h ago`;
    }
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button
          variant="outlined"
          onClick={fetchEmailNotifications}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="600">
          Email Notifications
        </Typography>
        <Button
          variant="outlined"
          onClick={handleMarkAllRead}
          sx={{ color: '#03930A', borderColor: '#03930A' }}
        >
          Mark All as Read
        </Button>
      </Box>

      {notifications.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <EmailIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No email notifications
          </Typography>
        </Box>
      ) : (
        <List>
          {notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem
                sx={{
                  bgcolor: notification.isRead ? 'transparent' : 'rgba(3, 147, 10, 0.05)',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'rgba(3, 147, 10, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: '#03930A' }}>
                  {getIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" fontWeight={notification.isRead ? 400 : 600}>
                        {notification.title}
                      </Typography>
                      {!notification.isRead && (
                        <Chip
                          label="New"
                          size="small"
                          sx={{
                            bgcolor: '#03930A',
                            color: 'white',
                            height: '20px',
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(notification.timestamp)}
                      </Typography>
                    </Box>
                  }
                />
                <Box>
                  {!notification.isRead && (
                    <IconButton
                      size="small"
                      onClick={() => handleMarkAsRead(notification.id)}
                      sx={{ color: '#03930A', mr: 1 }}
                    >
                      <DoneIcon />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(notification.id)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItem>
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmailNotifications; 