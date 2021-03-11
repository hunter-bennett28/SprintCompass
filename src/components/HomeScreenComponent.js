import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import styles from '../styles';

const useStyles = makeStyles({
  formControl: {
    minWidth: '50%'
  },
  inputLabel: {
    color: '#999'
  },
  userInput: {
    color: 'black'
  }
});

const HomeScreenComponent = ({ projectNames, selectProject }) => {
  const classes = useStyles();

  const [selectedProject, setSelectedProject] = useState('');

  const handleSelectProject = (e) => {
    setSelectedProject(e.target.value);
    if (e.target.value !== '') {
      selectProject(e.target.value);
    }
  };
  return (
    <div style={styles.form}>
      <FormControl variant='outlined' className={classes.formControl}>
        <InputLabel className={classes.inputLabel}>Select A Project</InputLabel>
        <Select
          // labelId='demo-simple-select-outlined-label'
          // id='demo-simple-select-outlined'
          className={classes.userInput}
          value={selectedProject}
          onChange={handleSelectProject}
          label='Project'>
          {/* <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem> */}
          {projectNames.map((name) => (
            <MenuItem value={name} key={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default HomeScreenComponent;
