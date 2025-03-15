const { studentSkillProfile } = require('./student_scp');

const test = async () => {
  try {
    const skills =
      'User Research|Wireframing|Prototyping|UI Design|UX Design|Interaction Design|Usability Testing|Visual Design|Design Thinking|Responsive Design';
    const result = await studentSkillProfile(skills);
    console.log('Test result:', result);
  } catch (error) {
    console.error('Test failed:', error);
  }
};

test();
