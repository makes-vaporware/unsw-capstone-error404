const mongoose = require('mongoose');
const app = require('../app');
const supertest = require('supertest');

const EMAIL = 'tests@auto.edu.au';
const PASSWORD = 'a';
const login = {
  email: EMAIL,
  password: PASSWORD,
};

let request = null;
beforeAll(async () => {
  console.log(process.env.DATABASE_URI);

  await mongoose.connect(process.env.DATABASE_URI);
  await supertest(app)
    .post('/auth/login')
    .send(login)
    .expect(200)
    .then((response) => {
      const accessToken = response.body.accessToken;
      request = supertest
        .agent(app)
        .set('Authorization', `Bearer ${accessToken}`) // some settings for our requests
        .set('Content-Type', 'application/json');
    });
});

afterAll(async () => {
  await mongoose.disconnect();
});

const COURSENAME = 'Jest Course';
const DESCRIPTION = 'Jest description\n jest description1';
const COURSECODE = 'JEST';
const SUBTITLE = 'Jest course subtitle';
const newCourse = {
  name: COURSENAME,
  description: DESCRIPTION,
  subtitle: SUBTITLE,
  courseCode: COURSECODE,
};

describe('Courses', () => {
  it('Should let any user create a course', (done) => {
    request
      .post('/courses')
      .send(newCourse)
      .expect(201)
      .expect(function (res) {
        const actual = res.body?.message;
        const expected = `New course ${COURSECODE} created`;
        if (actual !== expected) {
          throw new Error(
            `Response body incorrect.\n Expected:\n${expected}\nGot:\n${actual}`
          );
        }
      })
      .end(done);
  });

  it('Should let the user see all courses', (done) => {
    request.get('/courses').expect(200).end(done);
  });

  it('Should let the user delete the course he made', async () => {
    // look for course first. Doesn't seem to be possible to store from previous test and avoid this search.
    const courseRes = await request.get('/courses');
    const course = courseRes.body.find((c) => c.courseCode === COURSECODE);
    const courseId = course._id;
    console.log(`trying to delete ${courseId}`);

    // now try delete
    await request
      .delete('/courses')
      .send({ courseId })
      .expect(200)
      .expect(function (res) {
        const actual = res.body?.message;
        const expected = `${COURSECODE} ${COURSENAME} deleted`;
        if (actual !== expected) {
          throw new Error(
            `Response body incorrect.\n Expected:\n${expected}\nGot:\n${actual}`
          );
        }
      });
  });
});
