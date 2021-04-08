import LoginComponent from './components/LoginComponent';
import ProjectDetailsComponent from './components/ProjectDetailsComponent';
import ProductBacklogListComponent from './components/ProductBacklogListComponent';
import HomeScreenComponent from './components/HomeScreenComponent';
import MemberComponent from './components/MemberComponent';
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
  FormControl,
} from '@material-ui/core';
import './App.css';
import { signOutUser } from './utils/userAuth';
import { getProjects } from './utils/dbUtils';
import SprintSelectionComponent from './components/Sprints/SprintSelectionComponent';
import SprintRetrospectiveComponent from './components/Retrospective/SprintRetrospectiveComponent';

const useAuth = process.env.REACT_APP_USE_AUTH === 'true';

const useStyles = makeStyles({
  headerLogo: {
    width: '6%',
    minWidth: 40,
    marginRight: '2%',
    marginTop: 5,
    marginBottom: 5,
  },
  projectChoice: {
    width: '30%',
    marginLeft: '5%',
    maxWidth: 400,
  },
});

const App = () => {
  /* Setup */
  const classes = useStyles();
  const initialState = {
    showMsg: false,
    snackbarMsg: '',
    anchorEl: '',
    loggedIn: false,
    selectedProject: '',
    projects: [],
  };
  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initialState);

  useEffect(() => {
    useAuth &&
      setState({
        loggedIn: Boolean(sessionStorage.getItem('user')),
      });
    getProjectsList();
  }, []);

  const getProjectsList = async (user) => {
    const allProjects = await getProjects(user);
    setState({
      projects: allProjects,
      selectedProject: JSON.parse(sessionStorage.getItem('project'))?.projectName || '',
    });
  };

  /* Click Handlers */

  const handleSelectProject = (e) => {
    const { value } = e.target;
    if (value === '') {
      sessionStorage.removeItem('project');
      setState({ selectedProject: value });
    } else if (value === 'addNewProject') {
      sessionStorage.removeItem('project');
      setState({ selectedProject: '' });
    } else {
      sessionStorage.setItem(
        'project',
        JSON.stringify(state.projects.find((proj) => proj.projectName === value))
      );
      setState({ selectedProject: value });
    }
    window.location.reload();
  };

  const handleClose = () => {
    setState({ anchorEl: null });
  };

  const handleMenuClick = (event) => {
    setState({ anchorEl: event.currentTarget });
  };

  const displayPopup = (message) => {
    setState({
      showMsg: true,
      snackbarMsg: message,
    });
  };

  const handleUserLoggedIn = (user) => {
    setState({ loggedIn: true });
    getProjectsList(user);
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

  const clearProject = () => {
    setState({ selectedProject: '' });
    sessionStorage.removeItem('project');
  };

  const setSelectedProject = (selectedProject) => {
    setState({ selectedProject });
  };

  return (
    <MuiThemeProvider theme={theme}>
      <AppBar position='static'>
        <Toolbar>
          <img
            src='sprintcompass_logo.png'
            className={classes.headerLogo}
            alt='fast compass logo'
          />
          <Typography variant='h6' color='inherit'>
            Sprint Compass
          </Typography>
          {(useAuth && !state.loggedIn) || (
            <FormControl className={classes.projectChoice} color='secondary'>
              <Select
                value={state.selectedProject}
                color='secondary'
                displayEmpty
                onChange={handleSelectProject}
                label='Selected Project'>
                <MenuItem value=''>
                  <em>Select A Project</em>
                </MenuItem>
                {state.projects.map(({ projectName }) => (
                  <MenuItem value={projectName}>{projectName}</MenuItem>
                ))}
                <MenuItem
                  value='addNewProject'
                  component={Link}
                  to='/projectdetails'
                  onClick={clearProject}>
                  + Add A New Project
                </MenuItem>
              </Select>
            </FormControl>
          )}
          {(useAuth && !state.loggedIn) || ( // Only show dropdown menu once logged in
            <IconButton
              onClick={handleMenuClick}
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
            {state.selectedProject !== '' && (
              <MenuItem component={Link} to='/projectdetails' onClick={handleClose}>
                Project Details
              </MenuItem>
            )}
            {state.selectedProject !== '' && (
              <MenuItem component={Link} to='/productbacklog' onClick={handleClose}>
                Product Backlog
              </MenuItem>
            )}
            {state.selectedProject !== '' && (
              <MenuItem component={Link} to='/members' onClick={handleClose}>
                Members
              </MenuItem>
            )}
            {state.selectedProject !== '' && (
              <MenuItem component={Link} to='/sprintselection' onClick={handleClose}>
                Sprints
              </MenuItem>
            )}
            {state.selectedProject !== '' && (
              <MenuItem component={Link} to='/sprintretrospective' onClick={handleClose}>
                Sprint Retrospective
              </MenuItem>
            )}
            {useAuth && (
              <MenuItem component={Link} to='/login?logout=true' onClick={handleLogOut}>
                Log Out
              </MenuItem>
            )}
          </Menu>
        </Toolbar>
      </AppBar>
      {/* Routes */}
      <div className='Form'>
        <Container style={{ padding: '0px', paddingTop: '10px' }}>
          <Route
            exact
            path='/'
            render={() => <Redirect to={useAuth && !state.loggedIn ? '/login' : '/home'} />}
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
              <ProductBacklogListComponent loggedIn={state.loggedIn} displayPopup={displayPopup} />
            )}
          />
          <Route
            path='/members'
            render={() => <MemberComponent loggedIn={state.loggedIn} displayPopup={displayPopup} />}
          />
          <Route path='/home'>
            <HomeScreenComponent loggedIn={state.loggedIn} />
          </Route>
          <Route path='/projectdetails'>
            <ProjectDetailsComponent
              loggedIn={state.loggedIn}
              setSelectedProject={setSelectedProject}
            />
          </Route>
          <Route path='/sprintselection'>
            <SprintSelectionComponent loggedIn={state.loggedIn} />
          </Route>
          <Route path='/sprintretrospective'>
            <SprintRetrospectiveComponent loggedIn={state.loggedIn} displayPopup={displayPopup} />
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
