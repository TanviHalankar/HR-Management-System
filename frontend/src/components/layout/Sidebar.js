import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    Drawer, 
    List, 
    ListItem, 
    ListItemIcon, 
    ListItemText, 
    Box,
    Typography,
    Divider
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const drawerWidth = 260;

const Sidebar = ({ isOpen }) => {
    const location = useLocation();

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Employees', icon: <PeopleIcon />, path: '/employees' },
        { text: 'Attendance', icon: <EventIcon />, path: '/attendance' },
        { text: 'Payroll', icon: <AccountBalanceWalletIcon />, path: '/payroll' },
    ];

    return (
        <Drawer
            variant="persistent"
            open={isOpen}
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    background: 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)',
                    color: 'white',
                    borderRight: 'none',
                    boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
                },
            }}
        >
            <Box sx={{ p: 3, mt: 8, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, fontSize: '1.2rem' }}>
                    Navigation
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Manage your HR system
                </Typography>
            </Box>
            <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', mb: 1 }} />
            <List sx={{ px: 2 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem
                            key={item.text}
                            component={Link}
                            to={item.path}
                            sx={{
                                mb: 1,
                                borderRadius: 2,
                                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    transform: 'translateX(4px)',
                                },
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                            }}
                        >
                            <ListItemIcon sx={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.7)', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.text} 
                                primaryTypographyProps={{
                                    fontWeight: isActive ? 600 : 400,
                                    fontSize: '0.95rem'
                                }}
                            />
                        </ListItem>
                    );
                })}
            </List>
        </Drawer>
    );
};

export default Sidebar;