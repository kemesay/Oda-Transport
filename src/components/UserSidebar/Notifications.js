import React, { useState } from 'react';
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
} from '@mui/material';
import {
  NotificationsActive,
  LocalTaxi,
  Payment,
  Discount,
  Delete as DeleteIcon,
  Done as DoneIcon,
} from '@mui/icons-material';

const mockNotifications = [
  {
    id: 1,
    type: 'BOOKING',
    title: 'Upcoming Ride',
    message: 'Your ride to Denver International Airport is scheduled for tomorrow at 10:00 AM',
    timestamp: '2024-02-20T10:00:00',
    isRead: false,
  },
  {
    id: 2,
    type: 'PAYMENT',
    title: 'Payment Successful',
    message: 'Payment of $150 for your last ride has been processed successfully',
    timestamp: '2024-02-19T15:30:00',
    isRead: false,
  },
  {
    id: 3,
    type: 'PROMO',
    title: 'New Promo Code',
    message: 'Use code SPRING2024 for 20% off your next ride',
    timestamp: '2024-02-18T09:00:00',
    isRead: true,
  },
];

function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const getIcon = (type) => {
    switch (type) {
      case 'BOOKING':
        return <LocalTaxi />;
      case 'PAYMENT':
        return <Payment />;
      case 'PROMO':
        return <Discount />;
      default:
        return <NotificationsActive />;
    }
  };

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="600">
          Notifications
        </Typography>
        <Button
          variant="outlined"
          onClick={handleMarkAllRead}
          sx={{ color: '#03930A', borderColor: '#03930A' }}
        >
          Mark All as Read
        </Button>
      </Box>

      <List>
        {notifications.map((notification, index) => (
          <React.Fragment key={notification.id}>
            <ListItem
              sx={{
                bgcolor: notification.isRead ? 'transparent' : 'rgba(3, 147, 10, 0.05)',
                borderRadius: 1,
                mb: 1,
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
    </Box>
  );
}

export default Notifications; 