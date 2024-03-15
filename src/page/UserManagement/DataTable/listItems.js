import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PeopleIcon from "@mui/icons-material/People";
import { TimeIcon } from "@mui/x-date-pickers";
import { DirectionsCar } from "@mui/icons-material";
import LocationOnIcon from "@mui/icons-material/LocationOn";

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
    link: "/dashboard/etraOptions",
    title: "etraOptions",
    icon: <TimeIcon />,
  },
  {
    index: 3,
    link: "/dashboard/pointToPointBookss",
    title: "pointToPointBooks",
    icon: <LocationOnIcon />,
  },
 
];

function ListItems() {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  useEffect(() => {
    menus.map((menu, index) => {
      if (menu.link === currentPath) {
        setSelectedIndex(index);
      }
    });
  }, []);
  const handleClick = (event, index) => {
    setSelectedIndex(index);
  };
  return menus.map((menu, key) => (
    <ListItemButton
      sx={{
        "&.Mui-selected": {
          color: "#488550",
          backgroundColor: "#FFF",
          borderRadius: "21.5px",
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
    </ListItemButton>
  ));
}

export default ListItems;
