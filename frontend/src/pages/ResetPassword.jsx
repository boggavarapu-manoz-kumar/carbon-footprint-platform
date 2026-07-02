import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, TextField, Button, Link, Paper, CircularProgress, LinearProgress
} from '@mui/material';
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import AuthService from '../services/AuthService';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setErrorMsg('Invalid or missing password reset token.');
        return;
      }
      try {
        await AuthService.validateResetToken(token);
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'This password reset link is invalid or has expired.');
      }
    };
    validateToken();
  }, [token]);

  const newPassword = watch("newPassword", "");

  // Real-time password strength calculation
  const calculateStrength = (password) => {
    let score = 0;
    if (!password) return score;
    if (password.length > 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    return score;
  };

  const strength = calculateStrength(newPassword);
  
  const getStrengthColor = (score) => {
    if (score < 50) return 'error';
    if (score < 75) return 'warning';
    return 'success';
  };

  const getStrengthLabel = (score) => {
    if (score === 0) return '';
    if (score < 50) return 'Weak';
    if (score < 75) return 'Fair';
    if (score < 100) return 'Good';
    return 'Strong';
  };

  const onSubmit = async (data) => {
    if (!token) return;
    try {
      setErrorMsg('');
      setSuccessMsg('');
      setLoading(true);
      await AuthService.resetPassword(token, data.newPassword);
      setSuccessMsg('Your password has been successfully reset. Redirecting...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to reset password. The link might have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
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
              Create New Password
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 4 }}>
              Your new password must be different from previous used passwords.
            </Typography>

            {errorMsg ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', textAlign: 'center' }}>
                <ErrorOutlineIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h6" color="error" gutterBottom>
                  Link Invalid or Expired
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                  {errorMsg}
                </Typography>
                <Button
                  component={RouterLink}
                  to="/forgot-password"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  Request New Link
                </Button>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Link component={RouterLink} to="/login" variant="body2" color="primary" sx={{ fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                    {"Back to Sign In"}
                  </Link>
                </Box>
              </motion.div>
            ) : successMsg ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', textAlign: 'center' }}>
                <CheckCircleOutlineIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h6" color="success" gutterBottom>
                  Password Reset Successful
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                  {successMsg}
                </Typography>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%' }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type="password"
                id="newPassword"
                disabled={!token || !!successMsg || loading || !!errorMsg}
                {...register('newPassword', { 
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: "Password must have at least 8 characters"
                  }
                })}
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 }
                }}
              />
              
              {/* Password Strength Meter */}
              {newPassword && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="textSecondary">
                      Password strength
                    </Typography>
                    <Typography variant="caption" color={`${getStrengthColor(strength)}.main`} fontWeight="bold">
                      {getStrengthLabel(strength)}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={strength} 
                    color={getStrengthColor(strength)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                id="confirmPassword"
                disabled={!token || !!successMsg || loading || !!errorMsg}
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === newPassword || "The passwords do not match"
                })}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
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
                  mt: 4, 
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
                disabled={loading || !token || !!successMsg || !!errorMsg}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
              </Button>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Link component={RouterLink} to="/login" variant="body2" color="primary" sx={{ fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  {"Back to Sign In"}
                </Link>
              </Box>
              </Box>
            </motion.div>
            )}
          </Paper>
        </Box>
      </motion.div>
    </Container>
  );
};

export default ResetPassword;
