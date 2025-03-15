const { projectSkillProfile } = require('./project_scp');

const test = async () => {
  try {
    const skills =
      'SQL, web framework (e.g., React.js), frontend development, backend development (database management), user authentication, search functionality implementation, shopping cart development, admin panel creation, security implementation (encryption, secure payment integration), error handling, concurrency management, scalability design.';
    const result = await projectSkillProfile(skills);
    console.log('Test result:', result);
  } catch (error) {
    console.error('Test failed:', error);
  }
};

test();
