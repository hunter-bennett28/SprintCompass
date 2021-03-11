import ProjectDetailsComponent from './components/ProjectDetailsComponent';
import ProductBacklogListComponent from './ProductBacklog/ProductBacklogListComponent';
import HomeScreenComponent from './components/HomeScreenComponent';
import React, { useReducer, useEffect } from 'react';
import { Route, Link, Redirect } from 'react-router-dom';
import Reorder from '@material-ui/icons/Reorder';
import { MuiThemeProvider } from '@material-ui/core/styles';
import * as db from './dbUtils';
import theme from './theme';
import {
  Toolbar,
  AppBar,
  Menu,
  MenuItem,
  IconButton,
  Typography,
  Container
} from '@material-ui/core';

const App = () => {
  const initialState = {
    showMsg: false,
    snackbarMsg: '',
    anchorEl: '',
    projects: [],
    selectedProject: null
  };
  const reducer = (state, newState) => ({ ...state, ...newState });
  const [state, setState] = useReducer(reducer, initialState);

  const handleClose = () => {
    setState({ anchorEl: null });
  };
  const handleClick = (event) => {
    setState({ anchorEl: event.currentTarget });
  };

  const setSelectedProject = (projectName) => {
    setState({
      selectedProject: state.projects.find(
        (project) => project.projectName === projectName
      )
    });
  };

  const getProjects = async () => {
    try {
      const projects = await db.getProjects();
      setState({ projects });
    } catch (err) {
      console.log(`Error could not load projects: ${err.message}`);
    }
  };

  useEffect(() => {
    getProjects();
  }, []);
  // const displayPopup = (message) => {
  //   setState({
  //     showMsg: true,
  //     snackbarMsg: message,
  //   });
  // };

  const snackbarClose = () => {
    setState({ showMsg: false });
  };
  return (
    <MuiThemeProvider theme={theme}>
      <Container style={{ padding: '0px', margin: '0px' }}>
        <AppBar position='static'>
          <Toolbar>
            <Typography variant='h6' color='inherit'>
              Sprint Compass Demo
            </Typography>
            <IconButton
              onClick={handleClick}
              color='inherit'
              style={{ marginLeft: 'auto', paddingRight: '1vh' }}>
              <Reorder />
            </IconButton>
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
            </Menu>
          </Toolbar>
        </AppBar>
        <Container style={{ padding: '0px', paddingTop: '10px' }}>
          <Route exact path='/' render={() => <Redirect to='/home' />} />
          <Route
            path='/productbacklog'
            render={() => <ProductBacklogListComponent />}
          />
          <Route path='/home'>
            <HomeScreenComponent
              projectNames={state.projects.map(
                (project) => project.projectName
              )}
              selectProject={setSelectedProject}
            />
          </Route>
          <Route path='/projectdetails'>
            <ProjectDetailsComponent
              project={state.selectedProject}
              updateProjects={getProjects}
            />
          </Route>
        </Container>
        {/* <Snackbar
          open={state.showMsg}
          message={state.snackbarMsg}
          autoHideDuration={4000}
          onClose={snackbarClose}
        /> */}
      </Container>
    </MuiThemeProvider>
  );
};
export default App;
