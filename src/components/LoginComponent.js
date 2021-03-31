import React, { useReducer } from 'react';
import {
  TextField,
  Button,
  makeStyles,
  InputAdornment,
  IconButton
} from '@material-ui/core';
import { Visibility, VisibilityOff, Email } from '@material-ui/icons';
import '../App.css';
import { getCurrentUser, registerUser, signInUser } from '../utils/userAuth';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles({
  inputContainer: {
    marginBottom: 20,
    width: '80%',
    textAlign: 'center'
  },
  textField: {
    color: 'white'
  },
  inputLabel: {
    color: '#aaa'
  },
  icon: {
    color: 'white',
    marginRight: 10,
    padding: 0
  },
  iconContainer: {
    marginRight: 10
  },
  zeroMargin: {
    margin: 0
  }
});

const LoginComponent = ({ notifyUserLoggedIn, displayPopup }) => {
  const classes = useStyles();
  const history = useHistory();

  const initialState = {
    email: '',
    pass: '',
    showPass: false,
    passTwo: '',
    login: true
  };
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialState
  );

  const handleRegisterButton = async () => {
    try {
      const results = await (state.login
        ? signInUser(state.email, state.pass)
        : registerUser(state.email, state.pass));
      console.log('Login succeeded: ', results);
      notifyUserLoggedIn();
      console.log('logged in, currentUser: ', getCurrentUser());
      history.push('/home');
    } catch (err) {
      console.log('Authentification failed: ', err);
      displayPopup(
        `${state.login ? 'Log In ' : 'Registration '} Failed: ${err.message}`
      );
    }
  };

  const handlePasswordTwoChange = (e) => {
    setState({ passTwo: e.target.value });
  };

  const handleToggleType = () => {
    setState({ login: !state.login, email: '', pass: '', passTwo: '' });
  };

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
          )
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
          )
        }}
        onChange={(e) => setState({ pass: e.target.value })}
      />
      <br />
      {!state.login && (
        <div>
          <TextField
            error={
              !state.login &&
              state.passTwo !== '' &&
              state.passTwo !== state.pass
            }
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
                // <InputAdornment className={classes.zeroMargin} position='end'>
                //   <IconButton className={classes.icon}>
                //     {state.passTwo !== '' && state.pass === state.passTwo && (
                //       <CheckCircle />
                //     )}
                //     {state.passTwo !== '' && state.pass !== state.passTwo && (
                //       <Error />
                //     )}
                //   </IconButton>
                // </InputAdornment>
                <InputAdornment className={classes.zeroMargin} position='end'>
                  <IconButton
                    aria-label='toggle password visibility'
                    className={classes.icon}
                    onClick={() => setState({ showPass: !state.showPass })}>
                    {state.showPass ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            onChange={handlePasswordTwoChange}
          />
          <br />
        </div>
      )}
      <Button
        variant='contained'
        color='primary'
        onClick={handleRegisterButton}
        disabled={
          state.email === '' ||
          state.pass === '' ||
          (!state.login && state.pass !== state.passTwo)
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
