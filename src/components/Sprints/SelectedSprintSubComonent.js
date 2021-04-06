import React, { useEffect, useReducer } from 'react';
import {
  Select,
  Container,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
} from '@material-ui/core';
import RemoveIcon from '@material-ui/icons/Remove';
import { makeStyles } from '@material-ui/core/styles';
import '../../App.css';
import * as dbUtils from '../../utils/dbUtils';
import generateSprintPDF from '../../utils/pdfUtils';

const useStyles = makeStyles({
  formControl: {
    minWidth: '100%',
  },
  inputLabel: {
    color: '#bbb',
  },
  userInput: {
    color: 'white',
    width: '100%',
  },
});

const SprintSelectionComponent = ({refreshContentsHook}) => {
  const classes = useStyles();

  const initialState = {
    sprint: {},
    project: {},
    MenuSelection: '',
  };
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialState
  );

  useEffect(() => {
    loadSessionStorage();
    refreshContentsHook(loadSessionStorage);
  },[]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSessionStorage = () => {
    setState({
      sprint: JSON.parse(sessionStorage.getItem('sprint')) || {},
      project: JSON.parse(sessionStorage.getItem('project')) || {},
    });
  };

  const handleSelection = async (e) => {
    //update the local project to not contain the user story
    let updatedSprint = state.sprint;

    updatedSprint.userStories = [...updatedSprint.userStories, e.target.value];

    let updatedProject = state.project;
    updatedProject.productBacklog = updatedProject.productBacklog.filter(
      (item) => item !== e.target.value
    );

    setState({
      project: updatedProject,
      sprint: updatedSprint,
    });

    await updateStorage(updatedProject, updatedSprint);
  };

  const removeTask = async (story) => {
    //Update local storage
    let updatedSprint = state.sprint;
    let updatedProject = state.project;

    updatedSprint.userStories = updatedSprint.userStories.filter(
      (item) => item !== story
    );
    updatedProject.productBacklog = [...updatedProject.productBacklog, story];

    setState({
      project: updatedProject,
      sprint: updatedSprint,
    });

    await updateStorage(updatedProject, updatedSprint);
  };

  const updateStorage = async (updatedProject, updatedSprint) => {
    sessionStorage.setItem('sprint', JSON.stringify(updatedSprint));
    sessionStorage.setItem('project', JSON.stringify(updatedProject));

    //Add it to the sprint and update
    await dbUtils.updateProject(updatedProject);
    await dbUtils.updateSprint(updatedSprint);
  };
<<<<<<< HEAD:src/components/Sprints/SelectedSprintComonent.js

=======
  
>>>>>>> master:src/components/Sprints/SelectedSprintSubComonent.js
  return (
    <Container
      style={{ backgroundColor: '#777', color: 'white', borderRadius: '25px' }}>
      <Typography style={{ textAlign: 'center' }} variant='h5'>
        Sprint {state.sprint.iteration}
      </Typography>

      {/* Show user stories and allow them to be added to the sprint*/}
      <Container>
        <FormControl variant='outlined' className={classes.formControl}>
          <InputLabel className={classes.inputLabel}>
            Add From Backlog
          </InputLabel>
          <Select
            className={classes.userInput}
            value={state.MenuSelection}
            onChange={handleSelection}
            label='Sprint'>
            {state.project.productBacklog &&
              state.project.productBacklog.map((product) => {
                if (product)
                  return (
                    <MenuItem
                      value={product}
                      key={`${product.storyPoints}${product.task}`}>
                      {`${product.storyPoints ? product.storyPoints : '0'} - ${
                        product.task
                      }`}
                    </MenuItem>
                  );
                else return null;
              })}
          </Select>
        </FormControl>
        {/* <List></List> */}
        <List>
          {state.sprint.userStories &&
            state.sprint.userStories.map((story) => (
              <ListItem
                button
                onClick={
                  () =>
                    console.log(
                      'implementation!'
                    ) /* Implement popup method here*/
                }
                key={`${story.storyPoints}${story.task}`}>
                <ListItemText
                  primary={story.storyPoints}
                  style={{ maxWidth: '10px', marginRight: '8%' }}
                />
                <ListItemText
                  primary={story.task}
                  style={{ width: '50px', overflow: 'auto' }}
                />
                <ListItemSecondaryAction
                  edge='end'
                  aria-label='delete'
                  onClick={() => removeTask(story)}>
                  <RemoveIcon style={{ fill: 'white' }} />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
        </List>
      </Container>
      <div style={{ textAlign: 'center' }}>
        <Button
          variant='contained'
          color='primary'
          onClick={() => generateSprintPDF(state.sprint)}
          style={{ textAlign: 'center' }}>
          DOWNLOAD PDF
        </Button>
      </div>
    </Container>
  );
};

export default SprintSelectionComponent;
