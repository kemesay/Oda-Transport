import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  List,
  Badge,
  Box,
  Divider,
} from "@mui/material";
import {
  Person as ProfileIcon,
  Receipt as OrderIcon,
  CreditCard as PaymentIcon,
  LocalOffer as PromoIcon,
  Favorite as FavoriteIcon,
  Settings as SettingsIcon,
  LocationOn as AddressIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";

const userMenus = [

  {
    index: 0,
    title: "My Bookings",
    icon: <OrderIcon />,
    subItems: [
      {
        index: 0,
        link: "/user/my-order?type=current",
        title: "Current Bookings",
        badge: "2",
      },
      {
        index: 1,
        link: "/user/my-order?type=history",
        title: "Booking History",
      },
    ],
  },
  {
    index: 1,
    link: "/user/profile",
    title: "My Profile",
    icon: <ProfileIcon />,
  },
  {
    index: 2,
    title: "Payments",
    icon: <PaymentIcon />,
    subItems: [
      {
        index: 0,
        link: "/user/payment/cards",
        title: "Payment Methods",
      },
      {
        index: 1,
        link: "/user/payment/history",
        title: "Payment History",
      },
    ],
  },
  // {
  //   index: 3,
  //   link: "/user/addresses",
  //   title: "Saved Addresses",
  //   icon: <AddressIcon />,
  // },
  // {
  //   index: 4,
  //   link: "/user/favorites",
  //   title: "Favorite Routes",
  //   icon: <FavoriteIcon />,
  //   badge: "3",
  // },
  // {
  //   index: 5,
  //   link: "/user/promo-codes",
  //   title: "Promo Codes",
  //   icon: <PromoIcon />,
  //   badge: "2",
  // },

  // {
  //   index: 7,
  //   link: "/user/settings",
  //   title: "Settings",
  //   icon: <SettingsIcon />,
  // },

];

function UserListItems({ isOpen }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSubIndex, setSelectedSubIndex] = useState(null);
  const [openMenus, setOpenMenus] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;


  useEffect(() => {
    userMenus.forEach((menu, index) => {
      if (menu.link === path) {
        setSelectedIndex(index);
      }
      if (menu.subItems) {
        menu.subItems.forEach((subItem) => {
          if (subItem.link === path) {
            setSelectedIndex(menu.index);
            setSelectedSubIndex(subItem.index);
            setOpenMenus((prev) => ({ ...prev, [menu.index]: true }));
          }
        });
      }
    });
  }, [location.pathname]);

  const handleClick = (menu) => {
    setSelectedIndex(menu.index);
    if (menu.subItems) {
      setOpenMenus((prev) => ({
        ...prev,
        [menu.index]: !prev[menu.index],
      }));
    } else {
      navigate(menu.link);
    }
  };

  const handleSubItemClick = (parentIndex, subItem) => {
    setSelectedIndex(parentIndex);
    setSelectedSubIndex(subItem.index);
    navigate(subItem.link);
  };

  return (
    <>
    <List sx={{ width: "100%", p: 0 }}>
      {userMenus.map((menu, key) => (
        <React.Fragment key={menu.index}>
          {menu.divider ? (
            <Divider sx={{ my: 1 }} />
          ) : (
            <>
              <ListItemButton
                sx={{
                  borderRadius: "21.5px",
                  paddingRight: "6px",
                  mb: 1.5,
                  "&.Mui-selected": {
                    color: menu.color === "error" ? "#CA0F0D" : "#03930A",
                    bgcolor: menu.color === "error" 
                      ? "rgba(202, 15, 13, 0.08)"
                      : "rgba(3, 147, 10, 0.08)",
                    "&:hover": {
                      bgcolor: menu.color === "error"
                        ? "rgba(202, 15, 13, 0.12)"
                        : "rgba(3, 147, 10, 0.12)",
                    },
                  },
                  "&:hover": {
                    bgcolor: menu.color === "error"
                      ? "rgba(202, 15, 13, 0.04)"
                      : "rgba(3, 147, 10, 0.04)",
                  },
                }}
                selected={selectedIndex === menu.index}
                onClick={() => handleClick(menu)}
              >
                <ListItemIcon
                  sx={{
                    color: selectedIndex === menu.index
                      ? (menu.color === "error" ? "#CA0F0D" : "#03930A")
                      : "inherit",
                    minWidth: 40,
                  }}
                >
                  {menu.badge ? (
                    <Badge badgeContent={menu.badge} color="error">
                      {menu.icon}
                    </Badge>
                  ) : (
                    menu.icon
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={menu.title}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: selectedIndex === menu.index ? 600 : 400,
                  }}
                />
                {menu.subItems && (
                  openMenus[menu.index] ? <ExpandLess /> : <ExpandMore />
                )}
              </ListItemButton>

              {menu.subItems && (
                <Collapse in={openMenus[menu.index]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {menu.subItems.map((subItem) => (
                      <ListItemButton
                        key={subItem.index}
                        sx={{
                          pl: 6,
                          py: 0.5,
                          ml: 2,
                          "&.Mui-selected": {
                            borderRadius: "21.5px",
                            PaddingRight: "6px",
                            color: "#03930A",
                            bgcolor: "rgba(3, 147, 10, 0.08)",
                          },
                        }}
                        selected={
                          selectedIndex === menu.index &&
                          selectedSubIndex === subItem.index
                        }
                        onClick={() => handleSubItemClick(menu.index, subItem)}
                      >
                        <ListItemText
                          primary={subItem.title}
                          primaryTypographyProps={{
                            fontSize: "0.875rem",
                          }}
                        />
                        {subItem.badge && (
                          <Box>
                            <Badge
                              badgeContent={subItem.badge}
                              color="error"
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        )}
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </>
          )}
        </React.Fragment>
      ))}
    </List>
    </>
  );
}

export default UserListItems; 