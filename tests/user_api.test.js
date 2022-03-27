const supertest = require("supertest");
const mongoose = require("mongoose");
const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);
const bcrypt = require("bcrypt");

const User = require("../models/user");

beforeEach(async () => {
  await User.deleteMany({});

  const initialUsersWithPasswordHash = [];
  for (const { username, name, password } of helper.initialUsers) {
    const passwordHash = await bcrypt.hash(password, 10);
    const userWithPasswordHash = new User({ username, name, passwordHash });
    initialUsersWithPasswordHash.push(userWithPasswordHash);
  }

  const promiseArray = initialUsersWithPasswordHash.map((user) => user.save());
  await Promise.all(promiseArray);
});

describe("get all users", () => {
  test("users are returned as json", async () => {
    await api
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", "application/json; charset=utf-8");
  });

  test("all users are returned", async () => {
    const response = await api.get("/api/users");
    expect(response.body).toHaveLength(helper.initialUsers.length);
  });
});

describe("post user", () => {
  test("a valid user can be added", async () => {
    const newUser = {
      username: "Marcos",
      name: "Marcos",
      password: "Marcos",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", "application/json; charset=utf-8");

    const response = await api.get("/api/users");

    const usernames = response.body.map((user) => user.username);
    expect(usernames).toContain("Marcos");
    expect(response.body).toHaveLength(helper.initialUsers.length + 1);
  });

  test("username must be unique", async () => {
    const newUser = helper.initialUsers[0];
    await api.post("/api/users").send(newUser).expect(400);
  });

  test("a invalid user generate response bad request", async () => {
    const newUser = {
      username: "Marcos",
    };
    await api.post("/api/users").send(newUser).expect(400);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
