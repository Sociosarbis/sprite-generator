import { createMuiTheme } from '@material-ui/core';
import { blue, grey, red, yellow } from '@material-ui/core/colors';

export default createMuiTheme({
  palette: {
    primary: blue,
    secondary: grey,
    warning: yellow,
    error: red,
  },
});
