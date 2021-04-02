import React, { useEffect, useReducer } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Modal,
  Card,
  CardHeader,
  Typography,
  CardContent,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import '../App.css';
import * as dbUtils from '../utils/dbUtils';
import { Redirect } from 'react-router-dom';

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
    maxWidth: '1000px',
    minWidth: '400px',
    width: '90%',
    margin: 'auto',
    marginTop: '30px',
    marginBottom: '30px',
    overflow: 'auto',
  },
});

const SprintRetrospectiveComponent = ({ loggedIn }) => {
  const classes = useStyles();

  const initialState = {
    sprintList: [],
    selectedSprint: null,
    isSelectingSprint: true,
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
    result.sort((sprint1, sprint2) => sprint1.iteration - sprint2.iteration);

    setState({
      sprintList: result,
    });
  };

  const handleSelectSprint = async (e) => {
    setState({
      selectedSprint: e.target.value ? e.target.value : '',
      isSelectingSprint: false,
    });

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
    return <Redirect to="/login" />;
  }

  return (
    <div>
      Current logged in user:
      {JSON.parse(sessionStorage.getItem('user')).user.email}
      <Container >
      <Modal open={state.isSelectingSprint} className={classes.modal} container={() => document.getElementById('parentCo')}>
          <Card>
            <CardHeader
              title={'Select a Sprint'}
              style={{ textAlign: 'center' }}
            />
            <CardContent>
              <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel className={classes.inputLabel}>
                  Select A Sprint
                </InputLabel>
                <Select
                  className={classes.userInput}
                  value={state.selectedSprint}
                  onChange={handleSelectSprint}
                  label="Sprint"
                >
                  {state.sprintList &&
                    state.sprintList.map((sprint) => {
                      if (sprint)
                        return (
                          <MenuItem
                            value={sprint.iteration}
                            key={`Sprint ${sprint.iteration}`}
                          >
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

    </Container>
      {/* <FormControl variant='outlined' className={classes.formControl}>
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
      </Container> */}
    </div>
  );
};

export default SprintRetrospectiveComponent;
