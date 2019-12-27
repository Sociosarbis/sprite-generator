import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core'
import { blue, grey, red, yellow } from '@material-ui/core/colors'
import Home from './container/home'
import './App.css';

const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: grey,
    tips: yellow,
    error: red
  }
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Home />
    </ThemeProvider>
  );
}

export default App;
