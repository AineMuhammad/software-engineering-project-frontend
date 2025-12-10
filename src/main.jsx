import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, CssBaseline } from '@mui/material'
import './index.css'
import App from './App.jsx'
import { defaultTheme } from './themes'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
    <App />
    </ThemeProvider>
  </StrictMode>,
)
