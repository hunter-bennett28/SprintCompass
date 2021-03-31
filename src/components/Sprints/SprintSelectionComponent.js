import React, { useEffect, useReducer } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import '../../App.css';
import SelectedSprintComponent from './SelectedSprintComonent';
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
    selectedSprint: null,
    MenuSelection: '',
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
    const { projectName } = JSON.parse(sessionStorage.getItem('project'));
    const result = await dbUtils.getSprintsByProjectName(projectName);
    result.sort((sprint1, sprint2) => sprint1.iteration - sprint2.iteration);

    setState({
      sprintList: result,
    });
  };

  const handleSelectSprint = async (e) => {
    setState({
      selectedSprint:
        e.target.value === 'Add a new Sprint' ? null : e.target.value,
      MenuSelection: e.target.value,
    });
    if (e.target.value === 'Add a new Sprint') {
      //Create new sprint and add it
      let newSprint = {
        iteration:
          state.sprintList.length !== 0
            ? state.sprintList[state.sprintList.length - 1].iteration + 1
            : 1,
        userStories: [],
      };

      const { projectName } = JSON.parse(sessionStorage.getItem('project'));
      await dbUtils.addSprintByProjectName(projectName, newSprint);
      await fetchSprints();

      setState({ MenuSelection: '' });
    } else
      sessionStorage.setItem(
        'sprint',
        JSON.stringify(
          state.sprintList.find((sprint) => sprint.iteration === e.target.value)
        )
      );
  };

  // Only allow access if logged in
  if (process.env.REACT_APP_USE_AUTH && !loggedIn) {
    console.log('no user found');
    return <Redirect to='/login' />;
  }

  return (
    <div>
      <FormControl variant='outlined' className={classes.formControl}>
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
                  <MenuItem
                    value={sprint.iteration}
                    key={`Sprint ${sprint.iteration}`}>
                    {`Sprint ${sprint.iteration}`}
                  </MenuItem>
                );
              else return null;
            })}
        </Select>
      </FormControl>
      <Container style={{ padding: 0, marginTop: '2%' }}>
        {state.selectedSprint && <SelectedSprintComponent />}
      </Container>
    </div>
  );
};

export default SprintSelectionComponent;
