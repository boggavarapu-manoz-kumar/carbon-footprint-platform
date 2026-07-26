import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress,
  Tooltip,
  Zoom
} from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GamificationService from '../services/GamificationService';

const TrophyRoom = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const userBadges = await GamificationService.getUserBadges();
        setBadges(userBadges);
      } catch (error) {
        console.error("Failed to load badges:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (badges.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 4, border: '1px dashed rgba(255,255,255,0.2)' }}>
        <EmojiEventsIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.2)', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Your Trophy Room is empty
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Complete goals, maintain streaks, and reduce carbon to earn badges!
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <EmojiEventsIcon sx={{ color: '#FFD700' }} /> Trophy Room
      </Typography>
      <Grid container spacing={2}>
        {badges.map((badge, index) => (
          <Grid item xs={6} sm={4} md={3} key={index}>
            <Tooltip 
              title={
                <React.Fragment>
                  <Typography variant="subtitle2">{badge.description}</Typography>
                  <Typography variant="caption" sx={{ color: '#aaa' }}>{badge.criteria}</Typography>
                </React.Fragment>
              }
              TransitionComponent={Zoom}
              arrow
              placement="top"
            >
              <Paper 
                elevation={3}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: 4,
                  bgcolor: 'rgba(25, 30, 36, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(255, 215, 0, 0.2)',
                    borderColor: 'rgba(255, 215, 0, 0.8)'
                  }
                }}
              >
                <Box 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    borderRadius: '50%', 
                    bgcolor: 'rgba(255, 215, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    mb: 2
                  }}
                >
                  <WorkspacePremiumIcon sx={{ fontSize: 40, color: '#FFD700' }} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.2 }}>
                  {badge.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  {new Date(badge.earnedAt).toLocaleDateString()}
                </Typography>
              </Paper>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TrophyRoom;
