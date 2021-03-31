import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { getCurrentUser } from '../utils/userAuth';
import { getProjects, getProjectsByUser } from '../utils/dbUtils';
import { Redirect } from 'react-router-dom';
import '../App.css';

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

const useAuth = process.env.REACT_APP_USE_AUTH === 'true';

const HomeScreenComponent = ({ loggedIn }) => {
  const classes = useStyles();

  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (useAuth && !getCurrentUser()) return;
    getProjectsList();
    setSelectedProject(
      JSON.parse(sessionStorage.getItem('project'))?.projectName || ''
    );
  }, []);

  const getProjectsList = async () => {
    const allProjects = useAuth
      ? await getProjectsByUser()
      : await getProjects();
    setProjects(allProjects);
  };

  const handleSelectProject = (e) => {
    setSelectedProject(e.target.value);
    if (e.target.value !== '') {
      sessionStorage.setItem(
        'project',
        JSON.stringify(
          projects.find((proj) => proj.projectName === e.target.value)
        )
      );
    }
  };

  // If using authenification, check if parent says is logged in and double check only if false
  if (useAuth && !loggedIn && !sessionStorage.getItem('user')) {
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
          {projects.map(({ projectName }) => (
            <MenuItem value={projectName} key={projectName}>
              {projectName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default HomeScreenComponent;
