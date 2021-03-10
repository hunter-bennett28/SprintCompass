// TO BE REPLACED BY GETTING BY USERNAME WHEN USERS ADDED
const getProjects = async () => {
  const request = await fetch('http://localhost:5000/api/projects');
  const { projects } = await request.json();
  return projects;
};

// Adds a new project to the projects collection with a randomly generated id
const addProject = async ({
  projectName,
  companyName = '',
  description = ''
}) => {
  const request = await fetch('http://localhost:5000/api/addProject', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ projectName, companyName, description })
  });
  // REMOVE THESE TWO LINES LATER, for debugging
  const results = await request.json();
  console.log(results);
};

// Updates an existing project's information
const updateProject = async (updatedData) => {
  const request = await fetch('http://localhost:5000/api/updateProject', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedData)
  });
  // REMOVE THESE TWO LINES LATER, for debugging
  const results = await request.json();
  console.log(results);
};

const checkProjectExists = async (projectName) => {
  const response = await fetch(
    `http://localhost:5000/api/projectExists?projectName=${projectName}`
  );
  const { exists } = await response.json();
  return exists;
};

module.exports = {
  getProjects,
  addProject,
  updateProject,
  checkProjectExists
};
