import React, { useState, useEffect } from "react";
import { styled, createTheme, ThemeProvider  } from "@mui/material/styles";
import {
  // Drawer,
  List,
  Divider,
  IconButton,
  Toolbar,
} from "@mui/material";
import Box from "@mui/material/Box"; 
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import UserListItems from "./UserListItems";
import { useNavigate, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { Stack } from "@mui/material";
import Container from "@mui/material/Container";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer, {
  shouldComponentUpdate: (prop) => prop !== "open",
})(({ theme, open }) => ({
 "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));
const defaultTheme = createTheme();
const drawerStyle = {
  ".MuiDrawer-paper": {
    zIndex: 0,
    backgroundColor: "#F2F2F2",
    marginTop: "5px",
    paddingX: 0,
  },
};

function UserSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };
  // Redirect to profile page if at root user path
  // useEffect(() => {
  //   if (location.pathname === '/user') {
  //     navigate('/user/profile');
  //   }
  // }, [location.pathname, navigate]);



  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />

        <Drawer variant="permanent" open={isOpen} sx={drawerStyle}>
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [0],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon
                sx={{
                  rotate: isOpen ? "0deg" : "180deg",
                  transition: "0.4s ease-in-out",
                }}
              />
            </IconButton>
          </Toolbar>
          <Divider sx={{ border: "2px solid #FFF" }} />
          <List component="nav" sx={{ height: "100%" }}>
            <Stack
              sx={{ height: "100%", paddingBottom: "24px" }}
              direction="column"
              justifyContent="space-between"
              alignItems="stretch"
            >
              <Box>
                <UserListItems />
              </Box>
            </Stack>
          </List>
        </Drawer>

        <Box
          sx={{
            backgroundColor: "#FFF",
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
            pl: 0,
            ml: 1,
          }}
        >
          <Container 
            maxWidth={false} 
            disableGutters
            sx={{ 
              p: 0,
              m: 0,
              width: '100%',
              maxWidth: 'none'
            }}
          >
            <Outlet />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}


export default UserSidebar;

export { default as UserProfile } from './UserProfile';
export { default as PaymentCards } from './PaymentCards';
export { default as PaymentHistory } from './PaymentHistory';
export { default as SavedAddresses } from './SavedAddresses';
export { default as FavoriteRoutes } from './FavoriteRoutes';
export { default as PromoCodes } from './PromoCodes';
export { default as Notifications } from './Notifications';
export { default as UserSettings } from './UserSettings';
