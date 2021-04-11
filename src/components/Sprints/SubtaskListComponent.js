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
    console.log(e.target.value);
    console.log(state.email)
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
