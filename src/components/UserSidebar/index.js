import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Drawer,
  List,
  Divider,
  IconButton,
  Toolbar,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import UserListItems from "./UserListItems";
import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 240;

const UserDrawer = styled(Drawer, {
  shouldComponentUpdate: (props, nextProps) => props.isOpen !== nextProps.isOpen,
})(({ theme, isOpen }) => ({
  width: drawerWidth,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    backgroundColor: "#F2F2F2",
    borderRight: "1px solid rgba(0, 0, 0, 0.08)",
    ...(!isOpen && {
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


function UserSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  // Redirect to profile page if at root user path
  useEffect(() => {
    if (location.pathname === '/user') {
      navigate('/user/profile');
    }
  }, [location.pathname, navigate]);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <UserDrawer 
      variant="permanent" 
      isOpen={isOpen}
      sx={(theme) => ({
        '& .MuiDrawer-paper': {
          position: 'relative',
          whiteSpace: 'nowrap',
          width: drawerWidth,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          boxSizing: 'border-box',
          ...(!isOpen && {
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            width: theme.spacing(7),
            [theme.breakpoints.up('sm')]: {
              width: theme.spacing(9),
            },
          }),
        },
      })}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: [1],
          backgroundColor: "#fff",
        }}
      >
        <IconButton onClick={toggleDrawer}>
          <ChevronLeftIcon
            sx={{
              transform: isOpen ? "rotate(0deg)" : "rotate(180deg)",
              transition: "0.3s",
            }}
          />
        </IconButton>
      </Toolbar>
      
      <Divider sx={{ mb: 2 }} />
      
      <List 
        component="nav" 
        sx={{ 
          px: isOpen ? 2 : 1, 
          height: "calc(100% - 64px)",
          '& .MuiListItemIcon-root': {
            minWidth: isOpen ? 40 : 36,
          },
        }}
      >
        <UserListItems isOpen={isOpen} />
      </List>
    </UserDrawer>
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
