import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  IconButton 
} from '@mui/material';
import { TiThMenuOutline } from "react-icons/ti";
import RSButton from "../RSButton";

const MobileNavigation = ({ isOpen, onToggle, menus, onNavigate }) => {
  return (
    <>
      <IconButton onClick={onToggle}>
        <TiThMenuOutline color="info.main" />
      </IconButton>
      
      <Drawer anchor="left" open={isOpen} onClose={onToggle}>
        <List>
          {menus.map((menu) => (
            <ListItem key={menu.title}>
              <ListItemButton onClick={() => {
                onNavigate(menu);
                onToggle();
              }}>
                <RSButton
                  backgroundcolor={"#171414"}
                  txtcolor={"#FFF"}
                  fontSize={16}
                  fontWeight={700}
                >
                  {menu.title}
                </RSButton>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default MobileNavigation; 