import React from 'react';
import { Tabs, Tab, styled } from '@mui/material';

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

const DesktopNavigation = ({ activeTab, menus, onNavigate }) => {
  return (
    <StyledTabs
      sx={{ marginLeft: "0px" }}
      value={activeTab}
      onChange={(e, value) => {
        const menu = menus[value];
        if (menu) onNavigate(menu, value);
      }}
    >
      {menus.map((menu) => (
        <StyledTab key={menu.title} label={menu.title} />
      ))}
    </StyledTabs>
  );
};

export default DesktopNavigation; 