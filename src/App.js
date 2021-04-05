import LoginComponent from './components/LoginComponent';
import ProjectDetailsComponent from './components/ProjectDetailsComponent';
import ProductBacklogListComponent from './components/ProductBacklogListComponent';
import HomeScreenComponent from './components/HomeScreenComponent';
import React, { useReducer, useEffect } from 'react';
import { Route, Link, Redirect } from 'react-router-dom';
import Reorder from '@material-ui/icons/Reorder';
import { MuiThemeProvider } from '@material-ui/core/styles';
import theme from './theme';
import {
  Toolbar,
  AppBar,
  Menu,
  MenuItem,
  IconButton,
  Typography,
  Container,
  Snackbar,
  makeStyles,
  Select,
} from '@material-ui/core';
import './App.css';
import { signOutUser } from './utils/userAuth';
import SprintSelectionComponent from './components/Sprints/SprintSelectionComponent';

const useAuth = process.env.REACT_APP_USE_AUTH === 'true';

const useStyles = makeStyles({
  headerLogo: {
    width: '10%',
    marginRight: '2%',
  },
  projectChoice: {
    width: '30%',
    marginLeft: '5%',
  },
});

const App = () => {
  const classes = useStyles();
  const initialState = {
    showMsg: false,
    snackbarMsg: '',
    anchorEl: '',
    loggedIn: false,
  };
  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initialState);

  useEffect(() => {
    useAuth &&
      setState({
        loggedIn: Boolean(sessionStorage.getItem('user')),
      });
  }, []);

  const handleClose = () => {
    setState({ anchorEl: null });
  };

  const handleClick = (event) => {
    setState({ anchorEl: event.currentTarget });
  };

  const displayPopup = (message) => {
    setState({
      showMsg: true,
      snackbarMsg: message,
    });
  };

  const handleUserLoggedIn = () => {
    setState({ loggedIn: true });
  };

  const handleLogOut = async () => {
    await signOutUser();
    sessionStorage.clear();
    setState({ loggedIn: false });
    handleClose();
  };

  const snackbarClose = () => {
    setState({ showMsg: false });
  };

  return (
    <MuiThemeProvider theme={theme}>
      <AppBar position='static'>
        <Toolbar>
          <img src='sprintcompass_logo.png' className={classes.headerLogo} />
          <Typography variant='h6' color='inherit'>
            Sprint Compass
          </Typography>
          {(useAuth && !state.loggedIn) || (
            <Select
              className={classes.projectChoice}
              value='test'
              color='secondary'
              //onChange={handleSelectSprint}
              label='Selected Project'></Select>
          )}
          {(useAuth && !state.loggedIn) || ( // Only show dropdown menu once logged in
            <IconButton
              onClick={handleClick}
              color='inherit'
              style={{ marginLeft: 'auto', paddingRight: '1vh' }}>
              <Reorder />
            </IconButton>
          )}
          <Menu
            id='simple-menu'
            anchorEl={state.anchorEl}
            open={Boolean(state.anchorEl)}
            onClose={handleClose}>
            <MenuItem component={Link} to='/home' onClick={handleClose}>
              Home
            </MenuItem>
            <MenuItem
              component={Link}
              to='/projectdetails'
              onClick={handleClose}>
              Project Details
            </MenuItem>
            <MenuItem
              component={Link}
              to='/productbacklog'
              onClick={handleClose}>
              Product Backlog
            </MenuItem>
            <MenuItem
              component={Link}
              to='/sprintselection'
              onClick={handleClose}>
              Sprints
            </MenuItem>
            {useAuth && (
              <MenuItem
                component={Link}
                to='/login?logout=true'
                onClick={handleLogOut}>
                Log Out
              </MenuItem>
            )}
          </Menu>
        </Toolbar>
      </AppBar>
      <div className='Form'>
        <Container style={{ padding: '0px', paddingTop: '10px' }}>
          <Route
            exact
            path='/'
            render={() => (
              <Redirect to={useAuth && !state.loggedIn ? '/login' : '/home'} />
            )}
          />
          <Route
            path='/login'
            render={(routeInfo) => (
              <LoginComponent
                displayPopup={displayPopup}
                notifyLogIn={handleUserLoggedIn}
                loggedIn={state.loggedIn}
                route={routeInfo}
              />
            )}
          />
          <Route
            path='/productbacklog'
            render={() => (
              <ProductBacklogListComponent
                loggedIn={state.loggedIn}
                displayPopup={displayPopup}
              />
            )}
          />
          <Route path='/home'>
            <HomeScreenComponent loggedIn={state.loggedIn} />
          </Route>
          <Route path='/projectdetails'>
            <ProjectDetailsComponent loggedIn={state.loggedIn} />
          </Route>
          <Route path='/sprintselection'>
            <SprintSelectionComponent loggedIn={state.loggedIn} />
          </Route>
        </Container>
        <Snackbar
          open={state.showMsg}
          message={state.snackbarMsg}
          autoHideDuration={5000}
          onClose={snackbarClose}
        />
      </div>
    </MuiThemeProvider>
  );
};
export default App;
