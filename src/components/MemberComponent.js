import React, { useReducer, useEffect } from 'react';
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
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import * as db from '../utils/dbUtils';
import '../App.css';
import { Redirect, useHistory } from 'react-router-dom';

const useStyles = makeStyles({
  promptText: {
    flex: 2,
    textAlign: 'left',
    height: '40%',
    marginBottom: 40,
    whiteSpace: 'nowrap',
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
  promptContainer: {
    display: 'flex',
    flexDirection: 'row',
    padding: 0,
  },
  modalCardContent: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 10,
    paddingBottom: 0,
    margin: 30,
  },
  modal: {
    maxWidth: '800px',
    minWidth: '400px',
    width: '90%',
    margin: 'auto',
    marginTop: '30px',
    marginBottom: '30px',
    overflow: 'auto',
  },
});

const MemberComponent = ({ displayPopup }) => {
  const classes = useStyles();
  const history = useHistory();

  const initialState = {
    memberList: null,
    addMode: false,

    addMember: false,
    addMemberError: '',
    isEditing: false,
    editingIndex: null,
    projectName: '',
    isLoading: true,
  };

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialState
  );

  const initialNewMember = {
    email: '',
    firstName: '',
    lastName: '',
  };

  const [newMember, setNewMember] = useReducer(
    (newMember, newState) => ({ ...newMember, ...newState }),
    initialNewMember
  );

  useEffect(() => {
    const savedProject = sessionStorage.getItem('project');
    if (savedProject) {
      const { members, projectName } = JSON.parse(savedProject);
      setState({ memberList: members ? members : [], projectName });
    } else displayPopup('Project not loaded');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    (async () => {
      if (state.memberList) await updateProject();
    })();
  }, [state.memberList]); // eslint-disable-line react-hooks/exhaustive-deps

  const addNewMember = (member) => {
    setState({ memberList: [...state.memberList, member] });
  };

  const onDeleteItem = async (item) => {
    setState({
      memberList: state.memberList.filter((member) => member !== item),
    });
    if (
      sessionStorage.getItem('user') &&
      item.email === JSON.parse(sessionStorage.getItem('user')).email
    ) {
      await updateProject(state.memberList.filter((member) => member !== item)); //Force the update as setState wont act immediately

      sessionStorage.removeItem('project');
      sessionStorage.removeItem('sprint');
      history.go(0);
    }
  };
  const onMemberClick = (item) => {
    setNewMember({
      firstName: item.firstName,
      lastName: item.lastName,
      email: item.email,
    });
    setState({
      addMode: true,
      isEditing: true,
      editingIndex: state.memberList.findIndex((i) => i === item),
    });
  };

  const updateProject = async (localMemberlist) => {
    if (state.projectName !== '') {
      if (!state.isLoading) {
        try {
          let result = await db.updateProject({
            projectName: state.projectName,
            members: localMemberlist ? localMemberlist : state.memberList,
          });

          //Check if the update worked
          if (!result.success) throw result.message;

          const projects = await db.getProjects();

          let currProject = projects.find((project) => project.ProjectName === state.projectName);

          if (currProject) sessionStorage.setItem('project', JSON.stringify(currProject));
          displayPopup('Successfully saved member');
          //Refresh the project
          const savedProject = JSON.parse(sessionStorage.getItem('project'));
          savedProject.members = state.memberList;
          if (savedProject)
            //Check if a valid project
            sessionStorage.setItem('project', JSON.stringify(savedProject));
        } catch (err) {
          console.log(`Project update failed: ${err.message}`);
          displayPopup(`Error saving member ${err.message}`);
        }
      } else setState({ isLoading: false });
    }
  };

  const renderList = () => {
    if (state.memberList) {
      return state.memberList.map((item, index) => (
        <ListItem button onClick={() => onMemberClick(item)} key={item.email}>
          <ListItemText
            primary={`${item.firstName} ${item.lastName} - ${item.email}`}
            style={{ marginRight: '50px' }}
          />
          {index > 0 && (
            <ListItemSecondaryAction>
              <IconButton edge='end' aria-label='delete' onClick={() => onDeleteItem(item)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          )}
        </ListItem>
      ));
    } else {
      return null;
    }
  };

  const isInvalidMember = () => {
    return newMember.email === '' || newMember.email === undefined;
  };

  const onAddOrUpdateMember = async () => {
    if (!isInvalidMember()) {
      setState({
        addMode: false,
        addMemberError: '',
      });
      if (state.isEditing) {
        let memberList = state.memberList;
        memberList[state.editingIndex] = newMember;

        setState({
          isEditing: false,
          editingIndex: null,
        });

        //Set it so it updates on each modification (it might not detect that it was modified)
        updateProject();
      } else addNewMember(newMember);
      setNewMember({
        email: '',
        firstName: '',
        lastName: '',
      });
    } else {
      setState({
        newMemberError: 'Ensure all required fields are filled',
      });
    }
  };

  const emailIsValid =
    newMember.email.indexOf('@') > -1 &&
    newMember.email.lastIndexOf('.') > newMember.email.indexOf('@') &&
    newMember.email.lastIndexOf('.') < newMember.email.length - 1;

  // Only allow access if logged in
  if (process.env.REACT_APP_USE_AUTH && !sessionStorage.getItem('user')) {
    return <Redirect to='/login' />;
  }

  return (
    <Card>
      <CardHeader title='Member List' style={{ textAlign: 'center' }} />
      <CardContent>
        {/* Display the list of members */}
        <List>
          <Button
            color='primary'
            variant='contained'
            style={{ float: 'right' }}
            onClick={() => {
              setState({ addMode: true });
            }}>
            <AddIcon />
          </Button>
          <Container style={{ paddingLeft: 0, paddingRight: 0 }}>{renderList()}</Container>
        </List>
        <Modal
          open={state.addMode}
          onClose={() => {
            setState({
              addMode: false,
              addSubtask: false,
              newMemberError: '',
              isEditing: false,
            });
            setNewMember(initialNewMember);
          }}
          aria-labelledby='simple-modal-title'
          aria-describedby='simple-modal-description'
          className={classes.modal}>
          <Card>
            <CardHeader
              title={state.isEditing ? 'Update a member' : 'Add a member'}
              style={{ textAlign: 'center' }}
            />
            <CardContent className={classes.modalCardContent}>
              <Container className={classes.promptContainer}>
                <Typography variant='h6' className={classes.promptText}>
                  First Name:
                </Typography>
                <Container
                  className={classes.largeTextFieldContainer}
                  style={{ flex: 6, display: 'flex', flexDirection: 'row' }}>
                  <TextField
                    style={{
                      maxWidth: '50%',
                    }}
                    value={newMember.firstName}
                    onChange={(e) => {
                      setNewMember({
                        firstName: e.target.value,
                      });
                    }}
                  />
                </Container>

                <Typography variant='h6' className={classes.promptText}>
                  Last Name:
                </Typography>
                <Container
                  className={classes.largeTextFieldContainer}
                  style={{ flex: 6, display: 'flex', flexDirection: 'row' }}>
                  <TextField
                    style={{
                      maxWidth: '50%',
                    }}
                    value={newMember.lastName}
                    onChange={(e) => {
                      setNewMember({
                        lastName: e.target.value,
                      });
                    }}
                  />
                </Container>
              </Container>

              <Container className={classes.promptContainer}>
                <Typography
                  variant='h6'
                  className={classes.promptText}
                  style={{ textAlign: 'left', marginTop: 0, marginLeft: '20%' }}>
                  *Email:
                </Typography>
                <Container className={classes.mediumTextFieldContainer}>
                  <TextField
                    style={{
                      maxWidth: '60%',
                    }}
                    value={newMember.email}
                    onChange={(e) => {
                      setNewMember({
                        email: e.target.value,
                      });
                    }}
                    error={!emailIsValid}
                    fullWidth
                  />
                </Container>
              </Container>
              <Container
                style={{
                  padding: 0,
                }}>
                <Button
                  color='primary'
                  variant='contained'
                  className={classes.modalButton}
                  onClick={() => {
                    setNewMember(initialNewMember);
                    setState({
                      addMode: false,
                      addSubtask: false,
                      newMemberError: '',
                      isEditing: false,
                    });
                  }}
                  style={{ height: '40%', float: 'left' }}>
                  Cancel
                </Button>
                <Typography></Typography>

                <Button
                  color='primary'
                  variant='contained'
                  className={classes.modalButton}
                  disabled={!emailIsValid}
                  onClick={onAddOrUpdateMember}
                  style={{ height: '40%', float: 'right' }}>
                  {state.isEditing ? 'Update member' : 'Add new member'}
                </Button>
              </Container>
              <Typography variant='h6' color='secondary' align='center'>
                {state.newMemberError}
              </Typography>
            </CardContent>
          </Card>
        </Modal>
      </CardContent>
    </Card>
  );
};

export default MemberComponent;
