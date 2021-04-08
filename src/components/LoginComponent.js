import React, { useReducer } from 'react';
import { TextField, Button, makeStyles, InputAdornment, IconButton } from '@material-ui/core';
import { Visibility, VisibilityOff, Email } from '@material-ui/icons';
import '../App.css';
import { registerUser, signInUser } from '../utils/userAuth';
import { useHistory, Redirect } from 'react-router-dom';

const useStyles = makeStyles({
  inputContainer: {
    marginBottom: 20,
    width: '80%',
    textAlign: 'center',
  },
  firstNameContainer: {
    marginBottom: 20,
    width: '38%',
    marginRight: '6%',
    textAlign: 'center',
  },
  lastNameContainer: {
    marginBottom: 20,
    width: '35%',
    textAlign: 'center',
  },
  textField: {
    color: 'white',
  },
  inputLabel: {
    color: '#aaa',
  },
  icon: {
    color: 'white',
    marginRight: 10,
    padding: 0,
  },
  iconContainer: {
    marginRight: 10,
  },
  zeroMargin: {
    margin: 0,
  },
});

const LoginComponent = ({ notifyLogIn, displayPopup, loggedIn, route }) => {
  const classes = useStyles();
  const history = useHistory();

  const initialState = {
    email: '',
    pass: '',
    showPass: false,
    passTwo: '',
    login: true,
    lastName: '',
    firstName: '',
  };
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialState
  );

  const handleRegisterButton = async () => {
    try {
      const result = await (state.login
        ? signInUser(state.email, state.pass)
        : registerUser(state.email, state.pass, state.firstName, state.lastName));
      notifyLogIn(result);
      sessionStorage.setItem('user', JSON.stringify(result));
      history.push('/home');
    } catch (err) {
      console.log('Authentification failed: ', err);
      displayPopup(`${state.login ? 'Log In ' : 'Registration '} Failed: ${err.message}`);
    }
  };

  const handlePasswordTwoChange = (e) => {
    setState({ passTwo: e.target.value });
  };

  const handleFirstNameChange = (e) => {
    setState({ firstName: e.target.value });
  };

  const handleLastNameChange = (e) => {
    setState({ lastName: e.target.value });
  };

  const handleToggleType = () => {
    setState({ login: !state.login, email: '', pass: '', passTwo: '' });
  };

  // If user is logged in already and logout did not redirect here, redirect
  if (process.env.REACT_APP_USE_AUTH && route.location.search !== '?logout=true' && loggedIn) {
    return <Redirect to='/home' />;
  }

  return (
    <div className='LoginContainer'>
      <TextField
        className={classes.inputContainer}
        color='secondary'
        value={state.email}
        label='Email'
        required={true}
        InputLabelProps={{ className: classes.inputLabel }}
        InputProps={{
          className: classes.textField,
          endAdornment: (
            <InputAdornment className={classes.iconContainer} position='end'>
              <Email />
            </InputAdornment>
          ),
        }}
        onChange={(e) => setState({ email: e.target.value })}
      />
      <br />
      <TextField
        className={classes.inputContainer}
        type={state.showPass ? 'text' : 'password'}
        color='secondary'
        value={state.pass}
        label='Password'
        required={true}
        InputLabelProps={{ className: classes.inputLabel }}
        InputProps={{
          className: classes.textField,
          endAdornment: (
            <InputAdornment className={classes.zeroMargin} position='end'>
              <IconButton
                aria-label='toggle password visibility'
                className={classes.icon}
                onClick={() => setState({ showPass: !state.showPass })}>
                {state.showPass ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        onChange={(e) => setState({ pass: e.target.value })}
      />
      <br />
      {!state.login && (
        <div>
          <TextField
            error={!state.login && state.passTwo !== '' && state.passTwo !== state.pass}
            type={state.showPass ? 'text' : 'password'}
            className={classes.inputContainer}
            color='secondary'
            value={state.passTwo}
            label='Re-enter Password'
            required={true}
            InputLabelProps={{ className: classes.inputLabel }}
            InputProps={{
              className: classes.textField,
              endAdornment: (
                <InputAdornment className={classes.zeroMargin} position='end'>
                  <IconButton
                    aria-label='toggle password visibility'
                    className={classes.icon}
                    onClick={() => setState({ showPass: !state.showPass })}>
                    {state.showPass ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onChange={handlePasswordTwoChange}
          />
          <br />
          <TextField
            type='text'
            className={classes.firstNameContainer}
            color='secondary'
            value={state.firstName}
            label='First Name'
            required={true}
            InputLabelProps={{ className: classes.inputLabel }}
            InputProps={{
              className: classes.textField,
            }}
            onChange={handleFirstNameChange}
          />
          <TextField
            type='text'
            className={classes.lastNameContainer}
            color='secondary'
            value={state.lastName}
            label='Last Name'
            required={true}
            InputLabelProps={{ className: classes.inputLabel }}
            InputProps={{
              className: classes.textField,
            }}
            onChange={handleLastNameChange}
          />
        </div>
      )}
      <Button
        variant='contained'
        color='primary'
        onClick={handleRegisterButton}
        disabled={
          state.email === '' ||
          state.pass === '' ||
          (!state.login &&
            (state.pass !== state.passTwo || state.firstName === '' || state.lastName === ''))
        }>
        {state.login ? 'LOG IN' : 'REGISTER'}
      </Button>
      {state.login ? (
        <div>
          <p className='loginQuestionText'>Not signed up?</p>
          <p className='linkText' onClick={handleToggleType}>
            Create An Account
          </p>
        </div>
      ) : (
        <div>
          <p className='loginQuestionText'>Already have an account?</p>
          <p className='linkText' onClick={handleToggleType}>
            Log In
          </p>
        </div>
      )}
    </div>
  );
};

export default LoginComponent;
