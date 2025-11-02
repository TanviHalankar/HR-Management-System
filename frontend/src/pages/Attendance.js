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

const Attendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [newAttendance, setNewAttendance] = useState({
        employeeId: '',
        date: '',
        checkInTime: '',
        checkOutTime: ''
    });
    const [editAttendance, setEditAttendance] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchAttendance();
        fetchEmployees();
    }, []);

    const fetchAttendance = () => {
        setLoading(true);
        api.get('/attendance')
            .then((response) => {
                setAttendance(response.data || []);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching attendance:', error);
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

    const handleAddAttendance = () => {
        if (!newAttendance.employeeId || !newAttendance.date || !newAttendance.checkInTime) {
            setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
            return;
        }
        api.post('/attendance', newAttendance)
            .then((response) => {
                setSnackbar({ open: true, message: 'Attendance record added successfully!', severity: 'success' });
                fetchAttendance();
                setOpen(false);
                setNewAttendance({ employeeId: '', date: '', checkInTime: '', checkOutTime: '' });
            })
            .catch((error) => {
                console.error('Error adding attendance:', error);
                setSnackbar({ open: true, message: 'Error adding attendance: ' + (error.response?.data?.message || error.message), severity: 'error' });
            });
    };

    const handleEditAttendance = () => {
        if (!editAttendance.employeeId || !editAttendance.date || !editAttendance.checkInTime) {
            setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
            return;
        }
        api.put(`/attendance/${editAttendance.id}`, editAttendance)
            .then(() => {
                setSnackbar({ open: true, message: 'Attendance record updated successfully!', severity: 'success' });
                fetchAttendance();
                setEditAttendance(null);
            })
            .catch((error) => {
                console.error('Error updating attendance:', error);
                setSnackbar({ open: true, message: 'Error updating attendance: ' + (error.response?.data?.message || error.message), severity: 'error' });
            });
    };

    const handleDeleteAttendance = (id) => {
        if (window.confirm('Are you sure you want to delete this attendance record?')) {
            api.delete(`/attendance/${id}`)
                .then(() => {
                    setSnackbar({ open: true, message: 'Attendance record deleted successfully!', severity: 'success' });
                    fetchAttendance();
                })
                .catch((error) => {
                    console.error('Error deleting attendance:', error);
                    setSnackbar({ open: true, message: 'Error deleting attendance: ' + (error.response?.data?.message || error.message), severity: 'error' });
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
                    Attendance Management
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpen(true)}
                    sx={{ borderRadius: 2 }}
                >
                    Add Attendance
                </Button>
            </Box>

            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Employee ID</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Check In</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Check Out</TableCell>
                                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attendance.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            No attendance records found. Click "Add Attendance" to create one.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                attendance.map((record) => (
                                    <TableRow key={record.id} hover>
                                        <TableCell>{record.id}</TableCell>
                                        <TableCell>{record.employeeId}</TableCell>
                                        <TableCell>{record.date || 'N/A'}</TableCell>
                                        <TableCell>{record.checkInTime || 'N/A'}</TableCell>
                                        <TableCell>{record.checkOutTime || 'N/A'}</TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                color="primary"
                                                onClick={() => setEditAttendance(record)}
                                                sx={{ mr: 1 }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteAttendance(record.id)}
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

            {/* Add Attendance Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ pb: 2 }}>Add New Attendance Record</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            select
                            label="Employee"
                            fullWidth
                            required
                            value={newAttendance.employeeId}
                            onChange={(e) => setNewAttendance({ ...newAttendance, employeeId: e.target.value })}
                        >
                            {employees.map((emp) => (
                                <MenuItem key={emp.id} value={emp.id}>
                                    {emp.name} (ID: {emp.id})
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Date"
                            type="date"
                            fullWidth
                            required
                            value={newAttendance.date}
                            onChange={(e) => setNewAttendance({ ...newAttendance, date: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Check In Time"
                            type="time"
                            fullWidth
                            required
                            value={newAttendance.checkInTime}
                            onChange={(e) => setNewAttendance({ ...newAttendance, checkInTime: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Check Out Time"
                            type="time"
                            fullWidth
                            value={newAttendance.checkOutTime}
                            onChange={(e) => setNewAttendance({ ...newAttendance, checkOutTime: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddAttendance} color="primary" variant="contained">
                        Add Record
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Attendance Dialog */}
            {editAttendance && (
                <Dialog open={Boolean(editAttendance)} onClose={() => setEditAttendance(null)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ pb: 2 }}>Edit Attendance Record</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <TextField
                                select
                                label="Employee"
                                fullWidth
                                required
                                value={editAttendance.employeeId}
                                onChange={(e) => setEditAttendance({ ...editAttendance, employeeId: e.target.value })}
                            >
                                {employees.map((emp) => (
                                    <MenuItem key={emp.id} value={emp.id}>
                                        {emp.name} (ID: {emp.id})
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                label="Date"
                                type="date"
                                fullWidth
                                required
                                value={editAttendance.date}
                                onChange={(e) => setEditAttendance({ ...editAttendance, date: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Check In Time"
                                type="time"
                                fullWidth
                                required
                                value={editAttendance.checkInTime}
                                onChange={(e) => setEditAttendance({ ...editAttendance, checkInTime: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Check Out Time"
                                type="time"
                                fullWidth
                                value={editAttendance.checkOutTime}
                                onChange={(e) => setEditAttendance({ ...editAttendance, checkOutTime: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setEditAttendance(null)}>Cancel</Button>
                        <Button onClick={handleEditAttendance} color="primary" variant="contained">
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

export default Attendance;
