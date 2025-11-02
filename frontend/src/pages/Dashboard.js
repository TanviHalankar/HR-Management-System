import React, { useEffect, useState } from 'react';
import api from '../utils/axiosConfig';
import {
    Typography,
    CircularProgress,
    Box,
    Grid,
    Card,
    CardContent,
    Paper,
    LinearProgress,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        // Refresh data every 30 seconds
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = () => {
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
                    totalSalary: payroll.reduce((sum, p) => sum + (parseFloat(p.netSalary) || 0), 0)
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
    };

    const stats = [
        {
            title: 'Total Employees',
            value: data?.totalEmployees || 0,
            icon: <PeopleIcon sx={{ fontSize: 48 }} />,
            color: '#1976d2',
            bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            bgColor: '#e3f2fd',
            change: '+12%'
        },
        {
            title: 'Attendance Records',
            value: data?.totalAttendance || 0,
            icon: <EventIcon sx={{ fontSize: 48 }} />,
            color: '#388e3c',
            bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            bgColor: '#e8f5e9',
            change: '+5%'
        },
        {
            title: 'Payroll Records',
            value: data?.totalPayroll || 0,
            icon: <AccountBalanceWalletIcon sx={{ fontSize: 48 }} />,
            color: '#f57c00',
            bgGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            bgColor: '#fff3e0',
            change: '+8%'
        },
        {
            title: 'Total Salary Paid',
            value: `$${((data?.totalSalary || 0) / 1000).toFixed(1)}K`,
            fullValue: `$${(data?.totalSalary || 0).toFixed(2)}`,
            icon: <AttachMoneyIcon sx={{ fontSize: 48 }} />,
            color: '#7b1fa2',
            bgGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            bgColor: '#f3e5f5',
            change: '+15%'
        }
    ];

    if (loading) {
        return (
            <Box sx={{ width: '100%' }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 4, 
                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    Dashboard Overview
                </Typography>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress size={60} thickness={4} />
                        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                            Loading dashboard data...
                        </Typography>
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', background: 'linear-gradient(to bottom, #f5f7fa 0%, #c3cfe2 100%)', pb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography 
                    variant="h3" 
                    component="h1" 
                    sx={{ 
                        fontWeight: 700, 
                        mb: 1,
                        background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: { xs: '2rem', md: '2.5rem' }
                    }}
                >
                    Dashboard Overview
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                    Welcome to your HR Management System - Monitor your organization at a glance
                </Typography>
            </Box>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} lg={3} key={index}>
                        <Card
                            elevation={8}
                            sx={{
                                borderRadius: 4,
                                height: '100%',
                                position: 'relative',
                                overflow: 'hidden',
                                background: stat.bgGradient,
                                color: 'white',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    transform: 'translateY(-8px) scale(1.02)',
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                                }
                            }}
                        >
                            <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        justifyContent: 'space-between',
                                        mb: 3
                                    }}
                                >
                                    <Box
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 3,
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            backdropFilter: 'blur(10px)',
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {stat.icon}
                                    </Box>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 0.5,
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 2,
                                        fontSize: '0.75rem'
                                    }}>
                                        <TrendingUpIcon sx={{ fontSize: 18 }} />
                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                            {stat.change}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography 
                                    variant="h3" 
                                    sx={{ 
                                        fontWeight: 800, 
                                        mb: 1,
                                        fontSize: { xs: '2rem', md: '2.5rem' },
                                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    {stat.value}
                                </Typography>
                                {stat.fullValue && (
                                    <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mb: 1 }}>
                                        {stat.fullValue}
                                    </Typography>
                                )}
                                <Typography variant="body1" sx={{ fontWeight: 500, opacity: 0.95 }}>
                                    {stat.title}
                                </Typography>
                            </CardContent>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '4px',
                                    background: 'rgba(255, 255, 255, 0.3)',
                                }}
                            />
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Additional Info Cards */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper 
                        elevation={4}
                        sx={{ 
                            p: 3, 
                            borderRadius: 3,
                            background: 'white',
                            height: '100%'
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
                            Quick Actions
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: '#f5f5f5', '&:hover': { backgroundColor: '#eeeeee', cursor: 'pointer' } }}>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>Add New Employee</Typography>
                                <Typography variant="caption" color="text.secondary">Create a new employee record</Typography>
                            </Box>
                            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: '#f5f5f5', '&:hover': { backgroundColor: '#eeeeee', cursor: 'pointer' } }}>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>Record Attendance</Typography>
                                <Typography variant="caption" color="text.secondary">Mark employee attendance</Typography>
                            </Box>
                            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: '#f5f5f5', '&:hover': { backgroundColor: '#eeeeee', cursor: 'pointer' } }}>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>Process Payroll</Typography>
                                <Typography variant="caption" color="text.secondary">Generate payroll records</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper 
                        elevation={4}
                        sx={{ 
                            p: 3, 
                            borderRadius: 3,
                            background: 'white',
                            height: '100%'
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
                            System Status
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">API Connection</Typography>
                                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>Connected</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={100} sx={{ height: 8, borderRadius: 1 }} />
                            </Box>
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Database Status</Typography>
                                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>Active</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={100} sx={{ height: 8, borderRadius: 1 }} />
                            </Box>
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Services Running</Typography>
                                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>All Operational</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={100} sx={{ height: 8, borderRadius: 1 }} />
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;