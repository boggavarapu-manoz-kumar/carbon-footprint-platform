import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, Button } from '@mui/material';
import AuthService from '../services/AuthService';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [user, setUser] = useState({ name: '', email: '' });
  const { logout } = useAuth();

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 6, 
          textAlign: 'center', 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Typography variant="h4" fontWeight="500" color="text.primary" gutterBottom>
          Welcome, {user.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {user.email}
        </Typography>
        
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={logout}
          disableElevation
        >
          Logout
        </Button>
      </Paper>
    </Container>
  );
};

export default Dashboard;
