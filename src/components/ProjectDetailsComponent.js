import React, { useEffect, useReducer } from 'react';
import { makeStyles, TextField, Button, Snackbar } from '@material-ui/core';
import * as db from '../utils/dbUtils';
import '../App.css';
import { Redirect } from 'react-router-dom';

const useStyles = makeStyles({
  inputContainer: {
    marginBottom: 20,
    width: '50%',
    minWidth: 300,
    textAlign: 'center',
  },
  textField: {
    color: 'white',
  },
  inputLabel: {
    color: '#aaa',
  },
});

const useAuth = process.env.REACT_APP_USE_AUTH === 'true';

const ProjectDetailsComponent = ({ loggedIn, setSelectedProject }) => {
  const classes = useStyles();

  /* State Setup */
  const initialState = {
    projectName: '',
    companyName: '',
    description: '',
    snackbarOpen: false,
    snackbarMessage: '',
    updating: false,
    oldName: '',
  };
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialState
  );

  /* Effects */
  // Extract project details if stored on render
  useEffect(() => {
    const savedProject = sessionStorage.getItem('project');
    if (savedProject) {
      try {
        const { projectName, companyName, description } = JSON.parse(savedProject);
        setState({ projectName, companyName, description, updating: true });
      } catch (err) {
        console.log(`Error parsing saved project: ${err.message}`);
      }
    }
  }, []);

  /* Text Field handlers */
  const handleProjectNameChange = (e) => {
    const newState = { projectName: e.target.value };
    // If the name is being changed from a saved value, retain old name for searching
    state.updating && state.oldName === '' && (newState.oldName = state.projectName);
    setState(newState);
  };

  const handleCompanyNameChange = (e) => {
    setState({ companyName: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    setState({ description: e.target.value });
  };

  /* Button Handlers */
  const handleSubmitButton = async () => {
    try {
      if (await db.checkProjectExists(state.projectName)) {
        setState({
          snackbarOpen: true,
          snackbarMessage: 'Name already in use, could not add',
        });
        return;
      }
      await db.addProject(state);
      const projects = await db.getProjects();
      sessionStorage.setItem(
        'project',
        JSON.stringify(projects.find((project) => project.projectName === state.projectName))
      );
      setState({
        snackbarOpen: true,
        snackbarMessage: 'Successfully saved project information!',
      });
      setSelectedProject(state.projectName);
    } catch (err) {
      setState({
        snackbarOpen: true,
        snackbarMessage: `Project creation failed: ${err.message}`,
      });
      console.log(`Project creation failed: ${err}`);
    }
  };

  const handleUpdateButton = async () => {
    try {
      if (state.oldName !== '' && (await db.checkProjectExists(state.projectName))) {
        setState({
          snackbarOpen: true,
          snackbarMessage: 'Name already in use, could not update name',
        });
        return;
      }

      // Store old name if updated since DB querying is done based on project name
      const { projectName, companyName, description } = state;
      const updatedData = { projectName, companyName, description };
      if (state.oldName !== '') updatedData.oldName = state.oldName;
      await db.updateProject(updatedData);

      setState({
        snackbarOpen: true,
        snackbarMessage: 'Successfully updated project information!',
      });
    } catch (err) {
      setState({
        snackbarOpen: true,
        snackbarMessage: `Project update failed: ${err.message}`,
      });
      console.log(`Project update failed: ${err}`);
    }
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setState({ snackbarOpen: false, snackbarMessage: '' });
  };

  // Only allow access if logged in
  if (useAuth && !loggedIn && !sessionStorage.getItem('user')) {
    console.log('no user found');
    return <Redirect to='/login' />;
  }

  return (
    <div>
      <h1 className='ProjectDetailsHeader'>Project Details</h1>
      <div className='ProjectDetailsContainer'>
        <TextField
          className={classes.inputContainer}
          color='secondary'
          value={state.projectName}
          label='Project Name'
          required={!state.updating}
          InputLabelProps={{ className: classes.inputLabel }}
          InputProps={{ className: classes.textField }}
          onChange={handleProjectNameChange}
        />
        <br />
        <TextField
          className={classes.inputContainer}
          color='secondary'
          value={state.companyName}
          label='Company Name'
          onChange={handleCompanyNameChange}
          InputProps={{ className: classes.textField }}
          InputLabelProps={{ className: classes.inputLabel }}
        />
        <br />
        <TextField
          className={classes.inputContainer}
          variant='filled'
          multiline
          rows={5}
          color='secondary'
          value={state.description}
          label='Description'
          onChange={handleDescriptionChange}
          InputProps={{ className: classes.textField }}
          InputLabelProps={{ className: classes.inputLabel }}
        />
        <br />
        <Button
          variant='contained'
          color='primary'
          onClick={state.updating ? handleUpdateButton : handleSubmitButton}
          disabled={state?.projectName === ''}>
          {state.updating ? 'Update' : 'Submit'}
        </Button>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={state.snackbarOpen}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          message={state.snackbarMessage}
        />
      </div>
    </div>
  );
};

export default ProjectDetailsComponent;
