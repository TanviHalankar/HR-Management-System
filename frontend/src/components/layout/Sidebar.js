import React from 'react';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemText } from '@mui/material';

const Sidebar = () => {
    return (
        <div>
            <List>
                <ListItem button component={Link} to="/">
                    <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem button component={Link} to="/employees">
                    <ListItemText primary="Employees" />
                </ListItem>
                <ListItem button component={Link} to="/attendance">
                    <ListItemText primary="Attendance" />
                </ListItem>
                <ListItem button component={Link} to="/payroll">
                    <ListItemText primary="Payroll" />
                </ListItem>
            </List>
        </div>
    );
};

export default Sidebar;