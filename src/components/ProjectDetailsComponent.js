import React, { useReducer } from 'react';
import styles from '../styles';

const ProjectDetailsComponent = () => {
  const initialState = {
    projectName: null,
    companyName: '',
    description: ''
  };

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialState
  );

  const handleProjectNameChange = (e) => {
    setState({ projectName: e.target.value });
  };

  const handleCompanyNameChange = (e) => {
    setState({ companyName: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    setState({ description: e.target.value });
  };

  const handleSubmitButton = async () => {
    let request = await fetch(
      `http://localhost:5000/api/projectExists?projectName=${state.projectName}`
    );
    let results = await request.json();
    if (results.exists) {
      console.log('Name already in use, could not add');
      return;
    }

    console.log('sending state: ', state);
    request = await fetch(`http://localhost:5000/api/addProject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(state)
    });
    results = await request.json();
    console.log(results);
  };

  return (
    <div>
      <h1 style={styles.pageTitle}>Project Details</h1>
      <div style={styles.form}>
        <label className='inputPrompt'>
          Project Name<span style={{ color: 'red' }}>*</span>:
        </label>
        <input type='text' onChange={handleProjectNameChange} />
        <br />
        <label className='inputPrompt'>Company Name:</label>
        <input type='text' onChange={handleCompanyNameChange} />
        <br />
        <label className='inputPrompt'>Project Desciption:</label>
        <input type='text' onChange={handleDescriptionChange} />
        <br />
        <input
          type='button'
          onClick={handleSubmitButton}
          value='Submit'
          disabled={!state.projectName}
        />
      </div>
    </div>
  );
};

export default ProjectDetailsComponent;

// const [projectName, setProjectName] = useState(null);
// const [companyName, setCompanyName] = useState('');
// const [description, setDescription] = useState('');
