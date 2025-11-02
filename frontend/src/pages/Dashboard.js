import React, { useEffect, useState } from 'react';
import api from '../utils/axiosConfig';
import {
    Typography,
    CircularProgress,
    Box,
    Grid,
    Card,
    CardContent,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch dashboard data from multiple endpoints
        Promise.all([
            api.get('/employees').catch(() => ({ data: [] })),
            api.get('/attendance').catch(() => ({ data: [] })),
            api.get('/payroll').catch(() => ({ data: [] }))
        ])
            .then(([employeesRes, attendanceRes, payrollRes]) => {
                const employees = employeesRes.data || [];
                const attendance = attendanceRes.data || [];
                const payroll = payrollRes.data || [];
                
                setData({
                    totalEmployees: employees.length,
                    totalAttendance: attendance.length,
                    totalPayroll: payroll.length,
                    totalSalary: payroll.reduce((sum, p) => sum + (p.netSalary || 0), 0)
                });
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching dashboard data:', error);
                setData({
                    totalEmployees: 0,
                    totalAttendance: 0,
                    totalPayroll: 0,
                    totalSalary: 0
                });
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    const stats = [
        {
            title: 'Total Employees',
            value: data?.totalEmployees || 0,
            icon: <PeopleIcon sx={{ fontSize: 40 }} />,
            color: '#1976d2',
            bgColor: '#e3f2fd'
        },
        {
            title: 'Attendance Records',
            value: data?.totalAttendance || 0,
            icon: <EventIcon sx={{ fontSize: 40 }} />,
            color: '#388e3c',
            bgColor: '#e8f5e9'
        },
        {
            title: 'Payroll Records',
            value: data?.totalPayroll || 0,
            icon: <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />,
            color: '#f57c00',
            bgColor: '#fff3e0'
        },
        {
            title: 'Total Salary Paid',
            value: `$${(data?.totalSalary || 0).toFixed(2)}`,
            icon: <AttachMoneyIcon sx={{ fontSize: 40 }} />,
            color: '#7b1fa2',
            bgColor: '#f3e5f5'
        }
    ];

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 4 }}>
                Dashboard Overview
            </Typography>
            <Grid container spacing={3}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card
                            elevation={3}
                            sx={{
                                borderRadius: 3,
                                height: '100%',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6
                                }
                            }}
                        >
                            <CardContent>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        mb: 2
                                    }}
                                >
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            backgroundColor: stat.bgColor,
                                            color: stat.color
                                        }}
                                    >
                                        {stat.icon}
                                    </Box>
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                    {stat.value}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {stat.title}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Dashboard;