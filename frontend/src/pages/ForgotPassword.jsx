import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Container, Box, Typography, TextField, Button, Link, Paper, Alert, CircularProgress 
} from '@mui/material';
import AuthService from '../services/AuthService';

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      setLoading(true);
      await AuthService.forgotPassword(data.email);
      setSuccessMsg('Check your inbox. A password reset link has been sent.');
    } catch (err) {
      if (err.response?.status === 429) {
        setErrorMsg('Too many requests. Please wait 5 minutes before trying again.');
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to process request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ py: 10 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 6, 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Typography component="h1" variant="h5" align="center" gutterBottom fontWeight="500" color="text.primary">
          Forgot Password
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Enter your email to receive a reset link.
        </Typography>

        {errorMsg && <Alert severity="error" sx={{ mb: 3, width: '100%', borderRadius: 1 }}>{errorMsg}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mb: 3, width: '100%', borderRadius: 1 }}>{successMsg}</Alert>}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            disabled={loading || !!successMsg}
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email format"
              }
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 1 }
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disableElevation
            sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 1, textTransform: 'none', fontWeight: 500 }}
            disabled={loading || !!successMsg}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Link component={RouterLink} to="/login" variant="body2" color="primary" sx={{ textDecoration: 'none' }}>
              Back to Sign In
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
