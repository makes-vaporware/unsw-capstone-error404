const mongoose = require('mongoose');
const app = require('../app');
const supertest = require('supertest');

let userId = 'fail id';
let toDelete = 'fail delete id';

const EMAIL = 'tests@auto.edu.au';
const PASSWORD = 'a';
const NAME = 'Auto Test';
const UNIVERSITY = 'Test University';
const login = {
  email: EMAIL,
  password: PASSWORD,
};

let request;
let adminRequest;

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
    .post('/auth/login')
    .send({
      email: 'site@admin.edu.au',
      password: 'admin',
    })
    .expect(200)
    .then((response) => {
      const accessToken = response.body.accessToken;
      adminRequest = supertest
        .agent(app)
        .set('Authorization', `Bearer ${accessToken}`) // some settings for our requests
        .set('Content-Type', 'application/json');
    });
}, 30000);

afterAll(async () => {
  console.log(userId);
  await request.delete('/users').send({ userId: userId }).expect(200);
  await mongoose.disconnect();
}, 30000);

describe('Register', () => {
  it('Should let anyone register', async () => {
    await request
      .post('/auth/register')
      .send({
        email: 'temp@test.edu.au',
        password: '31jl',
        university: 'University of Tests',
        name: 'Temp Test',
      })
      .expect(201)
      .then((res) => {
        console.log(res);
        toDelete = res.body.id;
      });
  });
});

describe('Delete user', () => {
  it('Should let a site admin delete the user', async () => {
    console.log(toDelete);
    await adminRequest.delete('/users').send({ userId: toDelete }).expect(200);
  });
});

describe('Logging in', () => {
  it('Should log in to the Test Auto account', async () => {
    await request.post('/auth/login').send(login).expect(200);
  });

  it('Should throw 401 when giving wrong password', async () => {
    const login = {
      email: EMAIL,
      password: 'a239o4uofjakjlf na08e ',
    };
    await request.post('/auth/login').send(login).expect(401);
  });
});

describe('Seeing all users', () => {
  it('Should show a list of users', (done) => {
    request
      .get('/users')
      .expect(200)
      .expect(function (res) {
        if (res.body.length <= 0) {
          throw new Error('Users list did not show anyone.');
        }
        if (
          !res.body.some((user) => user.email.toString() === EMAIL.toString())
        ) {
          throw new Error(
            `Missing ${EMAIL} from the users\n ${res.body.reduce(
              (acc, user) => `${acc}, ${user.email}`
            )}`
          );
        }
      })
      .end(done);
  });
});

describe('See profile', () => {
  it('Should be able to see own profile.', async () => {
    await request
      .get(`/users/profile?userId=${userId}`)
      .expect(200)
      .expect((res) => {
        let u = res.body;
        if (
          ![
            u.email === EMAIL,
            u._id === userId,
            u.name === NAME,
            u.university === UNIVERSITY,
          ].every((b) => b)
        ) {
          throw new Error(`Profile content is wrong.`);
        }
      });
  });
});

describe('Updating', () => {
  const expectedProfile = {
    email: 'newtest@email.edu.au',
    name: 'Test Changed Auto',
    university: 'Edited University',
    password: 'new password',
  };
  it('Should be able to update user.', async () => {
    await request
      .patch(`/users`)
      .send({
        userId,
        ...expectedProfile,
      })
      .expect(200);
  });
  it('Should be able to see updated profile.', async () => {
    await request
      .get(`/users/profile?userId=${userId}`)
      .expect(200)
      .expect((res) => {
        let u = res.body;
        if (
          ![
            u.email === expectedProfile.email,
            u._id === userId,
            u.name === expectedProfile.name,
            u.university === expectedProfile.university,
          ].every((b) => b)
        ) {
          throw new Error(`Updated profile content is wrong.`);
        }
      });
  });
});

describe('Skills', () => {
  const skill = {
    name: 'Basket Weaving',
    source: 'user entry',
    summary: 'Using various materials to weave a variety of baskets.',
  };

  let skillId;
  it('Should let the user create a skill', async () => {
    await request
      .post('/skills')
      .send(skill)
      .expect(201)
      .then((res) => (skillId = res.body.skillId));
  });

  it('Should have skill visible be visible in all skills.', async () => {
    await request
      .get(`/skills`)
      .expect(200)
      .expect((res) => {
        let skills = res.body;
        if (!skills.find((s) => s._id === skillId)) {
          throw new Error(`Skill was not added to all skills pool.`);
        }
      });
  });

  it('Should let user add the skill to the profile', async () => {
    await request.post('/skills/add').send({ skillId }).expect(200);
  });

  it("Should show on the user's profile", async () => {
    await request
      .get(`/users/profile?userId=${userId}`)
      .expect(200)
      .expect((res) => {
        let u = res.body;
        console.log(u);
        if (!u.skills.find((sid) => sid === skillId)) {
          throw new Error(`Skill was not added to profile.`);
        }
      });
  });

  it('Should be removable from profile', async () => {
    await request.post('/skills/remove').send({ skillId }).expect(200);
  });

  it("Should NOT show on the user's profile", async () => {
    await request
      .get(`/users/profile?userId=${userId}`)
      .expect(200)
      .expect((res) => {
        let u = res.body;
        if (u.skills.find((sid) => sid === skillId)) {
          throw new Error(`Skill is still onprofile.`);
        }
      });
  });

  it('Should be deleteable entirely.', async () => {
    await request.delete(`/skills`).send({ skillId }).expect(200);
  });

  it('Should not be visible in pool of skills.', async () => {
    await request
      .get(`/skills`)
      .expect(200)
      .expect((res) => {
        let skills = res.body;
        if (skills.find((s) => s._id === skillId)) {
          throw new Error(`Skill was not removed from all skills pool.`);
        }
      });
  });
});
