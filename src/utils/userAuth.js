import firebase from 'firebase/app';
import 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBaZYLAndAo9j412w99EYfxctl4I5DQXzY',
  authDomain: 'sprint-compass.firebaseapp.com',
  projectId: 'sprint-compass',
  storageBucket: 'sprint-compass.appspot.com',
  messagingSenderId: '336194472006',
  appId: '1:336194472006:web:61319e54bf56b7157f6247',
  measurementId: 'G-WXZXEJGYR7',
};

firebase.initializeApp(firebaseConfig);

const registerUser = async (email, password, firstName, lastName) => {
  await firebase.auth().createUserWithEmailAndPassword(email, password);
  firebase.auth().currentUser.updateProfile({
    displayName: `${firstName}|${lastName}`,
  });
  return { email, firstName, lastName };
};

const signOutUser = async () => {
  try {
    await firebase.auth().signOut();
  } catch (err) {
    console.log(`Could not sign out user: ${err.message}`);
  }
};

const signInUser = async (email, password) => {
  const { user } = await firebase.auth().signInWithEmailAndPassword(email, password);
  const [firstName, lastName] = user.displayName.split('|');
  return {
    email: user.email,
    firstName,
    lastName,
  };
};

const getCurrentUser = () => firebase.auth().currentUser;

export { registerUser, signInUser, signOutUser, getCurrentUser };
