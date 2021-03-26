import { useEffect, useReducer } from 'react';
// import react from 'react';
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
import * as db from '../dbUtils';
import '../App.css';

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
    flex: 6,
    padding: 0,
    marginLeft: '4%',
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
    maxHeight: '200px',
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

const ProductBacklogListComponent = ({ refreshProjects, displayPopup }) => {
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

  const addNewStory = async (story) => {
    setState({ productBacklog: [...state.productBacklog, story] });
  };

  const updateProject = async () => {
    //Update the db
    if (!state.isLoading) {
      // Prevents message from showing up while the site is still loading
      try {
        let result = await db.updateProject({
          projectName: state.projectName,
          productBacklog: state.productBacklog,
        });

        //Check if the update worked
        if (!result.success) throw result.message;

        await refreshProjects(); //Refresh the projects stored as they were modified
        displayPopup('Successfully updated product backlog');

        //Refresh the project
        const savedProject = JSON.parse(sessionStorage.getItem('project'));
        savedProject.productBacklog=state.productBacklog;
        sessionStorage.setItem('project',JSON.stringify(savedProject));

      } catch (err) {
        displayPopup(`Error saving user story ${err.message}`);

        console.log(`Project update failed: ${err}`);
      }
    } else setState({ isLoading: false });
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
              key={`${item.storyPoints}${item.task}${item.description}`}
              style={{ marginTop: '3%' }}
            >
              <ListItemText
                primary={item.storyPoints}
                style={{ maxWidth: '10px', marginRight: '8%' }}
              />
              <ListItemText primary={item.task} style={{ flex: 12, width:"50px", overflow:"auto" }} />
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
          <ListItem button onClick={() => onStoryClick(item)} key={`${item}`}>
            <ListItemText primary={item}/>
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() =>
                  setNewStory({
                    subtasks: newStory.subtasks.filter((task) => task !== item),
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
              //Set the user story to have the new subtask
              setNewStory({
                subtasks: [...newStory.subtasks, state.newSubtask],
              });
              setState({ newSubtask: '', addSubtask: false }); //Clear the subtask from the state
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
          <Typography variant="h6">Add new task</Typography>
        </ListItem>
      );
  };

  //Only required fields are storyPoints and the task
  const isInvalidStory = () => {
    return newStory.storyPoints === 0 || newStory.task === '';
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
          isEditing: false,
          editingIndex: null,
        });
      }
      //Add the new product backlog
      else await addNewStory(newStory);

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
          <Container style={{paddingLeft:0,paddingRight:0,}}>
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
            });
            setNewStory(initialNewStory);
          }}
          className={classes.modal}
        >
          <Card style={{ height: '100%' }}>
            <CardHeader title="Add a Story" style={{ textAlign: 'center' }} />
            <CardContent className={classes.modalCardContent}>
              <Container className={classes.addStoryPromptContainer}>
                <Typography variant="h6" className={classes.storyPromptText}>
                  Story Points*
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
                <Typography
                  variant="h6"
                  className={classes.storyPromptText}
                  style={{ textAlign: 'right' }}
                >
                  Task*
                </Typography>
                <Container className={classes.mediumTextFieldContainer}>
                  <TextField
                    style={{
                      maxWidth: '100%',
                    }}
                    value={newStory.task}
                    onChange={(e) => {
                      setNewStory({
                        task: e.target.value,
                      });
                    }}
                  />
                </Container>
              </Container>

              <Container className={classes.addStoryPromptContainer}>
                <Typography variant="h6" className={classes.storyPromptText}>
                  Description
                </Typography>
                <Container
                  style={{ flex: 10 }}
                  className={classes.largeTextFieldContainer}
                >
                  <TextField
                    style={{ width: '100%' }}
                    value={newStory.description}
                    onChange={(e) => {
                      setNewStory({
                        description: e.target.value,
                      });
                    }}
                  />
                </Container>
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
              </Container>
              <Container style={{ marginTop: '1%', padding: 0 }}>
                <Typography variant="h6">Subtasks</Typography>

                <Container style={{ width: '90%', minHeight: '280px' }}>
                  <List className={classes.subtaskList}>
                    {renderSubtasks(newStory)}
                  </List>
                  {promptSubtask()}
                </Container>
              </Container>

              <Container style={{ padding: 0 }}>
                <Container className={classes.buttonContainer}>
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
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Container style={{ width: '40%' }} />
                  <Button
                    color="primary"
                    variant="contained"
                    className={classes.modalButton}
                    onClick={onAddOrUpdateProduct}
                  >
                    {state.isEditing ? 'Update story' : 'Add a new story'}
                  </Button>
                </Container>
                <Typography variant="h6" color="secondary" align="center">
                  {state.newStoryError}
                </Typography>
              </Container>
            </CardContent>
          </Card>
        </Modal>
      </CardContent>
    </Card>
  );
};

export default ProductBacklogListComponent;
