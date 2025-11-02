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
    ToggleButton,
    ToggleButtonGroup,
    Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';

const Attendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [employeeAttendance, setEmployeeAttendance] = useState({});
    const [editAttendance, setEditAttendance] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Time slot presets
    const timeSlots = {
        'fullDay': { label: 'Full Day', checkIn: '09:00', checkOut: '17:00' },
        'morning': { label: 'Morning Shift', checkIn: '09:00', checkOut: '12:00' },
        'afternoon': { label: 'Afternoon Shift', checkIn: '13:00', checkOut: '17:00' },
        'halfDay': { label: 'Half Day', checkIn: '09:00', checkOut: '13:00' },
        'custom': { label: 'Custom Time', checkIn: '', checkOut: '' }
    };

    useEffect(() => {
        fetchEmployees();
        fetchAttendance();
    }, [selectedDate]);

    useEffect(() => {
        // Initialize employee attendance state
        const attendanceMap = {};
        employees.forEach(emp => {
            const todayRecord = attendance.find(
                record => record.employeeId === emp.id && 
                record.date === selectedDate
            );
            attendanceMap[emp.id] = {
                status: todayRecord ? 'present' : 'absent',
                record: todayRecord || null,
                timeSlot: todayRecord ? getTimeSlotFromTimes(todayRecord.checkInTime, todayRecord.checkOutTime) : null,
                customCheckIn: todayRecord?.checkInTime || '',
                customCheckOut: todayRecord?.checkOutTime || ''
            };
        });
        setEmployeeAttendance(attendanceMap);
    }, [employees, attendance, selectedDate]);

    const fetchAttendance = () => {
        api.get('/attendance')
            .then((response) => {
                setAttendance(response.data || []);
            })
            .catch((error) => {
                console.error('Error fetching attendance:', error);
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

    const getTimeSlotFromTimes = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return 'custom';
        const checkInStr = checkIn.toString().substring(0, 5);
        const checkOutStr = checkOut.toString().substring(0, 5);
        
        for (const [key, slot] of Object.entries(timeSlots)) {
            if (slot.checkIn === checkInStr && slot.checkOut === checkOutStr) {
                return key;
            }
        }
        return 'custom';
    };

    const handleStatusChange = (employeeId, status) => {
        setEmployeeAttendance(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                status: status,
                timeSlot: status === 'present' ? 'fullDay' : null
            }
        }));
    };

    const handleTimeSlotChange = (employeeId, slot) => {
        setEmployeeAttendance(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                timeSlot: slot,
                customCheckIn: slot === 'custom' ? prev[employeeId]?.customCheckIn || '09:00' : timeSlots[slot].checkIn,
                customCheckOut: slot === 'custom' ? prev[employeeId]?.customCheckOut || '17:00' : timeSlots[slot].checkOut
            }
        }));
    };

    const handleCustomTimeChange = (employeeId, field, value) => {
        setEmployeeAttendance(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                [field]: value
            }
        }));
    };

    const saveAttendance = (employeeId) => {
        const empAttendance = employeeAttendance[employeeId];
        if (!empAttendance || empAttendance.status === 'absent') {
            // Delete attendance if present record exists
            const existingRecord = attendance.find(
                record => record.employeeId === employeeId && record.date === selectedDate
            );
            if (existingRecord) {
                api.delete(`/attendance/${existingRecord.id}`)
                    .then(() => {
                        setSnackbar({ open: true, message: 'Attendance marked as absent!', severity: 'success' });
                        fetchAttendance();
                    })
                    .catch((error) => {
                        setSnackbar({ open: true, message: 'Error updating attendance: ' + (error.response?.data?.message || error.message), severity: 'error' });
                    });
            }
            return;
        }

        const checkIn = empAttendance.timeSlot === 'custom' 
            ? empAttendance.customCheckIn 
            : timeSlots[empAttendance.timeSlot].checkIn;
        const checkOut = empAttendance.timeSlot === 'custom' 
            ? empAttendance.customCheckOut 
            : timeSlots[empAttendance.timeSlot].checkOut;

        if (!checkIn) {
            setSnackbar({ open: true, message: 'Please select or enter check-in time', severity: 'error' });
            return;
        }

        const attendanceData = {
            employeeId: employeeId,
            date: selectedDate,
            checkInTime: checkIn,
            checkOutTime: checkOut || null
        };

        const existingRecord = attendance.find(
            record => record.employeeId === employeeId && record.date === selectedDate
        );

        if (existingRecord) {
            // Update existing record
            api.put(`/attendance/${existingRecord.id}`, attendanceData)
                .then(() => {
                    setSnackbar({ open: true, message: 'Attendance updated successfully!', severity: 'success' });
                    fetchAttendance();
                })
                .catch((error) => {
                    setSnackbar({ open: true, message: 'Error updating attendance: ' + (error.response?.data?.message || error.message), severity: 'error' });
                });
        } else {
            // Create new record
            api.post('/attendance', attendanceData)
                .then(() => {
                    setSnackbar({ open: true, message: 'Attendance marked successfully!', severity: 'success' });
                    fetchAttendance();
                })
                .catch((error) => {
                    setSnackbar({ open: true, message: 'Error saving attendance: ' + (error.response?.data?.message || error.message), severity: 'error' });
                });
        }
    };

    const handleDeleteAttendance = (id) => {
        if (window.confirm('Are you sure you want to delete this attendance record?')) {
            api.delete(`/attendance/${id}`)
                .then(() => {
                    setSnackbar({ open: true, message: 'Attendance record deleted successfully!', severity: 'success' });
                    fetchAttendance();
                })
                .catch((error) => {
                    setSnackbar({ open: true, message: 'Error deleting attendance: ' + (error.response?.data?.message || error.message), severity: 'error' });
                });
        }
    };

    const getTodayAttendance = () => {
        return attendance.filter(record => record.date === selectedDate);
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
                            background: 'linear-gradient(45deg, #388e3c, #66bb6a)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: { xs: '2rem', md: '2.5rem' }
                        }}
                    >
                        Attendance Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                        Mark employee attendance for the selected date
                    </Typography>
                </Box>
                <Paper 
                    elevation={3}
                    sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        background: 'white'
                    }}
                >
                    <CalendarTodayIcon color="primary" />
                    <TextField
                        label="Select Date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 200 }}
                    />
                </Paper>
            </Box>

            {/* Employee Attendance Cards */}
            {employees.length === 0 ? (
                <Paper elevation={4} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                        No employees found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Add employees from the Employees page to mark attendance
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {employees.map((employee) => {
                        const empAttendance = employeeAttendance[employee.id] || { status: 'absent', timeSlot: null };
                        const isPresent = empAttendance.status === 'present';
                        const todayRecord = attendance.find(
                            record => record.employeeId === employee.id && record.date === selectedDate
                        );

                        return (
                            <Grid item xs={12} md={6} lg={4} key={employee.id}>
                                <Card 
                                    elevation={4}
                                    sx={{ 
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        border: isPresent ? '2px solid #4caf50' : '2px solid transparent',
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
                                                    backgroundColor: isPresent ? '#e8f5e9' : '#f5f5f5',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: 2
                                                }}
                                            >
                                                <PersonIcon sx={{ fontSize: 28, color: isPresent ? '#4caf50' : '#757575' }} />
                                            </Box>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                    {employee.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {employee.designation} • {employee.department}
                                                </Typography>
                                            </Box>
                                            {todayRecord && (
                                                <Chip
                                                    icon={isPresent ? <CheckCircleIcon /> : <CancelIcon />}
                                                    label={isPresent ? 'Present' : 'Absent'}
                                                    color={isPresent ? 'success' : 'default'}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            )}
                                        </Box>

                                        <Divider sx={{ mb: 2 }} />

                                        {/* Status Selection */}
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                                                Mark Attendance:
                                            </Typography>
                                            <ToggleButtonGroup
                                                value={empAttendance.status}
                                                exclusive
                                                onChange={(e, value) => value && handleStatusChange(employee.id, value)}
                                                fullWidth
                                                sx={{ mb: 2 }}
                                            >
                                                <ToggleButton 
                                                    value="present" 
                                                    sx={{ 
                                                        flex: 1,
                                                        py: 1.5,
                                                        '&.Mui-selected': {
                                                            backgroundColor: '#4caf50',
                                                            color: 'white',
                                                            '&:hover': {
                                                                backgroundColor: '#45a049'
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <CheckCircleIcon sx={{ mr: 1 }} />
                                                    Present
                                                </ToggleButton>
                                                <ToggleButton 
                                                    value="absent"
                                                    sx={{ 
                                                        flex: 1,
                                                        py: 1.5,
                                                        '&.Mui-selected': {
                                                            backgroundColor: '#f44336',
                                                            color: 'white',
                                                            '&:hover': {
                                                                backgroundColor: '#da190b'
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <CancelIcon sx={{ mr: 1 }} />
                                                    Absent
                                                </ToggleButton>
                                            </ToggleButtonGroup>
                                        </Box>

                                        {/* Time Slot Selection (only if Present) */}
                                        {isPresent && (
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <AccessTimeIcon sx={{ fontSize: 18 }} />
                                                    Time Slot:
                                                </Typography>
                                                <ToggleButtonGroup
                                                    value={empAttendance.timeSlot || 'fullDay'}
                                                    exclusive
                                                    onChange={(e, value) => value && handleTimeSlotChange(employee.id, value)}
                                                    fullWidth
                                                    size="small"
                                                    sx={{ mb: 2 }}
                                                >
                                                    {Object.entries(timeSlots).filter(([key]) => key !== 'custom').map(([key, slot]) => (
                                                        <ToggleButton key={key} value={key} sx={{ flex: 1, fontSize: '0.75rem', py: 1 }}>
                                                            {slot.label}
                                                        </ToggleButton>
                                                    ))}
                                                    <ToggleButton value="custom" sx={{ flex: 1, fontSize: '0.75rem', py: 1 }}>
                                                        Custom
                                                    </ToggleButton>
                                                </ToggleButtonGroup>

                                                {/* Custom Time Inputs */}
                                                {empAttendance.timeSlot === 'custom' && (
                                                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                                        <TextField
                                                            label="Check In"
                                                            type="time"
                                                            size="small"
                                                            fullWidth
                                                            value={empAttendance.customCheckIn || '09:00'}
                                                            onChange={(e) => handleCustomTimeChange(employee.id, 'customCheckIn', e.target.value)}
                                                            InputLabelProps={{ shrink: true }}
                                                        />
                                                        <TextField
                                                            label="Check Out"
                                                            type="time"
                                                            size="small"
                                                            fullWidth
                                                            value={empAttendance.customCheckOut || '17:00'}
                                                            onChange={(e) => handleCustomTimeChange(employee.id, 'customCheckOut', e.target.value)}
                                                            InputLabelProps={{ shrink: true }}
                                                        />
                                                    </Box>
                                                )}

                                                {/* Display Selected Time */}
                                                {empAttendance.timeSlot && empAttendance.timeSlot !== 'custom' && (
                                                    <Box sx={{ 
                                                        p: 1.5, 
                                                        borderRadius: 1, 
                                                        backgroundColor: '#e3f2fd',
                                                        mb: 2,
                                                        textAlign: 'center'
                                                    }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {timeSlots[empAttendance.timeSlot].label}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                                            {timeSlots[empAttendance.timeSlot].checkIn} - {timeSlots[empAttendance.timeSlot].checkOut}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        )}

                                        {/* Save Button */}
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            onClick={() => saveAttendance(employee.id)}
                                            color={isPresent ? 'success' : 'error'}
                                            sx={{
                                                py: 1.5,
                                                fontWeight: 600,
                                                borderRadius: 2,
                                                boxShadow: isPresent 
                                                    ? '0 4px 14px rgba(76, 175, 80, 0.4)' 
                                                    : '0 4px 14px rgba(244, 67, 54, 0.4)',
                                                '&:hover': {
                                                    boxShadow: isPresent 
                                                        ? '0 6px 20px rgba(76, 175, 80, 0.5)' 
                                                        : '0 6px 20px rgba(244, 67, 54, 0.5)',
                                                    transform: 'translateY(-2px)'
                                                },
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {todayRecord ? 'Update Attendance' : isPresent ? 'Mark Present' : 'Mark Absent'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* Today's Attendance Summary */}
            {getTodayAttendance().length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                        Today's Attendance Records
                    </Typography>
                    <Paper elevation={6} sx={{ borderRadius: 3, overflow: 'hidden', background: 'white' }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: 'rgba(56, 142, 60, 0.08)' }}>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#388e3c' }}>Employee</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#388e3c' }}>Check In</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#388e3c' }}>Check Out</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#388e3c' }}>Duration</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#388e3c' }} align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {getTodayAttendance().map((record) => {
                                        const employee = employees.find(emp => emp.id === record.employeeId);
                                        const checkIn = record.checkInTime?.toString().substring(0, 5) || 'N/A';
                                        const checkOut = record.checkOutTime?.toString().substring(0, 5) || 'N/A';
                                        
                                        // Calculate duration
                                        let duration = 'N/A';
                                        if (record.checkInTime && record.checkOutTime) {
                                            const checkInParts = checkIn.split(':');
                                            const checkOutParts = checkOut.split(':');
                                            const checkInMin = parseInt(checkInParts[0]) * 60 + parseInt(checkInParts[1]);
                                            const checkOutMin = parseInt(checkOutParts[0]) * 60 + parseInt(checkOutParts[1]);
                                            const hours = Math.floor((checkOutMin - checkInMin) / 60);
                                            const minutes = (checkOutMin - checkInMin) % 60;
                                            duration = `${hours}h ${minutes}m`;
                                        }

                                        return (
                                            <TableRow key={record.id} hover>
                                                <TableCell sx={{ fontWeight: 600 }}>
                                                    {employee?.name || `Employee ID: ${record.employeeId}`}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={checkIn} size="small" color="primary" />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={checkOut} size="small" color="secondary" />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                                                        {duration}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleDeleteAttendance(record.id)}
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
