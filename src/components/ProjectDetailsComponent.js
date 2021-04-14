import React, { useEffect, useReducer } from 'react';
import { makeStyles, TextField, Button, Snackbar, InputAdornment } from '@material-ui/core';
import * as db from '../utils/dbUtils';
import { Redirect } from 'react-router-dom';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import '../App.css';

const useStyles = makeStyles({
  inputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  leftHalfInputContainer: {
    marginBottom: 20,
    width: '45%',
    marginRight: '10%',
  },
  rightHalfInputContainer: {
    marginBottom: 20,
    width: '45%',
  },
  textField: {
    color: 'white',
  },
  inputLabel: {
    color: '#aaa',
  },
  datePicker: {
    width: '60%',
  },
});

const useAuth = process.env.REACT_APP_USE_AUTH === 'true';

const ProjectDetailsComponent = ({ setSelectedProject }) => {
  const classes = useStyles();

  /* State Setup */
  const initialState = {
    projectName: '',
    teamName: '',
    description: '',
    snackbarOpen: false,
    snackbarMessage: '',
    updating: false,
    oldName: '',
    startDate: new Date(),
    hoursPerPoint: 0,
    totalPoints: 0,
    totalCost: 0,
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
        const {
          projectName,
          teamName,
          description,
          startDate,
          totalPoints,
          hoursPerPoint,
          totalCost,
        } = JSON.parse(savedProject);
        setState({
          projectName,
          teamName,
          description,
          updating: true,
          startDate,
          totalPoints,
          totalCost,
          hoursPerPoint,
        });
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

  const handleTeamNameChange = (e) => {
    setState({ teamName: e.target.value });
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
      window.location.reload();
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
      const updatedData = {
        projectName: state.projectName,
        teamName: state.teamName,
        description: state.description,
        startDate: state.startDate,
        totalCost: state.totalCost,
        totalPoints: state.totalPoints,
        hoursPerPoint: state.hoursPerPoint,
      };
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

  const handleSetTotalPoints = (e) => {
    let totalPoints = parseInt(e.target.value);
    if (isNaN(totalPoints)) totalPoints = 0;
    setState({ totalPoints });
  };

  const handleSetHoursPerPoint = (e) => {
    let hoursPerPoint = parseInt(e.target.value);
    if (isNaN(hoursPerPoint)) hoursPerPoint = 0;
    setState({ hoursPerPoint });
  };

  const handleSetCost = (e) => {
    let totalCost = parseInt(e.target.value);
    if (isNaN(totalCost)) totalCost = 0;
    setState({ totalCost });
  };

  // Only allow access if logged in
  if (useAuth && !sessionStorage.getItem('user')) {
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
          value={state.teamName}
          label='Team Name'
          onChange={handleTeamNameChange}
          InputProps={{ className: classes.textField }}
          InputLabelProps={{ className: classes.inputLabel }}
        />
        <br />
        <div className='datePickerContainer'>
          <p className='startDateLabel'>Start Date: </p>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <DatePicker
              className={classes.datePicker}
              value={state.startDate}
              color='secondary'
              onChange={(startDate) => setState({ startDate })}
            />
          </MuiPickersUtilsProvider>
          <br />
        </div>
        <br />
        <TextField
          className={classes.leftHalfInputContainer}
          color='secondary'
          type='number'
          value={state.totalPoints}
          label='Est. Story Points'
          onChange={handleSetTotalPoints}
          InputProps={{ className: classes.textField }}
          InputLabelProps={{ className: classes.inputLabel }}
        />
        <TextField
          className={classes.rightHalfInputContainer}
          color='secondary'
          type='number'
          value={state.hoursPerPoint}
          label='Hours Per Point'
          onChange={handleSetHoursPerPoint}
          InputProps={{ className: classes.textField }}
          InputLabelProps={{ className: classes.inputLabel }}
        />
        <br />
        <TextField
          className={classes.inputContainer}
          type='number'
          color='secondary'
          value={state.totalCost}
          label='Total Estimated Cost'
          onChange={handleSetCost}
          InputProps={{
            className: classes.textField,
            startAdornment: <InputAdornment position='start'>$</InputAdornment>,
          }}
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
