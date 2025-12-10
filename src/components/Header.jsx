import { Box, Typography, IconButton } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const Header = () => {
  const theme = useTheme();

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

      {/* Right Icon */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton sx={{ color: theme.palette.text.primary, transition: 'color 0.8s ease-in-out' }}>
          <AccountCircle />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Header;

