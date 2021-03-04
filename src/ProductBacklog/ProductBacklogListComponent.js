import { useReducer } from 'react';
import react from 'react';
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
import styles from '../styles';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import AddBoxRoundedIcon from '@material-ui/icons/AddBoxRounded';
const ProductBacklogListComponent = () => {
  const initialState = {
    rate: 1, //TODO: Implement relative estimates
    productBacklog: [
      { priority: 1, task: 'example 1' },
      { priority: 5, task: 'example 2' },
    ],
    addSubtask: false,
    editMode: false,
    addMode: false,
    newSubtask: '',
    newStoryError: '',
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
  };

  const [newStory, setNewStory] = useReducer(
    (newStory, newState) => ({ ...newStory, ...newState }),
    initialNewStory
  );

  //Fetch the product backlog for the current project
//use effect

  const addNewStory = (story) => {
    setState({ productBacklog: [...state.productBacklog, story] });
  };

  const onDeleteItem = (item) => {
    setState({
      productBacklog: state.productBacklog.filter((story) => story !== item),
    });
  };

  const onStoryClick = (item) => {
    //Enable editing the story
    setState({ editMode: true });
  };

  const renderList = () => {
    return state.productBacklog.map((item) => (
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
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    ));
  };

  const renderSubtasks = (story) => {
    return story.subtasks.map((item) => (
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
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    ));
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
                <Typography
                  variant="h6"
                  style={{ flex: 1, textAlign: 'right' }}
                >
                  Priority*
                </Typography>
                <Container style={{ flex: 6 }}>
                  <TextField
                    style={{ maxWidth: '40px', alignSelf: 'left' }}
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
              </Container>

              <Container style={{ display: 'flex', flexDirection: 'row' }}>
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
                      width: '50%',
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
                <Typography
                  variant="h6"
                  style={{ flex: 1, textAlign: 'right' }}
                >
                  Description
                </Typography>
                <Container style={{ flex: 6 }}>
                  <TextField
                    style={{
                      maxWidth: '400px',
                      width: '50%',
                      alignSelf: 'left',
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

              <Container style={{ width: '80%', marginTop: '1%' }}>
                <Typography variant="h6">Subtasks</Typography>

                <Container style={{ minHeight: '280px' }}>
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
                  onClick={() => {
                    //Make sure the story is valid first
                    console.log(isInvalidStory);
                    if (!isInvalidStory) {
                      setNewStory(initialNewStory);
                      console.log(newStory);
                      console.log(initialNewStory);

                      setState({
                        addMode: false,
                        addSubtask: false,
                        newStoryError: '',
                      });

                      //Add the new product backlog
                      addNewStory(newStory);
                    } else {
                      setState({
                        newStoryError: 'Ensure all required fields are filled',
                      });
                    }
                  }}
                >
                  Add a new product{' '}
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
