import React, { useReducer, useEffect } from "react";
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
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import * as db from "../dbUtils";

const MemberComponent = (refreshProjects, project, displayPopup) => {
  const initialState = {
    memberList: null,
    addMode: false,
    editMode: false,
    addMember: false,
    addMemberError: "",
    isEditing: false,
    editingIndex: null,
  };

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialState
  );

  const initialNewMember = {
    email: "",
    firstName: "",
    lastName: "",
  };

  const [newMember, setNewMember] = useReducer(
    (newMember, newState) => ({ ...newMember, ...newState }),
    initialNewMember
  );

  useEffect(() => {
    if (project) {
      const { memberList } = project;
      setState({ memberList });
    } else displayPopup("Project not loaded");
  }, []);

  useEffect(async () => {
    if (state.memberList) {
      await updateProject();
    }
  }, [state.memberList]);



  const addNewMember = (member) => {
    setState({ memberList: [...state.memberList, member] });
  };

  const onDeleteItem = (item) => {
    setState({
      memberList: state.memberList.filter((member) => member !== item),
    });
  };
  const onMemberClick = (item) => {
    //Enable editing the member
    setState({
      editMode: true,
      isEditing: true,
      editingIndex: state.memberList.findIndex((i) => i === item),
    });
  };

  const updateProject = async () => {
    //Update the db
    try {
      let result = await db.updateProject({
        projectName: project.projectName,
        member: state.memberList,
      });

      //Check if the update worked
      if (!result.success) throw { message: result.message };

      await refreshProjects(); //Refresh the projects stored as they were modified
      displayPopup("Successfully saved member");
    } catch (err) {
      displayPopup(`Error saving member ${err.message}`);

      console.log(`Project update failed: ${err}`);
    }
  };

  const renderList = () => {
    if (state.memberList) {
      return state.memberList.map((item) => (
        <ListItem button onClick={() => onMemberClick(item)}>
          <ListItemText
            primary={item.memberEmail}
            style={{ maxWidth: "10px", marginRight: "50px" }}
          />
          <ListItemText primary={item.memberEmail} style={{ flex: 12 }} />
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
    }
  };

  const isInvalidMember = () => {
    return (
      newMember.email === "" ||
      newMember.email === undefined
    );
  };

  const onAddOrUpdateMember = async () => {
    console.log(isInvalidMember);
    if (!isInvalidMember) {
      setState({
        addMode: false,
        editMode: false,
        addMemberError: "",
        isEditing: false,
        editingIndex: null,
      });
      if (state.isEditing) {
        let memberList = state.memberList;
        memberList[state.editingIndex] = newMember;

        setState({
          isEditing: false,
          editingIndex: null,
        });
      }else await addNewMember(newMember);
      setNewMember({
        email: "",
        firstName: "",
        lastName: "",
      });
    } else {
      setState({
        newMemberError: 'Ensure all required fields are filled'
      });
    }
  };

  return (
    <Card>
      <CardHeader title="Member List" style={{ textAlign: "center" }} />
      <CardContent>
        {/* Display the list of members */}
        <List subheader="Current Member List">
          <Button
            color="primary"
            variant="contained"
            style={{ float: "right" }}
            onClick={() => {
              setState({ addMode: true });
            }}
          >
            <AddIcon />
          </Button>
          {renderList()}
        </List>
        <Modal
          open={state.addMode}
          onClose={() => {
            setState({
              addMode: false,
              addSubtask: false,
              newMemberError: "",
            });
            setNewMember(initialNewMember);
          }}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          style={{
            height: "80%",
            maxWidth: "1000px",
            minWidth: "400px",
            width: "80%",
            margin: "auto",
          }}
        >
          <Card>
            <CardHeader title="Add Member" style={{ textAlign: "center" }} />
            <CardContent>
              <Container style={{ display: "flex", flexDirection: "row" }}>
                <Typography
                  variant="h6"
                  style={{ flex: 1, textAlign: "right" }}
                >
                  First Name:
                </Typography>
                <Container style={{ flex: 6 }}>
                  <TextField
                    style={{
                      maxWidth: "400px",
                      width: "50%",
                      alignSelf: "left",
                    }}
                    value={newMember.firstName}
                    onChange={(e) => {
                      setNewMember({
                        firstName: e.target.value,
                      });
                    }}
                  />
                </Container>
              </Container>

              <Container style={{ display: "flex", flexDirection: "row" }}>
                <Typography
                  variant="h6"
                  style={{ flex: 1, textAlign: "right" }}
                >
                  Last Name:
                </Typography>
                <Container style={{ flex: 6 }}>
                  <TextField
                    style={{
                      maxWidth: "400px",
                      width: "50%",
                      alignSelf: "left",
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

              <Container style={{ display: "flex", flexDirection: "row" }}>
                <Typography
                  variant="h6"
                  style={{ flex: 1, textAlign: "right" }}
                >
                  *Email:
                </Typography>
                <Container style={{ flex: 6 }}>
                  <TextField
                    style={{
                      maxWidth: "400px",
                      width: "50%",
                      alignSelf: "left",
                    }}
                    value={newMember.email}
                    onChange={(e) => {
                      setNewMember({
                        email: e.target.value,
                      });
                    }}
                  />
                </Container>
              </Container>
              <Container
                style={{
                  marginTop: "10px",
                  marginBottom: "30px",
                  display: "flex",
                }}
              >
                <Button
                  color="primary"
                  variant="contained"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setNewMember(initialNewMember);
                    setState({
                      addMode: false,
                      addSubtask: false,
                      newMemberError: "",
                    });
                  }}
                >
                  Cancel
                </Button>
                <Container style={{ width: "40%" }} />
                <Button
                  color="primary"
                  variant="contained"
                  style={{ flex: 1, width: "40%" }}
                  onClick={onAddOrUpdateMember}
                >
                  {state.isEditing ? "Update member" : "Add new member"}
                </Button>
              </Container>
              <Typography variant="h6" color="secondary" align="center">
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
