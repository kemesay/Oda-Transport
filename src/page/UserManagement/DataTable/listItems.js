import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Collapse, List } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import { ConnectingAirports } from "@mui/icons-material";
import { HourglassBottom } from "@mui/icons-material";
import { Stop } from "@mui/icons-material";
import { Portrait } from "@mui/icons-material";
import { TimeIcon } from "@mui/x-date-pickers";
import { LocalAirport } from "@mui/icons-material";
import { DirectionsCar, Inbox as InboxIcon, ExpandLess, ExpandMore, StarBorder } from "@mui/icons-material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { FlightTakeoff } from "@mui/icons-material";

const menus = [
  {
    index: 0,
    link: "/dashboard/users",
    title: "users",
    icon: <PeopleIcon />,
  },
  {
    index: 1,
    link: "/dashboard/cars",
    title: "cars",
    icon: <DirectionsCar />,
  },
  {
    index: 2,
    link: "/dashboard/extraOptions",
    title: "extraOptions",
    icon: <TimeIcon />,
  },
  {
    index: 3,
    link: "/dashboard/pointToPointBookss",
    title: "pointToPointBooks",
    icon: <LocationOnIcon />,
  },
  {
    index: 4,
    link: "/dashboard/additionalstop",
    title: "additional-stop",
    icon: <Stop />,
  },
  {
    index: 5,
    link: "/dashboard/hourlycharacter",
    title: "hourly-book",
    icon: <HourglassBottom />,
  },

  // {
  //   index: 6,
  //   link: "/dashboard/adminbooking",
  //   title: "Admin-Booking",
  //   icon: <GrUserAdmin />,
  // },
  {
    index: 6,
    link: "/dashboard/airportbooking",
    title: "airportbooking",
    icon: <LocalAirport />,
    subItems: [
      {
        index: 0,
        link: "/dashboard/airports",
        title: "Airports",
        // icon: <Portrait />,

      },
      {
        index: 1,
        link: "/dashboard/airportPickupPreference",
        title: "AirportPickupPreference",
        icon: <FlightTakeoff/>,

      },
      {
        index: 2,
        link: "/dashboard/airportbook",
        title: "Airport Book",
        icon: <LocalAirport/>,

      },
    ],
  },
];

function ListItems() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    menus.forEach((menu, index) => {
      if (menu.link === currentPath) {
        setSelectedIndex(index);
      }
    });
  }, []);

  const handleClick = (event, index) => {
    setSelectedIndex(index);
    if (menus[index].subItems) {
      setOpen(!open);
    } else {
      navigate(menus[index].link);
    }
  };

  return (
    <>
      {menus.map((menu, key) => (
        <React.Fragment key={key}>
          <ListItemButton
            sx={{
              "&.Mui-selected": {
                color: "#488550",
                backgroundColor: "#FFF",
                borderRadius: "21.5px",
                paddingRight: "6px"
              },
            }}
            selected={selectedIndex === menu.index}
            onClick={(event) => {
              const index = menu.index;
              navigate(menu.link);
              handleClick(event, index);
            }}
          >
            <ListItemIcon sx={{ color: selectedIndex === menu.index && "#488550" }}>
              {menu.icon}
            </ListItemIcon>
            <ListItemText primary={menu.title} />
            {menu.subItems && (open ? <ExpandLess /> : <ExpandMore />) }
          </ListItemButton>
          {menu.subItems && (
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {menu.subItems.map((subItem, index) => (
                  <ListItemButton
                    key={index}
                    sx={{ pl: 4 }}
                    onClick={() => {
                      setSelectedIndex(subItem.index);
                      navigate(subItem.link);
                    }}
                  >
                    <ListItemIcon>
                      <StarBorder />
                    </ListItemIcon>
                    <ListItemText primary={subItem.title} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      ))}
    </>
  );
}

export default ListItems;
