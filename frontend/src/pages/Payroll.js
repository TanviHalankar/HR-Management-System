import React, { useEffect, useState } from 'react';
import api from '../utils/axiosConfig';
import {
    Typography,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
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
    MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const Payroll = () => {
    const [payroll, setPayroll] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [newPayroll, setNewPayroll] = useState({
        employeeId: '',
        basicPay: '',
        bonus: '',
        deductions: ''
    });
    const [editPayroll, setEditPayroll] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchPayroll();
        fetchEmployees();
    }, []);

    const fetchPayroll = () => {
        setLoading(true);
        api.get('/payroll')
            .then((response) => {
                setPayroll(response.data || []);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching payroll:', error);
                setLoading(false);
            });
    };

    const fetchEmployees = () => {
        api.get('/employees')
            .then((response) => {
                setEmployees(response.data || []);
            })
            .catch((error) => {
                console.error('Error fetching employees:', error);
            });
    };

    const calculateNetSalary = (basicPay, bonus, deductions) => {
        const basic = parseFloat(basicPay) || 0;
        const bonusAmount = parseFloat(bonus) || 0;
        const deductionsAmount = parseFloat(deductions) || 0;
        return (basic + bonusAmount - deductionsAmount).toFixed(2);
    };

    const handleAddPayroll = () => {
        if (!newPayroll.employeeId || !newPayroll.basicPay) {
            setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
            return;
        }
        const payrollData = {
            ...newPayroll,
            employeeId: parseInt(newPayroll.employeeId),
            basicPay: parseFloat(newPayroll.basicPay) || 0,
            bonus: parseFloat(newPayroll.bonus) || 0,
            deductions: parseFloat(newPayroll.deductions) || 0,
            netSalary: parseFloat(calculateNetSalary(newPayroll.basicPay, newPayroll.bonus, newPayroll.deductions))
        };
        api.post('/payroll', payrollData)
            .then((response) => {
                setSnackbar({ open: true, message: 'Payroll record added successfully!', severity: 'success' });
                fetchPayroll();
                setOpen(false);
                setNewPayroll({ employeeId: '', basicPay: '', bonus: '', deductions: '' });
            })
            .catch((error) => {
                console.error('Error adding payroll:', error);
                setSnackbar({ open: true, message: 'Error adding payroll: ' + (error.response?.data?.message || error.message), severity: 'error' });
            });
    };

    const handleEditPayroll = () => {
        if (!editPayroll.employeeId || !editPayroll.basicPay) {
            setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
            return;
        }
        const payrollData = {
            ...editPayroll,
            employeeId: parseInt(editPayroll.employeeId),
            basicPay: parseFloat(editPayroll.basicPay) || 0,
            bonus: parseFloat(editPayroll.bonus) || 0,
            deductions: parseFloat(editPayroll.deductions) || 0,
            netSalary: parseFloat(calculateNetSalary(editPayroll.basicPay, editPayroll.bonus, editPayroll.deductions))
        };
        api.put(`/payroll/${editPayroll.id}`, payrollData)
            .then(() => {
                setSnackbar({ open: true, message: 'Payroll record updated successfully!', severity: 'success' });
                fetchPayroll();
                setEditPayroll(null);
            })
            .catch((error) => {
                console.error('Error updating payroll:', error);
                setSnackbar({ open: true, message: 'Error updating payroll: ' + (error.response?.data?.message || error.message), severity: 'error' });
            });
    };

    const handleDeletePayroll = (id) => {
        if (window.confirm('Are you sure you want to delete this payroll record?')) {
            api.delete(`/payroll/${id}`)
                .then(() => {
                    setSnackbar({ open: true, message: 'Payroll record deleted successfully!', severity: 'success' });
                    fetchPayroll();
                })
                .catch((error) => {
                    console.error('Error deleting payroll:', error);
                    setSnackbar({ open: true, message: 'Error deleting payroll: ' + (error.response?.data?.message || error.message), severity: 'error' });
                });
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
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                    Payroll Management
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpen(true)}
                    sx={{ borderRadius: 2 }}
                >
                    Add Payroll
                </Button>
            </Box>

            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Employee ID</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Basic Pay</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Bonus</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Deductions</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Net Salary</TableCell>
                                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payroll.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            No payroll records found. Click "Add Payroll" to create one.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payroll.map((record) => (
                                    <TableRow key={record.id} hover>
                                        <TableCell>{record.id}</TableCell>
                                        <TableCell>{record.employeeId}</TableCell>
                                        <TableCell>${parseFloat(record.basicPay || 0).toFixed(2)}</TableCell>
                                        <TableCell>${parseFloat(record.bonus || 0).toFixed(2)}</TableCell>
                                        <TableCell>${parseFloat(record.deductions || 0).toFixed(2)}</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            ${parseFloat(record.netSalary || 0).toFixed(2)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                color="primary"
                                                onClick={() => setEditPayroll(record)}
                                                sx={{ mr: 1 }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeletePayroll(record.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Add Payroll Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ pb: 2 }}>Add New Payroll Record</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            select
                            label="Employee"
                            fullWidth
                            required
                            value={newPayroll.employeeId}
                            onChange={(e) => setNewPayroll({ ...newPayroll, employeeId: e.target.value })}
                        >
                            {employees.map((emp) => (
                                <MenuItem key={emp.id} value={emp.id}>
                                    {emp.name} (ID: {emp.id})
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Basic Pay"
                            type="number"
                            fullWidth
                            required
                            value={newPayroll.basicPay}
                            onChange={(e) => setNewPayroll({ ...newPayroll, basicPay: e.target.value })}
                            InputProps={{ startAdornment: '$' }}
                        />
                        <TextField
                            label="Bonus"
                            type="number"
                            fullWidth
                            value={newPayroll.bonus}
                            onChange={(e) => setNewPayroll({ ...newPayroll, bonus: e.target.value })}
                            InputProps={{ startAdornment: '$' }}
                        />
                        <TextField
                            label="Deductions"
                            type="number"
                            fullWidth
                            value={newPayroll.deductions}
                            onChange={(e) => setNewPayroll({ ...newPayroll, deductions: e.target.value })}
                            InputProps={{ startAdornment: '$' }}
                        />
                        <TextField
                            label="Net Salary (Calculated)"
                            type="text"
                            fullWidth
                            disabled
                            value={`$${calculateNetSalary(newPayroll.basicPay, newPayroll.bonus, newPayroll.deductions)}`}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddPayroll} color="primary" variant="contained">
                        Add Record
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Payroll Dialog */}
            {editPayroll && (
                <Dialog open={Boolean(editPayroll)} onClose={() => setEditPayroll(null)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ pb: 2 }}>Edit Payroll Record</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <TextField
                                select
                                label="Employee"
                                fullWidth
                                required
                                value={editPayroll.employeeId}
                                onChange={(e) => setEditPayroll({ ...editPayroll, employeeId: e.target.value })}
                            >
                                {employees.map((emp) => (
                                    <MenuItem key={emp.id} value={emp.id}>
                                        {emp.name} (ID: {emp.id})
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                label="Basic Pay"
                                type="number"
                                fullWidth
                                required
                                value={editPayroll.basicPay}
                                onChange={(e) => setEditPayroll({ ...editPayroll, basicPay: e.target.value })}
                                InputProps={{ startAdornment: '$' }}
                            />
                            <TextField
                                label="Bonus"
                                type="number"
                                fullWidth
                                value={editPayroll.bonus}
                                onChange={(e) => setEditPayroll({ ...editPayroll, bonus: e.target.value })}
                                InputProps={{ startAdornment: '$' }}
                            />
                            <TextField
                                label="Deductions"
                                type="number"
                                fullWidth
                                value={editPayroll.deductions}
                                onChange={(e) => setEditPayroll({ ...editPayroll, deductions: e.target.value })}
                                InputProps={{ startAdornment: '$' }}
                            />
                            <TextField
                                label="Net Salary (Calculated)"
                                type="text"
                                fullWidth
                                disabled
                                value={`$${calculateNetSalary(editPayroll.basicPay, editPayroll.bonus, editPayroll.deductions)}`}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setEditPayroll(null)}>Cancel</Button>
                        <Button onClick={handleEditPayroll} color="primary" variant="contained">
                            Save Changes
                        </Button>
                    </DialogActions>
                </Dialog>
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
