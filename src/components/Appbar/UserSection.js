import React, { useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Stack,
  Popover,
  Button,
  CircularProgress
} from '@mui/material';
import RSButton from "../RSButton";
import { remote_host } from '../../globalVariable';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import NotificationIcon from './NotificationIcon';

// Mock notifications (you can replace this with your actual notifications data)
const mockNotifications = [
  {
    id: 1,
    type: 'BOOKING',
    title: 'Upcoming Ride',
    message: 'Your ride is scheduled for tomorrow at 10:00 AM',
    timestamp: '2024-02-20T10:00:00',
    isRead: false,
  },
  {
    id: 2,
    type: 'PAYMENT',
    title: 'Payment Successful',
    message: 'Payment of $150 has been processed',
    timestamp: '2024-02-19T15:30:00',
    isRead: false,
  },
];

const UserSection = ({
  isAuthenticated,
  userMenuAnchor,
  onAvatarClick,
  onMenuClose,
  onChangePassword,
  onLogout,
  onLoginClick
}) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = sessionStorage.getItem("access_token");

        // Log the token and request details for debugging

        const response = await axios.get(`${remote_host}/api/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            // Add any other required headers
          },
        });

        // Handle different response structures
        const userData = response.data;
        const fullName = userData?.fullName ||
          userData?.full_name ||
          `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() ||
          userData?.username ||
          'User';

        setUserInfo({
          ...userData,
          fullName: fullName
        });

      } catch (error) {
        console.error("Error fetching user info:", error);
        console.error("Error response:", error.response);
        setError(error.message);

        // Set fallback user info
        setUserInfo({
          fullName: 'Guest User',
          email: 'guest@example.com'
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserInfo();
    }
  }, [isAuthenticated]);

  // Get user initial safely
  const getUserInitial = () => {
    if (!userInfo) return '?';
    const fullName = userInfo.fullName || '';
    return fullName.charAt(0).toUpperCase() || '?';
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleViewAllNotifications = () => {
    handleNotificationClose();
    navigate('/user/notifications');
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

  // Loading state
  if (loading && isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={24} sx={{ color: '#000' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 0 }}>
      {isAuthenticated ? (
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Replace the old notification icon with the new component */}
          {/* <NotificationIcon
            unreadCount={unreadCount}
            onClick={handleNotificationClick}
          /> */}

          {/* User Profile Section */}
          <Stack
            direction="column"
            spacing={1}
            alignItems="center"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '2px 4px 2px 8px',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
              }
            }}
          >
            <IconButton
              onClick={onAvatarClick}
              sx={{
                p: 0,
                '&:hover': {
                  backgroundColor: 'transparent'
                }
              }}
            >
              <Avatar
                sx={{
                  width: 35,
                  height: 35,
                  bgcolor: error ? '#f44336' : "green",
                  color: "white",
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                {getUserInitial()}
              </Avatar>
            </IconButton>
            {error ? (
              <Typography
                variant="body2"
                color="error"
                sx={{ fontSize: '0.75rem' }}
              >
                Error loading profile
              </Typography>
            ) : (
              <Typography
                variant="body1"
                sx={{
                  color: "#000",
                  fontWeight: 300,
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '150px'
                }}
              >
                {userInfo?.fullName || 'Loading...'}
              </Typography>
            )}


          </Stack>

          {/* Notifications Popover */}
          <Popover
            open={Boolean(notificationAnchor)}
            anchorEl={notificationAnchor}
            onClose={handleNotificationClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                width: 360,
                maxHeight: 480,
                mt: 1.5,
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
              }
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <Typography variant="h6" fontWeight={600}>
                Notifications
              </Typography>
            </Box>
            <Box sx={{ maxHeight: 360, overflow: 'auto' }}>
              {notifications.map((notification) => (
                <Box
                  key={notification.id}
                  sx={{
                    p: 2,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                    backgroundColor: notification.isRead ? 'transparent' : 'rgba(3, 147, 10, 0.05)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    }
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={notification.isRead ? 400 : 600}>
                    {notification.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {formatTimestamp(notification.timestamp)}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <Button
                fullWidth
                onClick={handleViewAllNotifications}
                sx={{
                  color: '#03930A',
                  '&:hover': {
                    backgroundColor: 'rgba(3, 147, 10, 0.05)',
                  }
                }}
              >
                View All Notifications
              </Button>
            </Box>
          </Popover>

          {/* User Menu */}
          <Menu
            sx={{
              mt: "45px",
              "& .MuiMenu-paper": {
                right: "0 !important",
                left: "auto !important",
                minWidth: "200px",
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                borderRadius: "8px",
                backgroundColor: "#161F36",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                "&:before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  right: 28,
                  width: 10,
                  height: 10,
                  bgcolor: "black",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                  borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                }
              },
              "& .MuiMenuItem-root": {
                justifyContent: "center",
                py: 1.5,
                transition: "all 0.3s ease",
                color: "#fff",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                "&:last-child": {
                  borderBottom: "none"
                },
                "&:hover": {
                  backgroundColor: "#03930A",
                  color: "#ffffff",
                  transform: "translateX(5px)",
                  "& .MuiTypography-root": {
                    fontWeight: 600
                  }
                }
              }
            }}
            id="menu-appbar"
            anchorEl={userMenuAnchor}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(userMenuAnchor)}
            onClose={onMenuClose}
          >
            <MenuItem onClick={onLogout}>
              <Typography
                textAlign="center"
                sx={{
                  fontSize: "0.95rem",
                  letterSpacing: "0.5px"
                }}
              >
                Logout
              </Typography>
            </MenuItem>
            <MenuItem onClick={onChangePassword}>
              <Typography
                textAlign="center"
                sx={{
                  fontSize: "0.95rem",
                  letterSpacing: "0.5px"
                }}
              >
                Change Password
              </Typography>
            </MenuItem>
          </Menu>
        </Stack>
      ) : (
        <RSButton
          borderradius={"5px"}
          variant="contained"
          backgroundcolor={"#4D4C4C"}
          onClick={onLoginClick}
        >
          Login/Signup
        </RSButton>
      )}
    </Box>
  );
};

export default UserSection;
