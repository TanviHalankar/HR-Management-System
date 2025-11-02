import React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Header = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: isSidebarOpen ? `calc(100% - 240px)` : '100%',
        ml: isSidebarOpen ? '240px' : 0,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={toggleSidebar}
          edge="start"
          sx={{ mr: 2, ...(isSidebarOpen && { display: 'none' }) }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div">
          HRMS Dashboard
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;