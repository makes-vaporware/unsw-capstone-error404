const projectSkillProfile = async (skills) => {
  const apiKey = 'api-key-redacted-does-not-work'; // Replace with your actual API key
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  const model_name = 'gpt-3.5-turbo';
  const prompt = `
    Consider an project. The following are the skills needed to complete this project from most needed to somewhat needed (the skills that are not needed are not mentioned):
    ${skills}

    Consider a team that would be best to take on this project. This team in summary can be represented in quality based on 6 role category profiles.

    The 6 roles are:

    PM - Project Manager
    DE - Data Engineer
    SD - Software Developer
    ML - Machine Learning Engineer
    UX - UI/UX designer
    BA - Business Analyst, Client Contact

    Now we will build this dream team:
    You have 25 points, and you can distribute up to 25 points across 6 role categories which hold a maximum of 10 points each.
    The more points you give a role, the more relevant you believe the role's skills are needed in this team to take on the project, these roles you must score 8-10 points.
    The less points you give a role, the less relevant you believe the role's skills are needed in this team to take on the project, these roles you must score 0-3 points.
    If some aspects of the role's skillset are slightly needed for the team taking on the project, then you must score it 4-7 points.

    You have to distribute a minimum of 15 points.

    The 6 roles are:

    PM - Project Manager
    DE - Data Engineer
    SD - Software Developer
    ML - Machine Learning Engineer
    UX - UI/UX designer
    BA - Business Analyst, Client Contact
    Your output should ONLY BE THE FOLLOWING CSV TABLE AND NOTHING ELSE:

    PM, DE, SD, ML, UX, BA
    x_1, x_2, x_3, x_4, x_5, x_6

    Where x_n is the number of points you have given each role.
    `;

  const body = {
    model: model_name,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  const rows = data.choices[0].message.content.split('\n');
  // return rows[1].split(', ').map(num => parseFloat(num) * 5.5);
  return rows[1].split(', ');
};

module.exports = { projectSkillProfile };
