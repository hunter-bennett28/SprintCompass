import React, { useEffect, useReducer } from 'react';
import { makeStyles, TextField, Button, Snackbar } from '@material-ui/core';
import styles from '../styles';
import * as db from '../dbUtils';

const useStyles = makeStyles({
  inputContainer: {
    marginBottom: 20
  },
  textField: {
    color: 'black'
  },
  inputLabel: {
    color: '#888'
  }
});

const ProjectDetailsComponent = ({ project, updateProjects }) => {
  const classes = useStyles();

  /* State Setup */
  const initialState = {
    projectName: '',
    companyName: '',
    description: '',
    snackbarOpen: false,
    snackbarMessage: ''
  };
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialState
  );

  /* Effects */
  // Extract project details if given on render
  useEffect(() => {
    if (project) {
      const { projectName, companyName, description } = project;
      setState({ projectName, companyName, description });
    }
  }, []);

  /* Text Field handlers */
  const handleProjectNameChange = (e) => {
    setState({ projectName: e.target.value });
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
          snackbarMessage: 'Name already in use, could not add'
        });
        return;
      }
      await db.addProject(state);
      setState({
        snackbarOpen: true,
        snackbarMessage: 'Successfully saved project information!'
      });
      updateProjects();
    } catch (err) {
      setState({
        snackbarOpen: true,
        snackbarMessage: `Project creation failed: ${err.message}`
      });
      console.log(`Project creation failed: ${err}`);
    }
  };

  const handleUpdateButton = async () => {
    try {
      if (
        state.projectName !== project?.projectName &&
        (await db.checkProjectExists(state.projectName))
      ) {
        setState({
          snackbarOpen: true,
          snackbarMessage: 'Name already in use, could not update name'
        });
        return;
      }

      // Store old name if updated since DB querying is done based on project name
      const updatedData = { ...state };
      if (state.projectName !== project.projectName)
        updatedData.oldName = project.projectName;
      await db.updateProject(updatedData);

      setState({
        snackbarOpen: true,
        snackbarMessage: 'Successfully updated project information!'
      });
      updateProjects();
    } catch (err) {
      setState({
        snackbarOpen: true,
        snackbarMessage: `Project update failed: ${err.message}`
      });
      console.log(`Project update failed: ${err}`);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setState({ snackbarOpen: false, snackbarMessage: '' });
  };

  return (
    <div>
      <h1 style={styles.pageTitle}>Project Details</h1>
      <div style={styles.form}>
        <TextField
          className={classes.inputContainer}
          defaultValue={project?.projectName}
          label='Project Name'
          required={true}
          InputLabelProps={{ className: classes.inputLabel }}
          InputProps={{ className: classes.textField }}
          onChange={handleProjectNameChange}
        />
        <br />
        <TextField
          className={classes.inputContainer}
          defaultValue={project?.companyName}
          label='Company Name'
          onChange={handleCompanyNameChange}
          InputProps={{ className: classes.textField }}
          InputLabelProps={{ className: classes.inputLabel }}
        />
        <br />
        <TextField
          className={classes.inputContainer}
          defaultValue={project?.description}
          label='Description'
          onChange={handleDescriptionChange}
          InputProps={{ className: classes.textField }}
          InputLabelProps={{ className: classes.inputLabel }}
        />
        <br />
        <Button
          variant='contained'
          color='primary'
          onClick={project ? handleUpdateButton : handleSubmitButton}
          disabled={state?.projectName === ''}>
          {project ? 'Update' : 'Submit'}
        </Button>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
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
