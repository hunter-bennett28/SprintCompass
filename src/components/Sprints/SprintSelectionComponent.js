import React, { useEffect, useReducer } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import '../../App.css';
import SelectedSprintComponent from './SelectedSprintSubComonent';
import * as dbUtils from '../../utils/dbUtils';
import { Redirect } from 'react-router-dom';

const useStyles = makeStyles({
  formControl: {
    minWidth: '50%',
  },
  inputLabel: {
    color: '#bbb',
  },
  userInput: {
    color: 'white',
  },
});

const SprintSelectionComponent = ({ loggedIn }) => {
  const classes = useStyles();

  const initialState = {
    sprintList: [],
    MenuSelection: '',
    refreshChild: null,
  };
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialState
  );

  useEffect(() => {
    fetchSprints();
  }, []);

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
    if (e.target.value === 'Add a new Sprint') {
      //Create new sprint and add it
      let newSprint = {
        iteration:
          state.sprintList.length !== 0
            ? state.sprintList[state.sprintList.length - 1].iteration + 1
            : 1,
        userStories: [],
      };

      const { projectName } = JSON.parse(sessionStorage.getItem('project')) || {};
      await dbUtils.addSprintByProjectName(projectName, newSprint);

      //Return the updated list as the state might not have loaded the updated sprintList
      let updatedList = await fetchSprints();

      //set it in the selection menu
      let newSprintIteration = updatedList[updatedList.length - 1].iteration;

      sessionStorage.setItem(
        'sprint',
        JSON.stringify(updatedList.find((sprint) => sprint.iteration === newSprintIteration))
      );

      setState({ MenuSelection: newSprintIteration });
    } else {
      console.log('all sprints: ', state.sprintList);
      const selectedSprint = state.sprintList.find((sprint) => sprint.iteration === e.target.value);
      const isLatest =
        state.sprintList[state.sprintList.length - 1]?.iteration === selectedSprint.iteration;
      sessionStorage.setItem('sprint', JSON.stringify({ ...selectedSprint, isLatest }));
      setState({ MenuSelection: e.target.value });
    }
    if (state.refreshChild) state.refreshChild();
  };

  const refreshContentsHook = (func) => {
    setState({ refreshChild: func });
  };

  // Only allow access if logged in
  if (process.env.REACT_APP_USE_AUTH && !loggedIn) {
    console.log('no user found');
    return <Redirect to='/login' />;
  }

  return (
    <div>
      <FormControl variant='outlined' className={classes.formControl} color='secondary'>
        <InputLabel className={classes.inputLabel}>Select A Sprint</InputLabel>
        <Select
          className={classes.userInput}
          value={state.MenuSelection}
          onChange={handleSelectSprint}
          label='Sprint'>
          <MenuItem value={'Add a new Sprint'} key={'add'}>
            Add a new Sprint
          </MenuItem>
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
      {state.MenuSelection !== '' && (
        <Container style={{ padding: 0, marginTop: '2%' }}>
          <SelectedSprintComponent refreshContentsHook={refreshContentsHook} />
        </Container>
      )}
    </div>
  );
};

export default SprintSelectionComponent;
