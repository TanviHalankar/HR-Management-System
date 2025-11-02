import React from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';

const Login = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <TextField label="Username" variant="outlined" sx={{ mb: 2, width: '300px' }} />
      <TextField label="Password" type="password" variant="outlined" sx={{ mb: 2, width: '300px' }} />
      <Button variant="contained" color="primary">
        Login
      </Button>
    </Box>
  );
};

export default Login;