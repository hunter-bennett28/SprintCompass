import React, { useEffect, useReducer } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Modal,
  Card,
  CardHeader,
  Typography,
  CardContent,
  Button,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import '../../App.css';
import * as dbUtils from '../../utils/dbUtils';
import { Redirect } from 'react-router-dom';
import RetrospectiveReport from './RetrospectiveReportSubComponent';

const useStyles = makeStyles({
  formControl: {
    minWidth: '100%',
  },
  inputLabel: {
    color: '#bbb',
  },
  userInput: {
    color: 'white',
  },
  modal: {
    maxWidth: '400px',
    minWidth: '400px',
    margin: 'auto',
    marginTop: '30px',
    marginBottom: '30px',
    overflow: 'auto',
  },
});

const SprintRetrospectiveComponent = ({ loggedIn, displayPopup }) => {
  const classes = useStyles();

  const initialState = {
    sprintList: [],
    selectedSprint: '',
    isSelectingSprint: true,
    container: null,
    childDataFunction: null,
  };
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialState
  );

  useEffect(() => {
    fetchSprints();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSprints = async () => {
    //get the list of sprints for a selected project
    const { projectName } = JSON.parse(sessionStorage.getItem('project')) || {}; //If the getItem fails, it will throw in an empty object
    const result = await dbUtils.getSprintsByProjectName(projectName);
    result?.sort((sprint1, sprint2) => sprint1.iteration - sprint2.iteration);

    setState({
      sprintList: result,
    });

    return result;
  };

  const handleSelectSprint = async (e) => {
    setState({
      selectedSprint: e.target.value ? e.target.value : '',
      isSelectingSprint: false,
    });

    sessionStorage.setItem(
      'sprint',
      JSON.stringify(state.sprintList.find((sprint) => sprint.iteration === e.target.value))
    );
  };

  const saveChanges = async () => {
    try {
      if (state.childDataFunction) {
        //Extract the values from the modified child data
        const { tasksModified, tableData } = state.childDataFunction();

        //Get the matching sprint
        let updatedSprint = JSON.parse(sessionStorage.getItem('sprint'));

        updatedSprint.userStories = updatedSprint.userStories.map((task) => {
          //Try to find the task in modified data
          let modifiedTaskIndex = tasksModified.findIndex((modTask) => modTask.task === task.task);

          if (modifiedTaskIndex >= 0) {
            //Update all subtasks that were potentially modified
            let combinedSubtasks = task.subtasks.map((subtask) => {
              //Determine if this subtask will be updated
              let modifiedSubtaskIndex = tasksModified[modifiedTaskIndex].subtasks.findIndex(
                (modSubtask) => modSubtask.task === subtask.task
              );
              if (modifiedSubtaskIndex >= 0) {
                //now that we have the task and subtask index, we can use the tableData to find the input fields
                let inputData = tableData[modifiedTaskIndex][modifiedSubtaskIndex];
                let updatedSubtask = subtask;

                if (
                  !isNaN(inputData.hoursWorked) &&
                  !isNaN(inputData.hoursEstimated) &&
                  parseInt(inputData.hoursWorked) >= 0 &&
                  parseInt(inputData.hoursEstimated) >= 0
                ) {
                  //Parse the data as it will come in as a string
                  updatedSubtask.hoursWorked =
                    parseInt(inputData.hoursWorked) + parseInt(updatedSubtask.hoursWorked);

                  updatedSubtask.hoursEstimated = parseInt(inputData.hoursEstimated);
                } else
                  throw new Error('Error parsing data, ensure all fields are positive numbers');
                return updatedSubtask;
              } else return subtask;
            });
            let updatedTask = task;
            updatedTask.subtasks = combinedSubtasks;

            return updatedTask;
          } else return task;
        });

        //Do the update on updated sprint
        await dbUtils.updateSprint(updatedSprint);

        //Now we need to update the UI
        let sprintList = await fetchSprints();

        sessionStorage.setItem(
          'sprint',
          JSON.stringify(sprintList.find((sprint) => sprint.iteration === updatedSprint.iteration))
        );

        displayPopup('Updated sprint retrospective');

        if (state.refreshChild) state.refreshChild();
        else throw new Error('Error refreshing retrospective');
      } else throw new Error('Error: parent is not connected to the child');
    } catch (err) {
      displayPopup(`${err}`);
    }
  };

  //This gives the parent a method to access the childs state for text boxes
  const saveChangestParentConnection = (functionToCall) => {
    setState({ childDataFunction: functionToCall });
  };

  const refreshUIConnection = (func) => {
    setState({ refreshChild: refreshUIConnection });
  };
  // Only allow access if logged in
  if (process.env.REACT_APP_USE_AUTH && !loggedIn) {
    return <Redirect to='/login' />;
  }

  return (
    <div>
      <div style={{ height: '75vh', color: 'white' }}>
        <Modal
          open={state.isSelectingSprint}
          className={classes.modal}
          container={() => {
            /* Hold the modal in the window, not a huge concern rn but would be cool */
          }}
          onClose={() => setState({ isSelectingSprint: false, selectedSprint: '' })}>
          <Card style={{ padding: 20 }}>
            <CardHeader title={'Select a Sprint'} style={{ textAlign: 'center' }} />
            <CardContent>
              <FormControl variant='outlined' className={classes.formControl}>
                <InputLabel className={classes.inputLabel}>Select A Sprint</InputLabel>
                <Select
                  className={classes.userInput}
                  value={state.selectedSprint}
                  onChange={handleSelectSprint}
                  label='Sprint'>
                  {state.sprintList &&
                    state.sprintList.map((sprint) => {
                      if (sprint)
                        return (
                          <MenuItem value={sprint.iteration} key={`Sprint ${sprint.iteration}`}>
                            {`Sprint ${sprint.iteration}`}
                          </MenuItem>
                        );
                      else return null;
                    })}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Modal>
        {state.selectedSprint !== '' && (
          <div>
            <Typography variant='h4'>Sprint {state.selectedSprint} Retrospective</Typography>
            <Typography variant='h5'>
              {JSON.parse(sessionStorage.getItem('user'))?.email}
            </Typography>
            <RetrospectiveReport
              userEmail={JSON.parse(sessionStorage.getItem('user'))?.email}
              // sprint={state.sprintList.find(
              //   (sprint) => sprint.iteration === state.selectedSprint
              // )}
              saveChangesConnection={saveChangestParentConnection}
              refreshUIConnection={refreshUIConnection}
            />
          </div>
        )}
      </div>
      {!state.isSelectingSprint && (
        <div style={{ marginTop: '3%' }}>
          <Button
            onClick={() => setState({ isSelectingSprint: true, selectedSprint: '' })}
            variant='contained'
            color='primary'
            style={{ float: 'left' }}>
            {state.selectedSprint === '' ? 'Select Sprint' : 'Change Sprint'}
          </Button>
          {state.selectedSprint !== '' && (
            <Button
              onClick={saveChanges}
              variant='contained'
              color='primary'
              style={{ float: 'right' }}>
              Save Changes
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SprintRetrospectiveComponent;
