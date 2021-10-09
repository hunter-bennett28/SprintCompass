import { useEffect, useReducer } from "react";
import {
  MenuItem,
  Select,
  makeStyles,
  Grid,
  Typography,
} from "@material-ui/core";
import * as dbUtils from "../../utils/dbUtils";
import "../../App.css";

const useStyles = makeStyles({
  userInput: {
    color: "primary",
    justifyContent: "right",
  },
  paper: {
    textAlign: "left",
    minWidth: 160,
  },
});

const SubTaskListComponent = (props) => {
  const classes = useStyles();
  const initialState = {
    email: '',
    project: {},
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
    });
  };

  const handleSelectMember = async (e) => {
    //handle the most recent sprint only
    const mostRecentSprint = JSON.parse(sessionStorage.getItem("sprint"));

    let updatedUserStories = mostRecentSprint.userStories.map((story) => {
      story.subtasks = story.subtasks.map((subTask) => {
        if (subTask.task === props.subTask.task && story.task === props.task)
          subTask.assigned = e.target.value;
        return subTask;
      });
      return story;
    });
    let updatedSprint = mostRecentSprint;

    updatedSprint.userStories = updatedUserStories;

    await updateStorage(updatedSprint);

    //Need to refresh the parent element as they contain a sprint object that references this task
    props.refreshParent();

    setState({ email: e.target.value});
  };

  const updateStorage = async (updatedSprint) => {
    sessionStorage.setItem('sprint', JSON.stringify(updatedSprint));
    loadSessionStorage();

    //Add it to the sprint and update
    await dbUtils.updateSprint(updatedSprint);
  };

  return (
    <Grid container spacing={1} justify="center">
      <Grid item xs={8}>
        <Typography className={classes.paper}>{props.subTask.task}</Typography>
      </Grid>
      <Grid item xs={4}>
        <Select
          className={classes.paper} width={"10vw"}
          value={state.email ? state.email : props.subTask.assigned}
          onChange={handleSelectMember}
          label="Members"
        >
          {state.project?.members?.map((member) => (
            <MenuItem value={member.email} key={member.email}>
              {`${member.firstName} ${member.lastName}`}
            </MenuItem>
          ))}
        </Select>
      </Grid>
    </Grid>
  );
};
export default SubTaskListComponent;
