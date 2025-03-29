import React from 'react';
import { 
  Box, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem, 
  Typography 
} from '@mui/material';
import RSButton from "../RSButton";

const UserSection = ({
  isAuthenticated,
  userMenuAnchor,
  onAvatarClick,
  onMenuClose,
  onChangePassword,
  onLogout,
  onLoginClick
}) => {
  return (
    <Box sx={{ flexGrow: 0 }}>
      {isAuthenticated ? (
        <Box>
          <IconButton onClick={onAvatarClick}>
            <Avatar
              sx={{ width: 56, height: 56 }}
            />
          </IconButton>

          <Menu
            sx={{ mt: "45px" }}
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
            <MenuItem onClick={onChangePassword}>
              <Typography textAlign="center">Change Password</Typography>
            </MenuItem>
            <MenuItem onClick={onLogout}>
              <Typography textAlign="center">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
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