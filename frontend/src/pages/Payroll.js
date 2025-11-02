import React, { useEffect, useState } from 'react';
import api from '../utils/axiosConfig';
import {
    Typography,
    CircularProgress,
    Button,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Alert,
    Snackbar,
    TextField,
    Chip,
    Grid,
    Card,
    CardContent,
    Divider,
    InputAdornment,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RemoveIcon from '@mui/icons-material/Remove';
import CalculateIcon from '@mui/icons-material/Calculate';

const Payroll = () => {
    const [payroll, setPayroll] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employeePayroll, setEmployeePayroll] = useState({});
    const [editPayroll, setEditPayroll] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchEmployees();
        fetchPayroll();
    }, []);

    useEffect(() => {
        // Initialize employee payroll state
        const payrollMap = {};
        employees.forEach(emp => {
            const payrollRecord = payroll.find(record => record.employeeId === emp.id);
            payrollMap[emp.id] = {
                basicPay: payrollRecord?.basicPay || emp.salary || '',
                bonus: payrollRecord?.bonus || 0,
                deductions: payrollRecord?.deductions || 0,
                record: payrollRecord || null
            };
        });
        setEmployeePayroll(payrollMap);
    }, [employees, payroll]);

    const fetchPayroll = () => {
        api.get('/payroll')
            .then((response) => {
                setPayroll(response.data || []);
            })
            .catch((error) => {
                console.error('Error fetching payroll:', error);
            });
    };

    const fetchEmployees = () => {
        setLoading(true);
        api.get('/employees')
            .then((response) => {
                setEmployees(response.data || []);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching employees:', error);
                setLoading(false);
            });
    };

    const calculateNetSalary = (basicPay, bonus, deductions) => {
        const basic = parseFloat(basicPay) || 0;
        const bonusAmount = parseFloat(bonus) || 0;
        const deductionsAmount = parseFloat(deductions) || 0;
        return (basic + bonusAmount - deductionsAmount).toFixed(2);
    };

    const handlePayrollChange = (employeeId, field, value) => {
        setEmployeePayroll(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                [field]: value
            }
        }));
    };

    const savePayroll = (employeeId) => {
        const empPayroll = employeePayroll[employeeId];
        if (!empPayroll || !empPayroll.basicPay) {
            setSnackbar({ open: true, message: 'Please enter basic pay', severity: 'error' });
            return;
        }

        const payrollData = {
            employeeId: parseInt(employeeId),
            basicPay: parseFloat(empPayroll.basicPay) || 0,
            bonus: parseFloat(empPayroll.bonus) || 0,
            deductions: parseFloat(empPayroll.deductions) || 0,
            netSalary: parseFloat(calculateNetSalary(empPayroll.basicPay, empPayroll.bonus, empPayroll.deductions))
        };

        const existingRecord = payroll.find(record => record.employeeId === employeeId);

        if (existingRecord) {
            // Update existing record
            api.put(`/payroll/${existingRecord.id}`, payrollData)
                .then(() => {
                    setSnackbar({ open: true, message: 'Payroll updated successfully!', severity: 'success' });
                    fetchPayroll();
                })
                .catch((error) => {
                    setSnackbar({ open: true, message: 'Error updating payroll: ' + (error.response?.data?.message || error.message), severity: 'error' });
                });
        } else {
            // Create new record
            api.post('/payroll', payrollData)
                .then(() => {
                    setSnackbar({ open: true, message: 'Payroll saved successfully!', severity: 'success' });
                    fetchPayroll();
                })
                .catch((error) => {
                    setSnackbar({ open: true, message: 'Error saving payroll: ' + (error.response?.data?.message || error.message), severity: 'error' });
                });
        }
    };

    const handleDeletePayroll = (id) => {
        if (window.confirm('Are you sure you want to delete this payroll record?')) {
            api.delete(`/payroll/${id}`)
                .then(() => {
                    setSnackbar({ open: true, message: 'Payroll record deleted successfully!', severity: 'success' });
                    fetchPayroll();
                })
                .catch((error) => {
                    setSnackbar({ open: true, message: 'Error deleting payroll: ' + (error.response?.data?.message || error.message), severity: 'error' });
                });
        }
    };

    const applyEmployeeSalary = (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        if (employee && employee.salary) {
            handlePayrollChange(employeeId, 'basicPay', employee.salary);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', background: 'transparent' }}>
            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography 
                        variant="h3" 
                        component="h1" 
                        sx={{ 
                            fontWeight: 700,
                            mb: 1,
                            background: 'linear-gradient(45deg, #f57c00, #ff9800)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: { xs: '2rem', md: '2.5rem' }
                        }}
                    >
                        Payroll Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                        Calculate and manage employee payroll, bonuses, and deductions
                    </Typography>
                </Box>
            </Box>

            {/* Employee Payroll Cards */}
            {employees.length === 0 ? (
                <Paper elevation={4} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                        No employees found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Add employees from the Employees page to manage payroll
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {employees.map((employee) => {
                        const empPayroll = employeePayroll[employee.id] || { basicPay: employee.salary || '', bonus: 0, deductions: 0 };
                        const netSalary = calculateNetSalary(empPayroll.basicPay, empPayroll.bonus, empPayroll.deductions);
                        const hasRecord = payroll.find(record => record.employeeId === employee.id);

                        return (
                            <Grid item xs={12} md={6} lg={4} key={employee.id}>
                                <Card 
                                    elevation={4}
                                    sx={{ 
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        border: hasRecord ? '2px solid #ff9800' : '2px solid transparent',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 8
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        {/* Employee Info */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                            <Box
                                                sx={{
                                                    width: 50,
                                                    height: 50,
                                                    borderRadius: '50%',
                                                    backgroundColor: '#fff3e0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: 2
                                                }}
                                            >
                                                <PersonIcon sx={{ fontSize: 28, color: '#ff9800' }} />
                                            </Box>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                    {employee.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {employee.designation} • {employee.department}
                                                </Typography>
                                            </Box>
                                            {hasRecord && (
                                                <Chip
                                                    icon={<AttachMoneyIcon />}
                                                    label="Payroll Set"
                                                    color="warning"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            )}
                                        </Box>

                                        <Divider sx={{ mb: 2 }} />

                                        {/* Salary Information */}
                                        <Box sx={{ mb: 2, p: 2, borderRadius: 2, backgroundColor: '#fff9e6', border: '1px solid #ffe0b2' }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                                Current Employee Salary
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f57c00', mb: 1 }}>
                                                ${parseFloat(employee.salary || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </Typography>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => applyEmployeeSalary(employee.id)}
                                                sx={{ 
                                                    mt: 0.5,
                                                    fontSize: '0.75rem',
                                                    borderColor: '#ff9800',
                                                    color: '#ff9800',
                                                    '&:hover': {
                                                        borderColor: '#f57c00',
                                                        backgroundColor: '#fff3e0'
                                                    }
                                                }}
                                            >
                                                Use This Salary
                                            </Button>
                                        </Box>

                                        {/* Payroll Inputs */}
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                                            <TextField
                                                label="Basic Pay"
                                                type="number"
                                                fullWidth
                                                size="small"
                                                required
                                                value={empPayroll.basicPay || ''}
                                                onChange={(e) => handlePayrollChange(employee.id, 'basicPay', e.target.value)}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        '&:hover fieldset': {
                                                            borderColor: '#ff9800',
                                                        },
                                                    }
                                                }}
                                            />
                                            <TextField
                                                label="Bonus"
                                                type="number"
                                                fullWidth
                                                size="small"
                                                value={empPayroll.bonus || 0}
                                                onChange={(e) => handlePayrollChange(employee.id, 'bonus', e.target.value)}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">
                                                        <TrendingUpIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                                                    </InputAdornment>,
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        '&:hover fieldset': {
                                                            borderColor: '#2e7d32',
                                                        },
                                                    }
                                                }}
                                            />
                                            <TextField
                                                label="Deductions"
                                                type="number"
                                                fullWidth
                                                size="small"
                                                value={empPayroll.deductions || 0}
                                                onChange={(e) => handlePayrollChange(employee.id, 'deductions', e.target.value)}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">
                                                        <RemoveIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
                                                    </InputAdornment>,
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        '&:hover fieldset': {
                                                            borderColor: '#d32f2f',
                                                        },
                                                    }
                                                }}
                                            />
                                        </Box>

                                        {/* Net Salary Display */}
                                        <Box sx={{ 
                                            p: 2, 
                                            borderRadius: 2, 
                                            backgroundColor: '#e8f5e9',
                                            border: '2px solid #4caf50',
                                            mb: 2,
                                            textAlign: 'center'
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
                                                <CalculateIcon sx={{ color: '#2e7d32' }} />
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                    Net Salary
                                                </Typography>
                                            </Box>
                                            <Typography variant="h5" sx={{ fontWeight: 800, color: '#2e7d32' }}>
                                                ${parseFloat(netSalary).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                Basic + Bonus - Deductions
                                            </Typography>
                                        </Box>

                                        {/* Save Button */}
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            onClick={() => savePayroll(employee.id)}
                                            sx={{
                                                py: 1.5,
                                                fontWeight: 600,
                                                borderRadius: 2,
                                                backgroundColor: '#ff9800',
                                                boxShadow: '0 4px 14px rgba(255, 152, 0, 0.4)',
                                                '&:hover': {
                                                    backgroundColor: '#f57c00',
                                                    boxShadow: '0 6px 20px rgba(255, 152, 0, 0.5)',
                                                    transform: 'translateY(-2px)'
                                                },
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {hasRecord ? 'Update Payroll' : 'Save Payroll'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* All Payroll Records Summary */}
            {payroll.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                        All Payroll Records
                    </Typography>
                    <Paper elevation={6} sx={{ borderRadius: 3, overflow: 'hidden', background: 'white' }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: 'rgba(245, 124, 0, 0.08)' }}>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#f57c00' }}>Employee</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#f57c00' }}>Basic Pay</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#f57c00' }}>Bonus</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#f57c00' }}>Deductions</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#f57c00' }}>Net Salary</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#f57c00' }} align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {payroll.map((record) => {
                                        const employee = employees.find(emp => emp.id === record.employeeId);
                                        return (
                                            <TableRow 
                                                key={record.id} 
                                                hover
                                                sx={{
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 152, 0, 0.04)',
                                                        cursor: 'pointer'
                                                    }
                                                }}
                                            >
                                                <TableCell sx={{ fontWeight: 600 }}>
                                                    {employee?.name || `Employee ID: ${record.employeeId}`}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={`$${parseFloat(record.basicPay || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                                        size="small"
                                                        sx={{ backgroundColor: '#fff3e0', color: '#f57c00', fontWeight: 600 }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: '#2e7d32', fontWeight: 600 }}>
                                                    +${parseFloat(record.bonus || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell sx={{ color: '#d32f2f', fontWeight: 600 }}>
                                                    -${parseFloat(record.deductions || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                                                        ${parseFloat(record.netSalary || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => {
                                                            const emp = employees.find(e => e.id === record.employeeId);
                                                            setEditPayroll({
                                                                ...record,
                                                                employeeName: emp?.name
                                                            });
                                                        }}
                                                        sx={{
                                                            mr: 1,
                                                            '&:hover': { 
                                                                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                                                transform: 'scale(1.1)'
                                                            },
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleDeletePayroll(record.id)}
                                                        sx={{
                                                            '&:hover': { 
                                                                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                                                transform: 'scale(1.1)'
                                                            },
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Box>
            )}

            {/* Edit Payroll Dialog */}
            {editPayroll && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1300,
                        p: 2
                    }}
                    onClick={() => setEditPayroll(null)}
                >
                    <Paper
                        elevation={24}
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            maxWidth: 500,
                            width: '100%',
                            backgroundColor: 'white'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#f57c00' }}>
                            Edit Payroll - {editPayroll.employeeName || `Employee ${editPayroll.employeeId}`}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                            <TextField
                                label="Basic Pay"
                                type="number"
                                fullWidth
                                required
                                value={editPayroll.basicPay || ''}
                                onChange={(e) => setEditPayroll({ ...editPayroll, basicPay: e.target.value })}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                            />
                            <TextField
                                label="Bonus"
                                type="number"
                                fullWidth
                                value={editPayroll.bonus || 0}
                                onChange={(e) => setEditPayroll({ ...editPayroll, bonus: e.target.value })}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">
                                        <TrendingUpIcon sx={{ color: '#2e7d32' }} />
                                    </InputAdornment>,
                                }}
                            />
                            <TextField
                                label="Deductions"
                                type="number"
                                fullWidth
                                value={editPayroll.deductions || 0}
                                onChange={(e) => setEditPayroll({ ...editPayroll, deductions: e.target.value })}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">
                                        <RemoveIcon sx={{ color: '#d32f2f' }} />
                                    </InputAdornment>,
                                }}
                            />
                            <Box sx={{ 
                                p: 2, 
                                borderRadius: 2, 
                                backgroundColor: '#e8f5e9',
                                border: '2px solid #4caf50',
                                textAlign: 'center'
                            }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    Net Salary
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#2e7d32' }}>
                                    ${calculateNetSalary(editPayroll.basicPay, editPayroll.bonus, editPayroll.deductions)}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => setEditPayroll(null)}
                                sx={{ py: 1.5, borderRadius: 2 }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={() => {
                                    const payrollData = {
                                        employeeId: parseInt(editPayroll.employeeId),
                                        basicPay: parseFloat(editPayroll.basicPay) || 0,
                                        bonus: parseFloat(editPayroll.bonus) || 0,
                                        deductions: parseFloat(editPayroll.deductions) || 0,
                                        netSalary: parseFloat(calculateNetSalary(editPayroll.basicPay, editPayroll.bonus, editPayroll.deductions))
                                    };
                                    api.put(`/payroll/${editPayroll.id}`, payrollData)
                                        .then(() => {
                                            setSnackbar({ open: true, message: 'Payroll updated successfully!', severity: 'success' });
                                            fetchPayroll();
                                            setEditPayroll(null);
                                        })
                                        .catch((error) => {
                                            setSnackbar({ open: true, message: 'Error updating payroll: ' + (error.response?.data?.message || error.message), severity: 'error' });
                                        });
                                }}
                                sx={{
                                    py: 1.5,
                                    borderRadius: 2,
                                    backgroundColor: '#ff9800',
                                    '&:hover': {
                                        backgroundColor: '#f57c00'
                                    }
                                }}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            )}

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Payroll;
