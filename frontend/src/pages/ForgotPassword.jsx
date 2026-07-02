import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Container, Box, Typography, TextField, Button, Link, Paper, Alert, CircularProgress 
} from '@mui/material';
import AuthService from '../services/AuthService';
import { motion } from 'framer-motion';

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
      setSuccessMsg('If the email is registered, a password reset link has been sent. Please check your inbox.');
    } catch (err) {
      if (err.response?.status === 429) {
        setErrorMsg('You are requesting too quickly. Please wait 5 minutes before trying again.');
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to process request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper 
            elevation={6} 
            sx={{ 
              p: 4, 
              width: '100%', 
              borderRadius: 3,
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)'
            }}
          >
            <Typography component="h1" variant="h5" align="center" gutterBottom fontWeight="600">
              Forgot Password
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 4 }}>
              Enter your email address and we'll send you a link to reset your password.
            </Typography>

            {errorMsg && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{errorMsg}</Alert>
              </motion.div>
            )}
            
            {successMsg && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{successMsg}</Alert>
              </motion.div>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                    message: "Invalid email address format"
                  }
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 }
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(0,118,255,0.23)'
                  }
                }}
                disabled={loading || !!successMsg}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
              </Button>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Link component={RouterLink} to="/login" variant="body2" color="primary" sx={{ fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  {"Back to Sign In"}
                </Link>
              </Box>
            </Box>
          </Paper>
        </Box>
      </motion.div>
    </Container>
  );
};

export default ForgotPassword;
