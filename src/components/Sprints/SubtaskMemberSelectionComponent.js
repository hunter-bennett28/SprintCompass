import { useEffect, useReducer } from "react";
import { Modal, Button, makeStyles, Card, CardHeader, CardContent, Typography, } from "@material-ui/core";
import SubTaskListComponent from "./SubtaskListComponent"
import "../../App.css";

const useStyles = makeStyles({
  inputLabel: {
    color: "#bbb",
  },
  header:{
   textAlign:"Center",
   padding:"1vh",
   fontSize:"h2"
  },
  modal: {
    backgroundColor:"secondary",
    maxWidth: '600px',
    minWidth: '400px',
    width: '80%',
    margin: 'auto',
    marginTop: '30px',
    marginBottom: '30px',
    overflow: 'auto',
  },
});

const SubtaskMemberSelectionComponent = ({ openModal, onClose, selectedStory, refreshParent }) => {
    const classes = useStyles();

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
                <SubTaskListComponent subTask={e} refreshParent={refreshParent} />
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