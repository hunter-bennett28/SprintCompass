import { useEffect, useReducer } from "react";
import { Modal, Button, MenuItem, Select, makeStyles, Card, CardHeader, CardContent, Typography } from "@material-ui/core";
import * as dbUtils from "../../utils/dbUtils";
import "../../App.css";

const useStyles = makeStyles({
  formControl: {
    minWidth: "50%",
  },
  inputLabel: {
    color: "#bbb",
  },
  userInput: {
    color: "secodary",
    float: "right"
  },

  header:{
   textAlign:"Center",
   padding:"1vh",
   fontSize:"h2"
  },
  closeButton:{
    margin:"2vh"
  },
  modal: {
    backgroundColor:"secondary",
    maxWidth: '1000px',
    minWidth: '400px',
    width: '80%',
    margin: 'auto',
    marginTop: '30px',
    marginBottom: '30px',
    overflow: 'auto',
  },
});

const SubTaskList = (props) => {
  const classes = useStyles();
  const initialState = {
    email: null,
    project: {},
    sprint: {},
  };
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialState
  );

  useEffect(() => {
    loadSessionStorage();
  }, []);

  const loadSessionStorage = () => {
    setState({
      project: JSON.parse(sessionStorage.getItem("project")) || {},
      sprint: JSON.parse(sessionStorage.getItem("sprint")) || {},
    });
  };

  const handleSelectMember = async (e) => {
    let updatedUserStories = state.sprint.userStories.map((story) => {
      story.subtasks = story.subtasks.map((subTask) => {
        if (subTask.task === props.subTask.task) {
          subTask.assigned = e.target.value;
        }
        return subTask;
      });
      return story;
    });
    let updatedSprint = state.sprint;
    updatedSprint.userStories = updatedUserStories;
    sessionStorage.setItem("sprint", JSON.stringify(updatedSprint));
    await dbUtils.updateSprint(updatedSprint);
    setState({ email: e.target.value, sprint: updatedSprint });
  };

  return (
    <div style={{ display: "flex" }}>
      {props.subTask.task}{" "}
      <Select
        className={classes.userInput}
        value={state.email ? state.email : props.subTask?.assigned}
        onChange={handleSelectMember}
        label="Members"
      >
        {state.project?.members?.map((member) => (
          <MenuItem value={member.email} key={member.email}>
            {`${member.firstName} ${member.lastName}`}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};
const SubtaskMemberSelectionComponent = (props) => {
  const classes = useStyles();
  const initialState = {
    email: null,
    memberList: [],
    subtaskList: [],
    project: {},
    addMode: false,
  };
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialState
  );

  useEffect(() => {
    loadSessionStorage();
  }, []);

  const loadSessionStorage = () => {
    setState({
      sprint: JSON.parse(sessionStorage.getItem("sprint")) || {},
      project: JSON.parse(sessionStorage.getItem("project")) || {},
    });
  };

  let { openModal, onClose, selectedStory } = props;
  console.log(openModal);
  return (
    <Card>
      {selectedStory && (
        <Modal
        className={classes.modal}
          open={openModal}
          onClose={onClose}
        > 
          <Card className={classes.inputLabel}>
            <CardHeader title={selectedStory.task} className={classes.header}/>
            <CardContent>
            <Typography
            variant="h6"
            style={{ flex: 1, textAlign: "center" }}
            
            
            >{selectedStory.description}</Typography>
            <Typography>Sub Tasks</Typography>
            {selectedStory.subtasks.map((e) => (
              <SubTaskList subTask={e} />
            ))}

            <Button
              color="primary"
              variant="contained"
              style={{ flex: 1, float:"right", margin:"1vh"}}
              onClick={onClose}
            >
              Close
            </Button>
            </CardContent>
          </Card>
        </Modal>
      )}
    </Card>
  );
};
export default SubtaskMemberSelectionComponent;
