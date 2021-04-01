import * as userAuth from './userAuth';
const URL = 'http://localhost:5000';

// TO BE REPLACED BY GETTING BY USERNAME WHEN USERS ADDED
const getProjects = async () => {
  const request = await fetch(`${URL}/api/projects`);
  const { projects } = await request.json();
  return projects;
};

const getProjectsByUser = async () => {
  const user = userAuth.getCurrentUser().email;
  const request = await fetch(
    `http://localhost:5000/api/projects?user=${user}`
  );
  const { projects } = await request.json();
  return projects;
};

// Adds a new project to the projects collection with a randomly generated id
const addProject = async ({ projectName, companyName, description }) => {
  const request = await fetch(`${URL}/api/addProject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ projectName, companyName, description }),
  });
  // REMOVE THESE TWO LINES LATER, for debugging
  const results = await request.json();
  //console.log(results);

  return results;
};

// Updates an existing project's information, requires a projectName value in updatedData
const updateProject = async (updatedData) => {
  const request = await fetch(`${URL}/api/updateProject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ updatedData }),
  });
  // REMOVE THESE TWO LINES LATER, for debugging
  const results = await request.json();
  //console.log(results);

  //Display if the update was successful or not
  return results;
};

const checkProjectExists = async (projectName) => {
  const response = await fetch(
    `${URL}/api/projectExists?projectName=${projectName}`
  );
  const { exists } = await response.json();
  return exists;
};

const getSprintsByProjectName = async (projectName) => {
  const request = await fetch(
    `${URL}/api/getSprintsByProjectName?projectName=${projectName}`
  );
  const { result } = await request.json();
  return result;
};

const addSprintByProjectName = async (projectName, sprint) => {
  const request = await fetch(`${URL}/api/addSprintByProjectName`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ projectName, sprint }),
  });

  const results = await request.json();
  //console.log(results);
  return results;
};

const updateSprint = async (updatedData) => {
  const request = await fetch(`${URL}/api/updateSprint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ updatedData }),
  });
  console.log(JSON.stringify({ updatedData }));
  // REMOVE THESE TWO LINES LATER, for debugging
  const results = await request.json();
  //console.log(results);

  //Display if the update was successful or not
  return results;
};

export {
  getProjects,
  getProjectsByUser,
  addProject,
  updateProject,
  checkProjectExists,
  getSprintsByProjectName,
  addSprintByProjectName,
  updateSprint,
};
