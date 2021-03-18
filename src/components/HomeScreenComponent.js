import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import '../App.css';

const useStyles = makeStyles({
  formControl: {
    minWidth: '50%'
  },
  inputLabel: {
    color: '#bbb'
  },
  userInput: {
    color: 'white'
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
    <div className='Form'>
      <FormControl variant='outlined' className={classes.formControl}>
        <InputLabel className={classes.inputLabel}>Select A Project</InputLabel>
        <Select
          className={classes.userInput}
          value={selectedProject}
          onChange={handleSelectProject}
          label='Project'>
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
