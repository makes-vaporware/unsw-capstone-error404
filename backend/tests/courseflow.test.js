const mongoose = require('mongoose');
const app = require('../app');
const supertest = require('supertest');

let userId = '';
let studentUserId = '';

const EMAIL = 'coursetests@auto.edu.au';
const PASSWORD = 'a';
const NAME = 'Auto Test Courses';
const UNIVERSITY = 'Test University';

const EMAILSTUDENT = 'coursetestsstudent@auto.edu.au';
const PASSWORDSTUDENT = 'fajld9f0F(S)';
const NAMESTUDENT = 'Auto Test Courses Stu';
const UNIVERSITYSTUDENT = 'Test University';

let request;
let studentRequest;

beforeAll(async () => {
  console.log(process.env.DATABASE_URI);

  await mongoose.connect(process.env.DATABASE_URI);
  await supertest(app)
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
    });

  await supertest(app)
    .post('/auth/register')
    .send({
      email: EMAILSTUDENT,
      password: PASSWORDSTUDENT,
      university: UNIVERSITYSTUDENT,
      name: NAMESTUDENT,
    })
    .expect(201)
    .then((response) => {
      const accessToken = response.body.accessToken;
      studentRequest = supertest
        .agent(app)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json');

      studentUserId = response.body.id;
    });
}, 30000);

afterAll(async () => {
  await request.delete('/users').send({ userId: userId }).expect(200);
  await studentRequest
    .delete('/users')
    .send({ userId: studentUserId })
    .expect(200);
  await mongoose.disconnect();
}, 30000);

let courseId;
describe('Create course', () => {
  it('Should let anyone create course', async () => {
    await request
      .post('/courses')
      .send({
        name: 'Auto Test Course',
        description:
          'The value attribute specifies the value to be sent to a server when a form is submitted. The content between the opening <option> and closing </option> tags is ...',
        subtitle: 'Course for the auto tests.',
        courseCode: 'TEST3900',
        minGroupSize: 1,
        maxGroupSize: 6,
      })
      .expect(201)
      .then((res) => {
        console.log(res);
        courseId = res.body.courseId;
      });
  });

  it('Should be visible in all courses.', async () => {
    await request
      .get('/courses')
      .expect(200)
      .expect(function (res) {
        console.log(res.body);
        if (res.body.length <= 0) {
          throw new Error('Courses list did not show any.');
        }
        if (!res.body.some((course) => course._id === courseId)) {
          throw new Error(`Missing ${courseId} from the users`);
        }
      });
  });

  const expectedEditCourse = {
    name: 'Auto Test edited',
    courseCode: 'TEST0404',
    description:
      'Edited Descriptoin The value attribute specifies the value to be sent to a server when a form is submitted. The content between the opening <option> and closing </option> tags is ...',
    subtitle: 'Edited Auto test subtitle',
    minGroupSize: 2,
    maxGroupSize: 5,
    studentJoinCode: 'A',
    academicJoinCode: 'B',
    adminJoinCode: 'C',
  };

  it('Should allow the creator to edit it.', async () => {
    await request
      .patch('/courses')
      .send({ courseId, ...expectedEditCourse })
      .expect(200);
  });

  it('Should have changed the course details.', async () => {
    await request
      .get('/courses')
      .expect(200)
      .expect(function (res) {
        const editedCourse = res.body.find((course) => course._id === courseId);
        if (
          ![
            editedCourse.name === expectedEditCourse.name,
            editedCourse.courseCode === expectedEditCourse.courseCode,
            editedCourse.description === expectedEditCourse.description,
            editedCourse.subtitle === expectedEditCourse.subtitle,
            editedCourse.minGroupSize === expectedEditCourse.minGroupSize,
            editedCourse.maxGroupSize === expectedEditCourse.maxGroupSize,
            editedCourse.studentJoinCode === expectedEditCourse.studentJoinCode,
            editedCourse.academicJoinCode ===
              expectedEditCourse.academicJoinCode,
            editedCourse.adminJoinCode === expectedEditCourse.adminJoinCode,
          ].every((b) => b)
        ) {
          console.log('Expected:');
          console.log(expectedEditCourse);
          console.log('Actual');
          console.log(editedCourse);
          throw new Error('Courses do not match.');
        }
      });
  });

  it('Should let a student join that course.', async () => {
    await studentRequest
      .post('/courses/join')
      .send({
        courseId: courseId,
        joinCode: expectedEditCourse.studentJoinCode,
      })
      .expect(200);
  });

  it('Should let a joined student leave that course.', async () => {
    await studentRequest
      .post('/courses/leave')
      .send({
        courseId: courseId,
      })
      .expect(200);
  });

  it('Should let the student join as an academic', async () => {
    await studentRequest
      .post('/courses/join')
      .send({
        courseId: courseId,
        joinCode: expectedEditCourse.academicJoinCode,
      })
      .expect(200);
  });
  it('Should let the course owner (admin) kick that academic out.', async () => {
    await request
      .post('/courses/kick')
      .send({
        courseId: courseId,
        toKickId: studentUserId,
      })
      .expect(200);
  });
  it('Should only show one user in the course now', async () => {
    await request
      .get('/courses')
      .expect(200)
      .expect(function (res) {
        const course = res.body.find((course) => course._id === courseId);
        if (course.users.length !== 1) {
          throw new Error(
            'The course does not only have 1 user after kicking the other user.'
          );
        }
      });
  });

  it('Should allow deletion by owner', async () => {
    await request.delete('/courses').send({ courseId }).expect(200);
  });

  it('Should not exist after deletion', async () => {
    await request
      .get('/courses')
      .expect(200)
      .expect(function (res) {
        if (res.body.find((course) => course._id === courseId)) {
          throw new Error('The course still exists after deletion.');
        }
      });
  });
});
