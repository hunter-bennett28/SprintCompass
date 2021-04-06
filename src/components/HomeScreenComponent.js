import React, { useEffect } from 'react';
import { Button } from '@material-ui/core';
import { getCurrentUser } from '../utils/userAuth';
import { useHistory, Redirect } from 'react-router-dom';
import '../App.css';

// const useStyles = makeStyles({
//   formControl: {
//     minWidth: '50%',
//   },
//   inputLabel: {
//     color: '#bbb',
//   },
//   userInput: {
//     color: 'white',
//   },
// });

const useAuth = process.env.REACT_APP_USE_AUTH === 'true';

const HomeScreenComponent = ({ loggedIn }) => {
  // const classes = useStyles();
  const history = useHistory();

  useEffect(() => {
    if (useAuth && !getCurrentUser()) return;
  }, []);

  const handleCreateNewProject = () => {
    sessionStorage.removeItem('project');
    history.push('/projectdetails');
  };

  // If using authenification, check if parent says is logged in and double check only if false
  if (useAuth && !loggedIn && !sessionStorage.getItem('user')) {
    console.log('no user found');
    return <Redirect to='/login' />;
  }

  if (sessionStorage.getItem('project')) history.push('/productbacklog');

  return (
    <div className='Centered'>
      <div className='homeScreenTitle'>
        <p className='welcomeMessage'>Welcome To Sprint Compass</p>
      </div>
      <img src='sprintcompass_logo.png' className='homeScreenLogo' alt='fast compass logo' />
      <p className='homeScreenInfo'>
        <em>Create or select a project above to get started!</em>
      </p>
      <Button variant='contained' color='primary' onClick={handleCreateNewProject}>
        Create A New Project
      </Button>
    </div>
  );
};

export default HomeScreenComponent;
