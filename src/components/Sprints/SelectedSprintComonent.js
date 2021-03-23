import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Container, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import '../../App.css';
import SelectedSprintComponent from './SelectedSprintComonent';
const useStyles = makeStyles({
  formControl: {
    minWidth: '50%',
  },
  inputLabel: {
    color: '#bbb',
  },
  userInput: {
    color: 'white',
  },
});

const SprintSelectionComponent = ({}) => {
//   const classes = useStyles();

//   const [sprintList, setSprintList] = useState([]);
//   const [selectedSprint, setSelectedSprint] = useState();
//   //const [selectedProject, setSelectedProject] = useState('');

//   const handleSelectProject = (e) => {
//     if(e.target.value==="Add a new Sprint")
//       console.log("adding sprint");

//     else{
//       console.log("Loading sprint "+e.target.value);
//     }
//     //setSelectedProject(e.target.value);
//     //if (e.target.value !== '') {
//     //  selectProject(e.target.value);
//     //}
//   };

  return (
    <Container>
        <Typography>3213123</Typography>
    </Container>

    //   <FormControl variant="outlined" className={classes.formControl}>
    //     <InputLabel className={classes.inputLabel}>Select A Sprint</InputLabel>
    //     <Select
    //       className={classes.userInput}
    //       value={""}
    //       onChange={handleSelectProject}
    //       label="Sprint"
    //     >
    //       <MenuItem value={"Add a new Sprint"} key={"add"}>
    //         Add a new Sprint
    //       </MenuItem>
    //       {sprintList.map((name) => (
    //         <MenuItem value={name} key={name}>
    //           {name}
    //         </MenuItem>
    //       ))}
    //     </Select>
    //   </FormControl>

    //   {selectedSprint && <SelectedSprintComponent/>}
  );
};

export default SprintSelectionComponent;
