const URL = 'http://localhost:5000';

const getProjects = async (user = {}) => {
  if (process.env.REACT_APP_USE_AUTH) return await getProjectsByUser(user);
  const request = await fetch(`${URL}/api/projects`);
  const { projects } = await request.json();
  return projects;
};

const getProjectsByUser = async (user) => {
  const email = JSON.parse(sessionStorage.getItem('user'))?.email || user?.email;
  const request = await fetch(`http://localhost:5000/api/projects?user=${email}`);
  const { projects } = await request.json();
  return projects;
};

// Adds a new project to the projects collection with a randomly generated id
const addProject = async ({
  projectName,
  teamName,
  description,
  startDate,
  hoursPerPoint,
  totalPoints,
  totalCost,
}) => {
  const { email, lastName, firstName } = JSON.parse(sessionStorage.getItem('user'));
  const request = await fetch(`${URL}/api/addProject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      projectName,
      teamName,
      description,
      startDate,
      hoursPerPoint,
      totalPoints,
      totalCost,
      members: email
        ? [
            {
              email: email,
              firstName: firstName,
              lastName: lastName,
            },
          ]
        : [],
    }),
  });

  const results = await request.json();
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

  const results = await request.json();

  //Display if the update was successful or not
  return results;
};

const checkProjectExists = async (projectName) => {
  const response = await fetch(`${URL}/api/projectExists?projectName=${projectName}`);
  const { exists } = await response.json();
  return exists;
};

const getSprintsByProjectName = async (projectName) => {
  const request = await fetch(`${URL}/api/getSprintsByProjectName?projectName=${projectName}`);
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

  const results = await request.json();

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
