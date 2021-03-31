import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { getCurrentUser } from '../utils/userAuth';
import { getProjects, getProjectsByUser } from '../utils/dbUtils';
import LoginComponent from './LoginComponent';
import { Redirect } from 'react-router-dom';
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

const HomeScreenComponent = ({ selectProject }) => {
  const classes = useStyles();

  const [selectedProject, setSelectedProject] = useState('');
  const [projectNames, setProjectNames] = useState([]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    getProjectsList(currentUser);
  });

  const getProjectsList = async (user) => {
    const projects = await getProjectsByUser(user.email);
    setProjectNames(projects.map((project) => project.projectName));
  };

  const handleSelectProject = (e) => {
    setSelectedProject(e.target.value);
    if (e.target.value !== '') {
      selectProject(e.target.value);
    }
  };

  if (!getCurrentUser()) {
    console.log('no user found');
    return <Redirect to='/login' />;
  }

  return (
    <div className='Form'>
      <FormControl
        variant='outlined'
        color='secondary'
        className={classes.formControl}>
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
