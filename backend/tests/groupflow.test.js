const mongoose = require('mongoose');
const app = require('../app');
const supertest = require('supertest');

const EMAIL = 'grouptests@auto.edu.au';
const PASSWORD = 'a';
const NAME = 'Auto Test Groups';
const UNIVERSITY = 'Test University';

const EMAIL1 = 'grouptestsuser1@auto.edu.au';
const PASSWORD1 = 'fajld9f0F(S)';
const NAME1 = 'Auto Test Groups Stu';
const UNIVERSITY1 = 'Test University';

const EMAIL2 = 'grouptestsuser2@auto.edu.au';
const PASSWORD2 = 'fjla08!1230-';
const NAME2 = 'Auto Test Groups Stu 2';
const UNIVERSITY2 = 'Test University';

const EMAILACADEMIC = 'grouptestsacademic@auto.edu.au';
const PASSWORDACADEMIC = 'fjld13411+_-';
const NAMEACADEMIC = 'Auto Test Groups Academic';
const UNIVERSITYACADEMIC = 'Test University';

const EMAILACADEMIC1 = 'grouptestsacademic1@auto.edu.au';
const PASSWORDACADEMIC1 = 'fjld1321+_-';
const NAMEACADEMIC1 = 'Auto Test Groups Academic 1';
const UNIVERSITYACADEMIC1 = 'Test University';

const unsupervisedLearning = {
  name: 'Unsupervised Learning',
  source: 'user entry',
  summary: 'Unsupervised machine learning techniques.',
};

const frontendStateManagement = {
  name: 'Frontend State Management',
  source: 'user entry',
  summary: 'Using Redux to help frontend store values.',
};
let userId;
let userId1;
let userId2;
let userIdAcademic;
let userIdAcademic1;
let group2dummy1id;
let group2dummy2id;
let courseId;
let unsupervisedLearningId;
let frontendStateManagementId;

let request;
let request1;
let request2;
let requestAcademic;
let requestAcademic1;
let requestDummy1;
let requestDummy2;

beforeAll(async () => {
  console.log(process.env.DATABASE_URI);
  await mongoose.connect(process.env.DATABASE_URI);

  await registerUsers();
  await registerGroup2Dummies();
  await request
    .post('/courses')
    .send({
      name: 'Auto Test Groups',
      description:
        'The value attribute specifies the value to be sent to a server when a form is submitted. The content between the opening <option> and closing </option> tags is ...',
      subtitle: 'Course for Group auto tests.',
      courseCode: 'GROU3900',
      minGroupSize: 1,
      maxGroupSize: 6,
    })
    .expect(201)
    .then((res) => {
      courseId = res.body.courseId;
    });
  await usersJoinCourse();

  // create some skills
  await request
    .post('/skills')
    .send(unsupervisedLearning)
    .expect(201)
    .then((res) => (unsupervisedLearningId = res.body.skillId));
  await request
    .post('/skills')
    .send(frontendStateManagement)
    .expect(201)
    .then((res) => (frontendStateManagementId = res.body.skillId));

  // add skills to student profiles
  await request1
    .post('/skills/add')
    .send({ skillId: unsupervisedLearningId })
    .expect(200);
  await request1
    .post('/skills/add')
    .send({ skillId: frontendStateManagementId })
    .expect(200);
  await request2
    .post('/skills/add')
    .send({ skillId: frontendStateManagementId })
    .expect(200);
}, 30000);

afterAll(async () => {
  await request.delete('/courses').send({ courseId }).expect(200);
  await request.delete('/users').send({ userId: userId }).expect(200);
  await request1.delete('/users').send({ userId: userId1 }).expect(200);
  await request2.delete('/users').send({ userId: userId2 }).expect(200);
  await requestDummy1
    .delete('/users')
    .send({ userId: group2dummy1id })
    .expect(200);
  await requestDummy2
    .delete('/users')
    .send({ userId: group2dummy2id })
    .expect(200);
  await requestAcademic
    .delete('/users')
    .send({ userId: userIdAcademic })
    .expect(200);
  await requestAcademic1
    .delete('/users')
    .send({ userId: userIdAcademic1 })
    .expect(200);
  await request
    .delete(`/skills`)
    .send({ skillId: unsupervisedLearningId })
    .expect(200);
  await request
    .delete(`/skills`)
    .send({ skillId: frontendStateManagementId })
    .expect(200);

  await mongoose.disconnect();
}, 30000);

let groupId;
let group2Id;
describe('Create group and create project, and do all functions.', () => {
  it('Should let the admin create a group for student 1. and make another group.', async () => {
    await request
      .post('/groups')
      .send({
        name: 'Group to Auto Test',
        description:
          'The <select> element has some unique attributes you can use to control it, such as multiple to specify whether multiple options can be selected, ...',
        isPrivate: true,
        ownerId: userId1,
        courseId: courseId,
      })
      .expect(201)
      .then((res) => {
        groupId = res.body.groupId;
      });
    await request
      .post('/groups')
      .send({
        name: 'Group 2 to Auto Test',
        description:
          'The <select> element has some unique attributes you can use to control it, such as multiple to specify whether multiple options can be selected, ...',
        isPrivate: false,
        ownerId: group2dummy1id,
        courseId: courseId,
      })
      .expect(201)
      .then((res) => {
        group2Id = res.body.groupId;
      });
  });

  it('Should be visible in all groups.', async () => {
    await request
      .get('/groups')
      .expect(200)
      .expect(function (res) {
        if (res.body.length <= 0) {
          throw new Error('Groups list did not show any.');
        }
        if (!res.body.some((group) => group._id === groupId)) {
          throw new Error(`Missing ${groupId} from the users`);
        }
      });
  });

  const expectedEditGroup = {
    name: 'Auto Testing Group edited',
    description:
      'Edited Descriptoin The value attribute specifies the value to be sent to a server when a form is submitted. The content between the opening <option> and closing </option> tags is ...',
    isPrivate: false,
  };

  it('Should allow the creator to edit it.', async () => {
    await request
      .patch('/groups')
      .send({ groupId, ...expectedEditGroup })
      .expect(200);
  });

  it('Should have changed the group details.', async () => {
    await request
      .get('/groups')
      .expect(200)
      .expect(function (res) {
        const editedGroup = res.body.find((group) => group._id === groupId);
        if (
          ![
            editedGroup.name === expectedEditGroup.name,
            editedGroup.description === expectedEditGroup.description,
            editedGroup.isPrivate === expectedEditGroup.isPrivate,
          ].every((b) => b)
        ) {
          console.log('Expected:');
          console.log(expectedEditGroup);
          console.log('Actual');
          console.log(editedGroup);
          throw new Error('Groups do not match.');
        }
      });
  });

  it('Should let a student 2 join that public group.', async () => {
    await request2
      .post('/groups/join')
      .send({
        groupId: groupId,
      })
      .expect(200);

    await requestDummy2
      .post('/groups/join')
      .send({
        groupId: group2Id,
      })
      .expect(200);
  });

  it('Should let a joined student 2 leave that group.', async () => {
    await request2
      .post('/groups/leave')
      .send({
        groupId: groupId,
      })
      .expect(200);
  });

  it('Should let the student 2 be invited in by group owner', async () => {
    await request1
      .post('/groups/adduser')
      .send({
        groupId: groupId,
        userId: userId2,
      })
      .expect(200);
  });

  it('Should let the group owner (student 1) kick that other student out.', async () => {
    await request1
      .post('/groups/removeuser')
      .send({
        groupId: groupId,
        userId: userId2,
      })
      .expect(200);
  });

  it('Should recommend groups to the student 2 not in a group.', async () => {
    await request2
      .get(`/groups/recommend?courseId=${courseId}`)
      .expect(200)
      .expect((res) => {
        if (!res.body.find((obj) => obj.groupId === groupId)) {
          console.error('Recommended groups from the test:');
          console.error(res.body);
          throw new Error('Recommended groups doesnt seem right');
        }
      });
  });

  it('Should let the student 2 be invited in by course owner', async () => {
    await request
      .post('/groups/adduser')
      .send({
        groupId: groupId,
        userId: userId2,
      })
      .expect(200);
  });

  it('Should let the group owner (student 1) give ownership to student 2', async () => {
    await request1
      .post('/groups/changeowner')
      .send({
        groupId: groupId,
        newOwnerId: userId2,
      })
      .expect(200);
  });

  it('PROJECTS___________________________________________', async () => {});
  let projectId;
  it('Should allow the course admin to create a project for the academic.', async () => {
    await request
      .post('/projects')
      .send({
        name: 'Project to Auto Test',
        description:
          'We are going to discuss how can we show/hide a div based on a selected option value. Select is one of the input type tags.',
        subtitle: 'Project for auto testing',
        clientId: userIdAcademic,
        courseId: courseId,
        category: 'Robotics',
        maxGroups: 5,
      })
      .expect(201)
      .then((res) => {
        projectId = res.body.projectId;
      });
  });

  it('Should allow the academic to make a second dummy project themselves.', async () => {
    await requestAcademic
      .post('/projects')
      .send({
        name: 'Project 2 to Auto Test',
        description:
          'Project 2 descrip[tion: We are going to discuss how can we show/hide a div based on a selected option value. Select is one of the input type tags.',
        subtitle: 'Project 2 for auto testing',
        clientId: userIdAcademic,
        courseId: courseId,
        category: 'Electrical Engineering',
        maxGroups: 5,
      })
      .expect(201);
  });

  it('Should be visible in all projects.', async () => {
    await request
      .get('/projects')
      .expect(200)
      .expect(function (res) {
        if (res.body.length <= 0) {
          throw new Error('Projects list did not show any.');
        }
        if (!res.body.some((project) => project._id === projectId)) {
          throw new Error(`Missing ${projectId} from the projects`);
        }
      });
  });

  const expectedEditProject = {
    name: 'Auto Testing Projectedited',
    description:
      'Edited Description The value attribute specifies the value to be sent to a server when a form is submitted. The content between the opening <option> and closing </option> tags is ...',
    subtitle: 'Edited project subtitle',
    category: 'Electronics',
    maxGroups: 3,
  };

  it('Should allow the client to edit the project.', async () => {
    await request
      .patch('/projects')
      .send({ projectId, ...expectedEditProject })
      .expect(200);
  });

  it('Should have changed the project details', async () => {
    await request
      .get('/projects')
      .expect(200)
      .expect(function (res) {
        const editedProject = res.body.find(
          (project) => project._id === projectId
        );
        if (
          ![
            editedProject.name === expectedEditProject.name,
            editedProject.description === expectedEditProject.description,
            editedProject.subtitle === expectedEditProject.subtitle,
            editedProject.category === expectedEditProject.category,
            editedProject.maxGroups === expectedEditProject.maxGroups,
          ].every((b) => b)
        ) {
          console.log('Expected:');
          console.log(expectedEditProject);
          console.log('Actual');
          console.log(editedProject);
          throw new Error('Projects do not match.');
        }
      });
  });

  it('Should allow academic to add required skills to the project', async () => {
    await requestAcademic
      .post('/projects/addskill')
      .send({ projectId, skillId: unsupervisedLearningId })
      .expect(200);
  });

  it('Should generate an average SCP for the group', async () => {
    await request2
      .get(`/groups/scp?groupId=${groupId}`)
      .expect(200)
      .expect((res) => {
        console.log('Average scp:');
        console.log(res.body);
      });
  });

  it('Should generate a total SCP for the group', async () => {
    await request2
      .get(`/groups/scptotal?groupId=${groupId}`)
      .expect(200)
      .expect((res) => {
        console.log('Total scp:');
        console.log(res.body);
      });
  });

  let matchingSuggestions;
  it('Should let course admin see group-to-project matching suggestions', async () => {
    await request
      .get(`/groups/match/suggest?courseId=${courseId}`)
      .expect(200)
      .expect((res) => {
        console.log('Group matching suggestions');
        console.log(res.body);
        matchingSuggestions = res.body;
      });
  });

  it('Should let course admin commit group-to-project matching using suggestions just received', async () => {
    await request
      .put(`/groups/match/assign`)
      .send({ matches: matchingSuggestions })
      .expect(200);
  });

  it('Should let course admin to unmatch all groups to projects at once', async () => {
    await request
      .patch(`/groups/clearprojectassignments`)
      .send({ courseId: courseId })
      .expect(200);
  });

  it('Should allow academic to remove a skill from the project', async () => {
    await requestAcademic
      .post('/projects/removeskill')
      .send({ projectId: projectId, skillId: unsupervisedLearningId })
      .expect(200);
  });

  it('Should allow academic to assign the project to a group', async () => {
    await requestAcademic
      .post('/projects/assigngroup')
      .send({ projectId: projectId, groupId: groupId })
      .expect(200);
  });

  it('Should allow academic to remove group from working on the project', async () => {
    await requestAcademic
      .post('/projects/removegroup')
      .send({ projectId: projectId, groupId: groupId })
      .expect(200);
  });

  it('Should allow group owner to elect the project as a preference for their group', async () => {
    await request2
      .post('/projects/addpreferences')
      .send({ projectId: projectId, groupId: groupId })
      .expect(200);
  });

  it('Should allow group owner to remove the project from preferences for their group', async () => {
    await request2
      .post('/projects/removepreferences')
      .send({ projectId: projectId, groupId: groupId })
      .expect(200);
  });

  it('Should allow groups to see recommended projects.', async () => {
    console.log(groupId);
    await request2
      .get(`/projects/recommend?groupId=${groupId}`)
      .expect(200)
      .expect((res) => {
        if (!res.body.find((obj) => obj.projectId === projectId)) {
          console.error('Recommended projects from the test:');
          console.error(res.body);
          throw new Error('Recommended projects doesnt seem right');
        }
      });
  });
  it('Should allow the current client to add another client.', async () => {
    await requestAcademic
      .post('/projects/addclient')
      .send({
        projectId: projectId,
        clientId: userIdAcademic1,
      })
      .expect(200);
  });

  it('Should allow the course admin to remove the older client.', async () => {
    await request
      .post('/projects/removeclient')
      .send({
        projectId: projectId,
        clientId: userIdAcademic,
      })
      .expect(200);
  });

  it('Should allow the newer client to add the old client back.', async () => {
    await requestAcademic1
      .post('/projects/addclient')
      .send({
        projectId: projectId,
        clientId: userIdAcademic,
      })
      .expect(200);
  });

  it('Should allow the older client to leave on own accord.', async () => {
    await requestAcademic
      .post('/projects/leave')
      .send({
        projectId: projectId,
      })
      .expect(200);
  });

  it('Should allow deletion of project by course admin', async () => {
    await request
      .delete('/projects')
      .send({ projectId: projectId })
      .expect(200);
  });
});

describe('Delete groups', () => {
  it('Should allow deletion of group by new owner (student 2)', async () => {
    await request2.delete('/groups').send({ groupId: groupId }).expect(200);
  });

  it('Should allow deletion of group 2 by course admin', async () => {
    await request.delete('/groups').send({ groupId: group2Id }).expect(200);
  });

  it('Should not exist after deletion', async () => {
    await request
      .get('/groups')
      .expect(200)
      .expect(function (res) {
        if (res.body.find((group) => group._id === groupId)) {
          throw new Error('The group still exists after deletion.');
        }
        if (res.body.find((group) => group._id === group2Id)) {
          throw new Error('The group 2 still exists after deletion.');
        }
      });
  });
});
const registerUsers = async () => {
  // register users
  await Promise.all([
    supertest(app)
      .post('/auth/register')
      .send({
        email: EMAIL,
        password: PASSWORD,
        university: UNIVERSITY,
        name: NAME,
      })
      .expect(201)
      .then((response) => {
        const accessToken = response.body.accessToken;
        request = supertest
          .agent(app)
          .set('Authorization', `Bearer ${accessToken}`) // some settings for our requests
          .set('Content-Type', 'application/json');

        console.log(`Set tester uid: ${response.body.id}`);
        userId = response.body.id;
      }),

    supertest(app)
      .post('/auth/register')
      .send({
        email: EMAIL1,
        password: PASSWORD1,
        university: UNIVERSITY1,
        name: NAME1,
      })
      .expect(201)
      .then((response) => {
        const accessToken = response.body.accessToken;
        request1 = supertest
          .agent(app)
          .set('Authorization', `Bearer ${accessToken}`)
          .set('Content-Type', 'application/json');
        userId1 = response.body.id;
      }),

    supertest(app)
      .post('/auth/register')
      .send({
        email: EMAIL2,
        password: PASSWORD2,
        university: UNIVERSITY2,
        name: NAME2,
      })
      .expect(201)
      .then((response) => {
        const accessToken = response.body.accessToken;
        request2 = supertest
          .agent(app)
          .set('Authorization', `Bearer ${accessToken}`)
          .set('Content-Type', 'application/json');
        userId2 = response.body.id;
      }),

    supertest(app)
      .post('/auth/register')
      .send({
        email: EMAILACADEMIC,
        password: PASSWORDACADEMIC,
        university: UNIVERSITYACADEMIC,
        name: NAMEACADEMIC,
      })
      .expect(201)
      .then((response) => {
        const accessToken = response.body.accessToken;
        requestAcademic = supertest
          .agent(app)
          .set('Authorization', `Bearer ${accessToken}`)
          .set('Content-Type', 'application/json');
        userIdAcademic = response.body.id;
      }),

    supertest(app)
      .post('/auth/register')
      .send({
        email: EMAILACADEMIC1,
        password: PASSWORDACADEMIC1,
        university: UNIVERSITYACADEMIC1,
        name: NAMEACADEMIC1,
      })
      .expect(201)
      .then((response) => {
        const accessToken = response.body.accessToken;
        requestAcademic1 = supertest
          .agent(app)
          .set('Authorization', `Bearer ${accessToken}`)
          .set('Content-Type', 'application/json');
        userIdAcademic1 = response.body.id;
      }),
  ]);
};
const registerGroup2Dummies = async () => {
  await Promise.all([
    supertest(app)
      .post('/auth/register')
      .send({
        email: 'group2test@dummy1.edu.au',
        password: 'jfd08 12',
        university: UNIVERSITY,
        name: 'Group 2 Dummy 1',
      })
      .expect(201)
      .then((response) => {
        const accessToken = response.body.accessToken;
        requestDummy1 = supertest
          .agent(app)
          .set('Authorization', `Bearer ${accessToken}`)
          .set('Content-Type', 'application/json');
        group2dummy1id = response.body.id;
      }),
    supertest(app)
      .post('/auth/register')
      .send({
        email: 'group2test@dummy2.edu.au',
        password: 'jfd08 12',
        university: UNIVERSITY,
        name: 'Group 2 Dummy 2',
      })
      .expect(201)
      .then((response) => {
        const accessToken = response.body.accessToken;
        requestDummy2 = supertest
          .agent(app)
          .set('Authorization', `Bearer ${accessToken}`)
          .set('Content-Type', 'application/json');
        group2dummy2id = response.body.id;
      }),
  ]);
};
const usersJoinCourse = async () => {
  await Promise.all([
    request1
      .post('/courses/join')
      .send({
        courseId: courseId,
        joinCode: '1',
      })
      .expect(200),
    request2
      .post('/courses/join')
      .send({
        courseId: courseId,
        joinCode: '1',
      })
      .expect(200),
    requestDummy1
      .post('/courses/join')
      .send({
        courseId: courseId,
        joinCode: '1',
      })
      .expect(200),
    requestDummy2
      .post('/courses/join')
      .send({
        courseId: courseId,
        joinCode: '1',
      })
      .expect(200),
    requestAcademic
      .post('/courses/join')
      .send({
        courseId: courseId,
        joinCode: '2',
      })
      .expect(200),
    requestAcademic1
      .post('/courses/join')
      .send({
        courseId: courseId,
        joinCode: '2',
      })
      .expect(200),
  ]);
};
