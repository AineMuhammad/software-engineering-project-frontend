import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Menu, MenuItem, Divider, Avatar } from '@mui/material';
import { AccountCircle, Logout } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

const Header = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Get user info from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      // Clear localStorage tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Sign out from Firebase if user is authenticated
      if (auth.currentUser) {
        await signOut(auth);
      }

      toast.success('Logged out successfully');
      handleMenuClose();
      navigate('/signin');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: { xs: 2, sm: 3 },
        background: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      {/* Logo - Text Only */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 700,
            color: theme.palette.primary.main,
            transition: 'color 0.8s ease-in-out',
          }}
        >
          Vibelytics
        </Typography>
      </Box>

      {/* Avatar with Dropdown */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          onClick={handleAvatarClick}
          sx={{
            color: theme.palette.text.primary,
            transition: 'color 0.8s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          {user?.profilePicture ? (
            <Avatar
              src={user.profilePicture}
              alt={user.name || user.email}
              sx={{ width: 40, height: 40 }}
            />
          ) : (
            <AccountCircle sx={{ fontSize: 40 }} />
          )}
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              minWidth: 200,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {user && (
            <MenuItem disabled>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user.name || 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </MenuItem>
          )}
          {user && <Divider />}
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 2, fontSize: 20 }} />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Header;

