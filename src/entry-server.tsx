import React from 'react';
import { ServerStyleSheets } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/core';
import theme from './theme';
import App from './App';

export function createApp() {
  const sheets = new ServerStyleSheets();
  const app = sheets.collect(
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>,
  );
  return {
    app,
    stylesheets: sheets,
  };
}
