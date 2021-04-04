import React, { useEffect, useReducer } from 'react';
import {
  TextField,
  TableContainer,
  Paper,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
  Table,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import '../../App.css';

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

const RetrospectiveReport = ({ userEmail, saveChangesConnection }) => {
  const classes = useStyles();

  const initialState = {
    tableData: null,
    tasksModified:null,
  };
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialState
  );

  useEffect(() => {
    //Connect the child to the parent
    saveChangesConnection(saveChangesChildConnection);
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  //Send a function for the parent to call to obtain the data from the child
  const saveChangesChildConnection = () => {
    return {tableData:state.tableData, tasksModified:state.tasksModified}; // this is a 2D array
  };

  const onHoursWorkedChanged = (taskIndex, subtaskIndex, e) => {
    let modifiedData = state.tableData;

    if (modifiedData[taskIndex][subtaskIndex])
      modifiedData[taskIndex][subtaskIndex].hoursWorked = e.target.value;
    else modifiedData[taskIndex][subtaskIndex] = [e.target.value];

    setState({ tableData: modifiedData });
  };

  const onHoursEstimatedChanged = (taskIndex, subtaskIndex, e) => {
    let modifiedData = state.tableData;
    modifiedData[taskIndex][subtaskIndex].hoursEstimated = e.target.value;

    setState({ tableData: modifiedData });
  };

  const filterTasks = (sprint) => {
    return sprint.userStories
      .map((task) => {
        //Find the appropriate subtasks for that user and store it
        let userTask = task.subtasks.filter(
          (subtask) => subtask.assigned === userEmail
        );

        //Create a new task if the user was found in the subtasks
        if (userTask.length > 0) {
          let newTask = task;
          newTask.subtasks = userTask;
          return newTask;
        } else return null; //Otherwise return null so we can filter it out
      })
      .filter((task) => task);
  };

  const displayTasks = () => {
    let sprint = JSON.parse(sessionStorage.getItem('sprint'));

    let userTasks = filterTasks(sprint);

    //Check if the 2D input array has been set up
    if (!state.tableData) {
      //Create the initial array
      let initialArray = userTasks.map((task) =>
        task.subtasks.map((subtask) => {
          return {
            hoursWorked: subtask.hoursWorked,
            hoursEstimated: subtask.hoursEstimated,
          };
        })
      );

      //Store data in the first load
      setState({tableData:initialArray,tasksModified:userTasks});
    }

    return (
      <div>
        {userTasks.map((task, taskIndex) => {
          return (
            <TableContainer
              component={Paper}
              style={{ marginTop: 10, marginBottom: 10 }}
            >
              <Table className={classes.table} aria-label="Table">
                {/* Print each Task */}
                <TableHead>
                  <TableCell style={{ width: 400 }}>{task.task}</TableCell>
                  <TableCell align="center">Past Hours Worked</TableCell>
                  <TableCell align="center">Hours Worked</TableCell>
                  <TableCell align="center">Hours Estimated</TableCell>
                </TableHead>
                <TableBody>
                  {/* Print each subtask */}
                  {task.subtasks.map((subtask, subtaskIndex) => {
                    return (
                      <TableRow>
                        <TableCell component="th" scope="row" align="right">
                          {subtask.task}
                        </TableCell>
                        <TableCell align="center">
                          {subtask.hoursWorked}
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            variant="filled"
                            style={{ maxWidth: 40 }}
                            onChange={(e) =>
                              onHoursWorkedChanged(taskIndex, subtaskIndex, e)
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            variant="filled"
                            style={{ maxWidth: 40 }}
                            onChange={(e) =>
                              onHoursEstimatedChanged(
                                taskIndex,
                                subtaskIndex,
                                e
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          );
        })}
      </div>
    );
  };
  return (
    <div
      style={{
        backgroundColor: '#777',
        height: '60vh',
        overflow: 'auto',
        margin: '2%',
        padding: '2%',
        borderRadius: '25px',
      }}
    >
      {displayTasks()}
    </div>
  );
};

export default RetrospectiveReport;
