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