import { createMuiTheme } from '@material-ui/core/styles';
export default createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    common: { black: 'rgba(0, 0, 0, 1)', white: '#fff' },
    background: {
      paper: 'rgba(67, 61, 61, 1)',
      default: 'rgba(52, 49, 49, 1)',
    },
    primary: {
      light: 'rgba(115, 128, 195, 1)',
      main: 'rgba(75, 88, 188, 1)',
      dark: '#303f9f',
      contrastText: 'rgba(255, 255, 255, 1)',
    },
    secondary: {
      light: '#ff4081',
      main: 'rgba(206, 86, 38, 1)',
      dark: '#c51162',
      contrastText: '#fff',
    },
    error: {
      light: '#e57373',
      main: 'rgba(255, 14, 0, 1)',
      dark: '#d32f2f',
      contrastText: '#fff',
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.87)',
      secondary: 'rgba(255, 255, 255, 0.54)',
      disabled: 'rgba(151, 151, 151, 0.38)',
      hint: 'rgba(0, 0, 0, 0.38)',
    },
  },
});
