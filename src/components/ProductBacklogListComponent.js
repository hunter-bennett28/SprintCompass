import { useEffect, useReducer, useState } from 'react';
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
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import AddIcon from '@material-ui/icons/Add';
import AddBoxRoundedIcon from '@material-ui/icons/AddBoxRounded';
import * as db from '../dbUtils';

const ProductBacklogListComponent = ({
  refreshProjects,
  project,
  displayPopup,
}) => {
  const initialState = {
    rate: 1, //TODO: Implement relative estimates
    productBacklog: null,
    addSubtask: false,
    editMode: false,
    addMode: false,
    newSubtask: '',
    newStoryError: '',
    isEditing: false,
    editingIndex:null,
  };

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialState
  );

  const initialNewStory = {
    priority: 0,
    task: '',
    subtasks: [],
    estimate: 0,
    description: '',
    estimate: 0,
  };

  const [newStory, setNewStory] = useReducer(
    (newStory, newState) => ({ ...newStory, ...newState }),
    initialNewStory
  );

  useEffect(async () => {
    if (project) {
      const { productBacklog } = project;
      setState({ productBacklog });
      console.log('loaded backlog');
    } else displayPopup('Project not loaded');
  }, []);

  useEffect(async () => {
    if (state.productBacklog) {
      console.log(state.productBacklog);
      console.log(project);
      await updateProject();
    }
  }, [state.productBacklog]);

  const addNewStory = async (story) => {
    setState({ productBacklog: [...state.productBacklog, story] });
  };

  const updateProject = async () => {
    //Update the db
    try {
      let result = await db.updateProject({
        projectName: project.projectName,
        productBacklog: state.productBacklog,
      });

      //Check if the update worked
      if (!result.success) throw { message: result.message };

      await refreshProjects(); //Refresh the projects stored as they were modified
      displayPopup('Successfully saved new user story');
    } catch (err) {
      displayPopup(`Error saving user story ${err.message}`);

      console.log(`Project update failed: ${err}`);
    }
  };

  const onDeleteItem = async (item) => {
    setState({
      productBacklog: state.productBacklog.filter((story) => story !== item),
    });

    //await updateProject();
  };

  const onStoryClick = (item) => {
    //Enable editing the story
    setState({ addMode: true, isEditing:true, editingIndex:state.productBacklog.findIndex((story) => story===item) });
    console.log("Now editing "+state.productBacklog.findIndex((story) => story===item));
    setNewStory(item);
  };

  const renderList = () => {
    if(state.productBacklog){
      let tempArray= state.productBacklog.sort((p1,p2) => p1.priority-p2.priority);
      return tempArray.map((item) => {
      if (item)
        //Check if there are any products
        return (
          <ListItem button onClick={() => onStoryClick(item)}>
            <ListItemText
              primary={item.priority}
              style={{ maxWidth: '10px', marginRight: '50px' }}
            />
            <ListItemText primary={item.task} style={{ flex: 12 }} />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => onDeleteItem(item)}
              >
                <DeleteIcon style={{fill: "white"}}/>
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        );
    });
  }
  };

  const renderSubtasks = (story) => {
    return story.subtasks.map((item) => {
      if (item)
        return (
          <ListItem button onClick={() => onStoryClick(item)}>
            <ListItemText primary={item} />
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
                <DeleteIcon style={{fill: "white"}}/>
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        );
    });
  };

  const promptSubtask = () => {
    if (state.addSubtask)
      return (
        <ListItem style={{ width: '100%' }}>
          <TextField
            style={{ maxWidth: '500px', alignSelf: 'left' }}
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

  //Only required fields are priority and the task
  const isInvalidStory = () => {
    return newStory.priority === 0 || newStory.task === '';
  };

  const onAddOrUpdateProduct=async () => {
    //Make sure the story is valid first
    if (!isInvalidStory()) {
      if (!newStory.estimate)
        //Default estimate to 0
        setNewStory({ estimate: 0 });

      setState({
        addMode: false,
        addSubtask: false,
        newStoryError: '',
        newSubtask:'',
      });

      //Check if it is updating
      if(state.isEditing){
        let productBacklog=state.productBacklog;
        productBacklog[state.editingIndex]=newStory;

        setState({
          isEditing: false,
          editingIndex: null,
        });
      }
      else
        //Add the new product backlog
        await addNewStory(newStory);

      //Clear its data
      setNewStory({
        priority: 0,
        task: '',
        subtasks: [],
        estimate: 0,
        description: '',
        estimate: 0,
      });
    } else {
      setState({
        newStoryError: 'Ensure all required fields are filled',
      });
    }
  }

  return (
    //Using Material-UI

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
          {renderList()}
        </List>

        {/* Add product modal */}
        <Modal
          open={state.addMode}
          onClose={() => {
            setState({ addMode: false, addSubtask: false, newStoryError: '' });
            setNewStory(initialNewStory);
          }}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          style={{
            height: '80%',
            maxWidth: '1000px',
            minWidth: '400px',
            width: '80%',
            margin: 'auto',
          }}
        >
          <Card>
            <CardHeader title="Add a Story" style={{ textAlign: 'center' }} />
            <CardContent>
              <Container style={{ display: 'flex', flexDirection: 'row' }}>
                <Typography variant="h6" style={{ flex: 1, textAlign: 'left' }}>
                  Priority*
                </Typography>
                <Container style={{ flex: 2 }}>
                  <TextField
                    style={{ maxWidth: '100%', alignSelf: 'left' }}
                    value={newStory.priority}
                    onChange={(e) => {
                      //Add only numbers and up to 4 digits
                      if (parseInt(e.target.value)) {
                        if (parseInt(e.target.value) <= 9999)
                          setNewStory({
                            priority: parseInt(e.target.value),
                          });
                      } else
                        setNewStory({
                          priority: '',
                        });
                    }}
                  />
                </Container>
                <Typography
                  variant="h6"
                  style={{ flex: 1, textAlign: 'right' }}
                >
                  Task*
                </Typography>
                <Container style={{ flex: 6 }}>
                  <TextField
                    style={{
                      maxWidth: '400px',
                      width: '100%',
                      alignSelf: 'left',
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

              <Container style={{ display: 'flex', flexDirection: 'row' }}>
                <Typography variant="h6" style={{ flex: 1, textAlign: 'left' }}>
                  Description
                </Typography>
                <Container style={{ flex: 6 }}>
                  <TextField
                    style={{
                      width: '88%',
                      alignSelf: 'left',
                      textAlign: 'left',
                    }}
                    value={newStory.description}
                    onChange={(e) => {
                      setNewStory({
                        description: e.target.value,
                      });
                    }}
                  />
                </Container>
              </Container>
              <Container style={{ display: 'flex', flexDirection: 'row' }}>
                <Typography variant="h6" style={{ flex: 1, textAlign: 'left' }}>
                  Estimate
                </Typography>
                <Container
                  style={{ flex: 6, display: 'flex', flexDirection: 'row' }}
                >
                  <Typography style={{ marginTop: '2%', marginRight: '1%' }}>
                    $
                  </Typography>
                  <TextField
                    style={{
                      maxWidth: '100%',
                      alignSelf: 'left',
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
              <Container style={{  marginTop: '1%' }}>
                <Typography variant="h6">Subtasks</Typography>

                <Container style={{ width: '90%', minHeight: '280px' }}>
                  <List style={{ maxHeight: '200px', overflow: 'auto' }}>
                    {renderSubtasks(newStory)}
                  </List>
                  {promptSubtask()}
                </Container>
              </Container>

              <Container
                style={{
                  marginTop: '10px',
                  marginBottom: '30px',
                  display: 'flex',
                }}
              >
                <Button
                  color="primary"
                  variant="contained"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setNewStory(initialNewStory);
                    setState({
                      addMode: false,
                      addSubtask: false,
                      newStoryError: '',
                      newSubtask:''
                    });
                  }}
                >
                  Cancel
                </Button>
                <Container style={{ width: '40%' }} />
                <Button
                  color="primary"
                  variant="contained"
                  style={{ flex: 1, width: '40%' }}
                  onClick={onAddOrUpdateProduct}
                >
                  {state.isEditing? "Update product" :"Add a new product"}
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
