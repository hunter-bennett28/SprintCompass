import { useEffect, useReducer } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  Modal,
  Typography,
  Button,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Container,
  TextField,
  makeStyles,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import AddIcon from '@material-ui/icons/Add';
import AddBoxRoundedIcon from '@material-ui/icons/AddBoxRounded';
import * as db from '../utils/dbUtils';
import '../App.css';
import { Redirect } from 'react-router-dom';

const useStyles = makeStyles({
  storyPromptText: {
    flex: 2,
    textAlign: 'left',
    height: '40%',
  },
  smallTextFieldContainer: {
    flex: 2,
    padding: 0,
    marginLeft: '4%',
  },
  mediumTextFieldContainer: {
    flex: 20,
    padding: 0,
    marginLeft: '2%',
  },
  largeTextFieldContainer: {
    flex: 10,
    padding: 0,
    marginLeft: '4%',
  },
  modalButton: {
    flex: 1,
    width: '40%',
  },
  buttonContainer: {
    display: 'flex',
    paddingBottom: '1%',
  },
  subtaskList: {
    maxHeight: '150px',
    overflow: 'auto',
  },
  addStoryPromptContainer: {
    display: 'flex',
    flexDirection: 'row',
    padding: 0,
  },
  modalCardContent: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 0,
    paddingBottom: 0,
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
  subtaskListPrompt: {
    maxWidth: '500px',
    alignSelf: 'left',
  },
});

const ProductBacklogListComponent = ({ displayPopup, loggedIn }) => {
  const classes = useStyles();
  const initialState = {
    productBacklog: [],
    addSubtask: false,
    editMode: false,
    addMode: false,
    newSubtask: '',
    newStoryError: '',
    isEditing: false,
    editingIndex: null,
    isLoading: true,
    projectName: '',
  };

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialState
  );

  const initialNewStory = {
    storyPoints: 0,
    task: '',
    subtasks: [],
    estimate: 0,
    description: '',
  };

  const [newStory, setNewStory] = useReducer(
    (newStory, newState) => ({ ...newStory, ...newState }),
    initialNewStory
  );

  useEffect(() => {
    const savedProject = sessionStorage.getItem('project');

    if (savedProject) {
      const { productBacklog, projectName } = JSON.parse(savedProject);
      setState({ productBacklog: productBacklog, projectName: projectName });

      //Throws a warning (disabled using eslint... below) to use useCallback, using it will create an infinite loop
      displayPopup('Project loaded');
    } else {
      displayPopup('Project not loaded');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    (async () => {
      if (state.productBacklog) {
        await updateProject();
        //Throws a warning (disabled using eslint... below) to use useCallback, using it will create an infinite loop
      }
    })();
  }, [state.productBacklog]); // eslint-disable-line react-hooks/exhaustive-deps

  const addNewStory = (story) => {
    setState({ productBacklog: [...state.productBacklog, story] });
  };

  const updateProject = async () => {
    //Update the db
    if (state.productBacklog) {
      if (!state.isLoading) {
        // Prevents message from showing up while the site is still loading
        try {
          let result = await db.updateProject({
            projectName: state.projectName,
            productBacklog: state.productBacklog,
          });

          //Check if the update worked
          if (!result.success) throw result.message;

          //Fetch the project - might be better to implement a getProjectByName
          const projects = await db.getProjects();

          let currProject = projects.find(
            (project) => project.ProjectName === state.projectName
          );

          if(currProject)
            sessionStorage.setItem('project', JSON.stringify(currProject));

          displayPopup('Successfully updated product backlog');

          //Refresh the project
          const savedProject = JSON.parse(sessionStorage.getItem('project'));
          savedProject.productBacklog = state.productBacklog;
          if (savedProject)
            //Check if a valid project
            sessionStorage.setItem('project', JSON.stringify(savedProject));
        } catch (err) {
          displayPopup(`Error saving user story ${err.message}`);

          console.log(`Project update failed: ${err.message}`);
        }
      } else setState({ isLoading: false });
    }
  };

  const onDeleteItem = async (item) => {
    setState({
      productBacklog: state.productBacklog.filter((story) => story !== item),
    });
  };

  const onStoryClick = (item) => {
    //Enable editing the story
    setState({
      addMode: true,
      isEditing: true,
      editingIndex: state.productBacklog.findIndex((story) => story === item),
    });
    setNewStory(item);
  };

  const renderList = () => {
    if (state.productBacklog) {
      let tempArray = state.productBacklog.sort(
        (p1, p2) => p1.storyPoints - p2.storyPoints
      );
      return tempArray.map((item) => {
        if (item)
          //Check if there are any products
          return (
            <ListItem
              button
              onClick={() => onStoryClick(item)}
              key={`${item.storyPoints}${item.task}`}
              style={{ marginTop: '3%' }}
            >
              <ListItemText
                primary={item.storyPoints}
                style={{ maxWidth: '10px', marginRight: '8%' }}
              />
              <ListItemText
                primary={item.task}
                style={{ flex: 12, width: '50px', overflow: 'auto' }}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => onDeleteItem(item)}
                >
                  <DeleteIcon style={{ fill: 'white' }} />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          );
        else return null;
      });
    }
  };

  const renderSubtasks = (story) => {
    return story.subtasks.map((item) => {
      if (item)
        return (
          <ListItem
            button
            onClick={() => onStoryClick(item)}
            key={`${item.task}`}
          >
            <ListItemText primary={item.task} />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() =>
                  setNewStory({
                    subtasks: newStory.subtasks.filter(
                      (task) => task.task !== item.task
                    ),
                  })
                }
              >
                <DeleteIcon style={{ fill: 'white' }} />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        );
      else return null;
    });
  };

  const promptSubtask = () => {
    if (state.addSubtask)
      return (
        <ListItem style={{ width: '100%' }}>
          <TextField
            className={classes.subtaskListPrompt}
            value={state.newSubtask}
            onChange={(e) => {
              setState({
                newSubtask: e.target.value,
              });
            }}
          />

          <IconButton
            style={{ float: 'right' }}
            onClick={() => {
              //Check if user story is unique
              if (
                newStory.subtasks.find(
                  (subtask) => subtask.task === state.newSubtask
                )
              )
                setState({
                  newSubtask: '',
                  newStoryError: 'Subtask already present',
                });
              else if (state.newSubtask === '')
                //Check if it contains any data
                setState({
                  newStoryError: 'Please enter a value for the subtask',
                });
              else {
                setNewStory({
                  subtasks: [...newStory.subtasks, { task: state.newSubtask }],
                });
                setState({
                  newSubtask: '',
                  addSubtask: false,
                  newStoryError: '',
                }); //Clear the subtask from the state
              }
            }}
          >
            <AddBoxRoundedIcon />
          </IconButton>
        </ListItem>
      );
    else
      return (
        <ListItem button onClick={() => setState({ addSubtask: true })}>
          <AddIcon />
          <Typography variant="h6">Add new subtask</Typography>
        </ListItem>
      );
  };

  //Only required fields are storyPoints and the task
  const isInvalidStory = () => {
    return newStory.task === '';
  };

  const onAddOrUpdateProduct = async () => {
    //Make sure the story is valid first
    if (!isInvalidStory()) {
      if (!newStory.estimate)
        //Default estimate to 0
        setNewStory({ estimate: 0 });

      setState({
        addMode: false,
        addSubtask: false,
        newStoryError: '',
        newSubtask: '',
      });

      //Check if it is updating
      if (state.isEditing) {
        let productBacklog = state.productBacklog;
        productBacklog[state.editingIndex] = newStory;

        setState({
          productBacklog:productBacklog,
          isEditing: false,
          editingIndex: null,
        });
      }
      //Add the new product backlog
      else addNewStory(newStory);

      //Clear its data
      setNewStory({
        storyPoints: 0,
        task: '',
        subtasks: [],
        estimate: 0,
        description: '',
      });
    } else {
      setState({
        newStoryError: 'Ensure all required fields are filled',
      });
    }
  };

  // Only allow access if logged in
  if (
    process.env.REACT_APP_USE_AUTH &&
    !loggedIn &&
    !sessionStorage.getItem('user')
  ) {
    console.log('no user found');
    return <Redirect to="/login" />;
  }

  return (
    <Card>
      <CardHeader title="Product Backlog" style={{ textAlign: 'center' }} />
      <CardContent>
        {/* Display the list of products */}
        <List subheader="Current Product Backlog">
          <Button
            color="primary"
            variant="contained"
            style={{ float: 'right' }}
            onClick={() => {
              setState({ addMode: true });
            }}
          >
            <AddIcon />
          </Button>
          <Container style={{ paddingLeft: 0, paddingRight: 0 }}>
            {renderList()}
          </Container>
        </List>

        {/* Add product modal */}
        <Modal
          open={state.addMode}
          onClose={() => {
            setState({
              addMode: false,
              addSubtask: false,
              newStoryError: '',
              newSubtask: '',
              isEditing: false,
            });
            setNewStory(initialNewStory);
          }}
          className={classes.modal}
        >
          <Card style={{ height: '100%' }}>
            <CardHeader
              title={state.isEditing ? 'Update a Task' : 'Add a Task'}
              style={{ textAlign: 'center' }}
            />
            <CardContent className={classes.modalCardContent}>
              <Container className={classes.addStoryPromptContainer}>
                <Typography
                  variant="h6"
                  className={classes.storyPromptText}
                  style={{ textAlign: 'left', marginTop: '1%' }}
                >
                  Task*
                </Typography>
                <Container className={classes.mediumTextFieldContainer}>
                  <TextField
                    style={{
                      maxWidth: '80%',
                    }}
                    value={newStory.task}
                    onChange={(e) => {
                      setNewStory({
                        task: e.target.value,
                      });
                    }}
                    fullWidth
                    variant="outlined"
                  />
                </Container>
              </Container>

              <Container className={classes.addStoryPromptContainer}>
                <Typography variant="h6" className={classes.storyPromptText}>
                  Description
                </Typography>
              </Container>
              <Container style={{ paddingTop: '1%', paddingBottom: '1%' }}>
                <TextField
                  style={{ width: '100%' }}
                  multiline
                  rows={5}
                  value={newStory.description}
                  onChange={(e) => {
                    setNewStory({
                      description: e.target.value,
                    });
                  }}
                  variant="filled"
                />
              </Container>
              <Container className={classes.addStoryPromptContainer}>
                <Typography variant="h6" className={classes.storyPromptText}>
                  Estimate
                </Typography>
                <Container
                  className={classes.largeTextFieldContainer}
                  style={{ flex: 6, display: 'flex', flexDirection: 'row' }}
                >
                  <Typography style={{ marginTop: '1%', marginRight: '1%' }}>
                    $
                  </Typography>
                  <TextField
                    style={{
                      maxWidth: '50%',
                    }}
                    value={newStory.estimate}
                    onChange={(e) => {
                      if (parseInt(e.target.value)) {
                        if (parseInt(e.target.value) <= 999999999)
                          //Ensure it is an int and isnt long enough to create a scientific notation number
                          setNewStory({
                            estimate: parseInt(e.target.value),
                          });
                      } else
                        setNewStory({
                          estimate: '',
                        });
                    }}
                  />
                </Container>
                <Typography variant="h6" className={classes.storyPromptText}>
                  Story Points
                </Typography>
                <Container className={classes.smallTextFieldContainer}>
                  <TextField
                    style={{ maxWidth: '100%' }}
                    value={newStory.storyPoints}
                    onChange={(e) => {
                      //Add only numbers and up to 4 digits
                      if (parseInt(e.target.value)) {
                        if (parseInt(e.target.value) <= 9999)
                          setNewStory({
                            storyPoints: parseInt(e.target.value),
                          });
                      } else
                        setNewStory({
                          storyPoints: '',
                        });
                    }}
                  />
                </Container>
              </Container>
              <Container style={{ marginTop: '1%', padding: 0 }}>
                <Typography variant="h6">Subtasks</Typography>

                <Container style={{ width: '90%', padding: 0 }}>
                  <List className={classes.subtaskList}>
                    {renderSubtasks(newStory)}
                  </List>
                  {promptSubtask()}
                </Container>
              </Container>

              <Container style={{ padding: 0 }}>
                <Button
                  color="primary"
                  variant="contained"
                  className={classes.modalButton}
                  onClick={() => {
                    setNewStory(initialNewStory);
                    setState({
                      addMode: false,
                      addSubtask: false,
                      newStoryError: '',
                      newSubtask: '',
                      isEditing: false,
                    });
                  }}
                  style={{ height: '40%', float: 'left' }}
                >
                  Cancel
                </Button>
                <Typography></Typography>
                <Button
                  color="primary"
                  variant="contained"
                  className={classes.modalButton}
                  onClick={onAddOrUpdateProduct}
                  style={{ height: '40%', float: 'right' }}
                >
                  {state.isEditing ? 'Update task' : 'Add a new task'}
                </Button>
              </Container>
              <Typography variant="h6" color="secondary" align="center">
                {state.newStoryError}
              </Typography>
            </CardContent>
          </Card>
        </Modal>
      </CardContent>
    </Card>
  );
};

export default ProductBacklogListComponent;
