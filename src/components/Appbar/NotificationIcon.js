import React from 'react';
import {
  IconButton,
  Badge,
  styled,
  keyframes,
  Box,
  Tooltip
} from '@mui/material';
import {
  NotificationsActive,
  NotificationsNone,
} from '@mui/icons-material';

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
`;

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: 'red',
    color: 'white',
    minWidth: '20px',
    height: '20px',
    padding: '0 6px',
    fontSize: '0.75rem',
    fontWeight: 600,
    borderRadius: '10px',
    boxShadow: '0 0 0 2px #161F36',
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: unreadCount => unreadCount > 0 ? `${pulseAnimation} 2s infinite` : 'none',
      border: '1px solid #000000',
      content: '""',
    },
  },
}));

const RippleEffect = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  animation: `${pulseAnimation} 1.5s infinite`,
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
}));

const NotificationIcon = ({ unreadCount, onClick }) => {
  return (
    <Tooltip 
      title={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
      placement="bottom"
      arrow
    >
      <IconButton
        onClick={onClick}
        sx={{
          position: 'relative',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
      >
        {unreadCount > 0 && <RippleEffect />}
        <StyledBadge 
          badgeContent={unreadCount} 
          max={99}
          overlap="circular"
        >
          {unreadCount > 0 ? (
            <NotificationsActive 
              sx={{ 
                color: '#000',
                animation: unreadCount > 0 ? `${pulseAnimation} 2s infinite` : 'none',
              }} 
            />
          ) : (
            <NotificationsNone 
              sx={{ 
                color: '#000',
                opacity: 0.7,
              }} 
            />
          )}
        </StyledBadge>
      </IconButton>
    </Tooltip>
  );
};

export default NotificationIcon; 