import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, scroller } from "react-scroll";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Stack,
  styled,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  Drawer,
  Box,
  List,
  ListItem,
  Avatar,
  ListItemButton,
  IconButton,
  Menu,
  Typography,
  MenuItem,
  Toolbar,
} from "@mui/material";
import { TiThMenuOutline } from "react-icons/ti";
import logo from "../../assets/images/Odaa Transportation - Logo-01.svg";
import logo1 from "../../assets/images/PNG.png";

import RSButton from "../RSButton";
import ChangePasswordDrawer from "./ChangePassword";
import { logout, setIsAuthenticated } from "../../store/reducers/authReducer";
import { getUserRole } from "../../util/authUtil";
import MobileNavigation from './MobileNavigation';
import DesktopNavigation from './DesktopNavigation';
import UserSection from './UserSection';

const NAVBAR_MENUS = {
  public: [
    { title: "Home", link: "/", scrollLink: "home" },
    { title: "About Us", link: "/about-us", scrollLink: "aboutus" },
    { title: "Contact Us", link: "/contact-us", scrollLink: "contact", offset: -100 },
    { title: "FAQ", link: "/faq", scrollLink: "faq" },
    { title: "Book Ride Now", link: "/home/1"},
  ],
  authenticated: [
    { title: "Book Ride Now", link: "/home/1" },
    { title: "My Order", link: "/my-order" },
  ]
};

/**
 * @typedef {Object} HeaderProps
 * @property {() => void} handleUsernameFocus - Callback to focus username input
 */

/**
 * Header component that displays the main navigation bar
 * @param {HeaderProps} props
 */
function Header({ handleUsernameFocus }) {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  // Hooks
  const dispatch = useDispatch();
  const location = useLocation();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const { isSigninSuccess, isAuthenticated } = useSelector(
    (state) => state.authReducer
  );

  const StyledTabs = styled(Tabs)({
    "& .MuiTabs-indicator": {
      display: "none",
    },
  });

  const StyledTab = styled(Tab)(({ theme }) => ({
    textTransform: "capitalize",
    color: theme.palette.black.main,
    fontWeight: 500,
    fontSize: "15px",
    "&.Mui-selected": {
      color: theme.palette.light.main,
      backgroundColor: theme.palette.info.main,
      borderRadius: 5,
    },
  }));

  const scrollToSection = (sectionId, offset = -100) => {
    navigate("/");
    scroller.scrollTo(sectionId, {
      smooth: true,
      duration: 500,
      offset: offset,
      spy: true,
      activeClass: 'active'
    });
  };
  
  const getNavbarMenu = () => {
    if (!isAuthenticated) return NAVBAR_MENUS.public;
    return getUserRole() === "user" ? NAVBAR_MENUS.authenticated : [];
  };

  const handleNavigation = (menu) => {
    if (isAuthenticated) {
      navigate(menu.link);
      return;
    }

    if (menu.title === "Book Ride Now") {
      navigate(menu.link);
    } else {
      scrollToSection(menu.scrollLink, menu.offset);
    }
  };

  const handleOpenUserMenu = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = (e) => {
    handleCloseUserMenu(e);
    dispatch(logout());
    navigate("/");
  };

  const handleClickOpen = () => {
    setIsPasswordDialogOpen(true);
  };

  const handleChangePassword = () => {
    handleClickOpen();
  };

  useEffect(() => {
    dispatch(setIsAuthenticated());
  }, [isSigninSuccess]);

  useEffect(() => {
    switch (location.pathname) {
      case "/home/1":
      case "/home/2":
      case "/home/3":
        setActiveTab(0);
        break;
      case "/my-order":
        setActiveTab(1);
        break;
      default:
        break;
    }
  }, [location]);

  // Styled components
  const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    height: "auto",
    position: "sticky",
    justifyContent: "center",
    alignItems: "space-between",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  }));

  const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    padding: theme.spacing(0, 5),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(0, 2),
    },
  }));

  const LogoImage = styled("img")({
    width: "100px",
    height: "70px",
    cursor: "pointer",
    transition: "transform 0.2s ease-in-out",
    "&:hover": {
      transform: "scale(1.05)",
    },
  });

  return (
    <StyledAppBar>
      <StyledToolbar disableGutters>
        <Stack
          spacing={6}
          direction="row"
          alignItems="center"
          sx={{ flexGrow: 1 }}
        >
          <LogoImage
            alt="Odaa Transportation Logo"
            src={logo1}
            onClick={() => navigate("/")}
          />
          
          {isMobile ? (
            <MobileNavigation 
              isOpen={isMobileMenuOpen}
              onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              menus={getNavbarMenu()}
              onNavigate={handleNavigation}
            />
          ) : (
            <DesktopNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              menus={getNavbarMenu()}
              onNavigate={handleNavigation}
            />
          )}
        </Stack>

        <UserSection
          isAuthenticated={isAuthenticated}
          userMenuAnchor={userMenuAnchor}
          onAvatarClick={handleOpenUserMenu}
          onMenuClose={handleCloseUserMenu}
          onChangePassword={() => setIsPasswordDialogOpen(true)}
          onLogout={handleLogout}
          onLoginClick={() => {
            scrollToSection("auth");
            handleUsernameFocus();
          }}
        />
      </StyledToolbar>

      <ChangePasswordDrawer
        open={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
      />
    </StyledAppBar>
  );
}
export default Header;