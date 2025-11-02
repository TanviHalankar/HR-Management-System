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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [newEmployee, setNewEmployee] = useState({ name: '', designation: '', department: '', salary: '' });
    const [editEmployee, setEditEmployee] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = () => {
        setLoading(true);
        api.get('/employees')
            .then((response) => {
                console.log('Fetched employees:', response.data); // Debugging log
                if (response.data && Array.isArray(response.data)) {
                    setEmployees(response.data);
                } else {
                    console.error('Invalid response format:', response.data);
                    setEmployees([]);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching employees:', error);
                console.error('Error details:', error.response?.data || error.message);
                setSnackbar({ open: true, message: 'Failed to fetch employees: ' + (error.response?.data?.message || error.message), severity: 'error' });
                setEmployees([]);
                setLoading(false);
            });
    };

    const handleAddEmployee = () => {
        if (!newEmployee.name || !newEmployee.designation || !newEmployee.department || !newEmployee.salary) {
            setSnackbar({ open: true, message: 'Please fill all fields', severity: 'error' });
            return;
        }
        api.post('/employees', {
            ...newEmployee,
            salary: parseFloat(newEmployee.salary)
        })
            .then((response) => {
                console.log('Employee added successfully:', response.data);
                setSnackbar({ open: true, message: 'Employee added successfully!', severity: 'success' });
                setOpen(false);
                setNewEmployee({ name: '', designation: '', department: '', salary: '' });
                // Wait a bit before fetching to ensure data is saved
                setTimeout(() => {
                    fetchEmployees();
                }, 500);
            })
            .catch((error) => {
                console.error('Error adding employee:', error);
                console.error('Error details:', error.response?.data || error.message);
                setSnackbar({ open: true, message: 'Error adding employee: ' + (error.response?.data?.message || error.message || 'Network error'), severity: 'error' });
            });
    };

    const handleEditEmployee = () => {
        if (!editEmployee.name || !editEmployee.designation || !editEmployee.department || !editEmployee.salary) {
            setSnackbar({ open: true, message: 'Please fill all fields', severity: 'error' });
            return;
        }
        api.put(`/employees/${editEmployee.id}`, {
            ...editEmployee,
            salary: parseFloat(editEmployee.salary)
        })
            .then(() => {
                setSnackbar({ open: true, message: 'Employee updated successfully!', severity: 'success' });
                fetchEmployees();
                setEditEmployee(null);
            })
            .catch((error) => {
                console.error('Error updating employee:', error);
                setSnackbar({ open: true, message: 'Error updating employee: ' + (error.response?.data?.message || error.message), severity: 'error' });
            });
    };

    const handleDeleteEmployee = (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            api.delete(`/employees/${id}`)
                .then(() => {
                    setSnackbar({ open: true, message: 'Employee deleted successfully!', severity: 'success' });
                    fetchEmployees();
                })
                .catch((error) => {
                    console.error('Error deleting employee:', error);
                    setSnackbar({ open: true, message: 'Error deleting employee: ' + (error.response?.data?.message || error.message), severity: 'error' });
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
        <Box sx={{ width: '100%', minHeight: '100vh', background: 'transparent' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
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
                        Employees Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                        Manage employee records, view details, and perform CRUD operations
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpen(true)}
                    sx={{ 
                        borderRadius: 2,
                        px: 3,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        boxShadow: '0 4px 14px rgba(25, 118, 210, 0.4)',
                        '&:hover': {
                            boxShadow: '0 6px 20px rgba(25, 118, 210, 0.5)',
                            transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                    }}
                >
                    Add Employee
                </Button>
            </Box>

            <Paper elevation={6} sx={{ borderRadius: 3, overflow: 'hidden', background: 'white' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'rgba(25, 118, 210, 0.08)' }}>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1976d2' }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1976d2' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1976d2' }}>Designation</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1976d2' }}>Department</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1976d2' }}>Salary</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1976d2' }} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {employees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            No employees found. Click "Add Employee" to create one.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                employees.map((employee) => (
                                    <TableRow 
                                        key={employee.id} 
                                        hover
                                        sx={{ 
                                            '&:hover': { 
                                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                                cursor: 'pointer'
                                            }
                                        }}
                                    >
                                        <TableCell>{employee.id}</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>{employee.name}</TableCell>
                                        <TableCell>{employee.designation}</TableCell>
                                        <TableCell>
                                            <Box 
                                                component="span" 
                                                sx={{ 
                                                    px: 1.5, 
                                                    py: 0.5, 
                                                    borderRadius: 1, 
                                                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                                    color: '#1976d2',
                                                    fontWeight: 500,
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                {employee.department}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#2e7d32' }}>
                                            ${parseFloat(employee.salary || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                color="primary"
                                                onClick={() => setEditEmployee(employee)}
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
                                                onClick={() => handleDeleteEmployee(employee.id)}
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
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Add Employee Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ pb: 2 }}>Add New Employee</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Name"
                            fullWidth
                            required
                            value={newEmployee.name}
                            onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                        />
                        <TextField
                            label="Designation"
                            fullWidth
                            required
                            value={newEmployee.designation}
                            onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
                        />
                        <TextField
                            label="Department"
                            fullWidth
                            required
                            value={newEmployee.department}
                            onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                        />
                        <TextField
                            label="Salary"
                            fullWidth
                            type="number"
                            required
                            value={newEmployee.salary}
                            onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                            InputProps={{ startAdornment: '$' }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddEmployee} color="primary" variant="contained">
                        Add Employee
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Employee Dialog */}
            {editEmployee && (
                <Dialog open={Boolean(editEmployee)} onClose={() => setEditEmployee(null)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ pb: 2 }}>Edit Employee</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <TextField
                                label="Name"
                                fullWidth
                                required
                                value={editEmployee.name}
                                onChange={(e) =>
                                    setEditEmployee({ ...editEmployee, name: e.target.value })
                                }
                            />
                            <TextField
                                label="Designation"
                                fullWidth
                                required
                                value={editEmployee.designation}
                                onChange={(e) =>
                                    setEditEmployee({ ...editEmployee, designation: e.target.value })
                                }
                            />
                            <TextField
                                label="Department"
                                fullWidth
                                required
                                value={editEmployee.department}
                                onChange={(e) =>
                                    setEditEmployee({ ...editEmployee, department: e.target.value })
                                }
                            />
                            <TextField
                                label="Salary"
                                fullWidth
                                type="number"
                                required
                                value={editEmployee.salary}
                                onChange={(e) =>
                                    setEditEmployee({ ...editEmployee, salary: e.target.value })
                                }
                                InputProps={{ startAdornment: '$' }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setEditEmployee(null)}>Cancel</Button>
                        <Button onClick={handleEditEmployee} color="primary" variant="contained">
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

export default Employees;