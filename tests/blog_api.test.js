const supertest = require("supertest");
const mongoose = require("mongoose");
const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);

const Blog = require("../models/blog");

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

describe("get all blogs", () => {
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", "application/json; charset=utf-8");
  });

  test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs");

    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });

  test("all blogs have a property called id", async () => {
    const response = await api.get("/api/blogs");

    response.body.forEach((blog) => expect(blog.id).toBeDefined());
  });
});

describe("post blog", () => {
  test("a valid blog can be added", async () => {
    const newBlog = {
      title: "First class tests",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
      likes: 10,
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", "application/json; charset=utf-8");

    const response = await api.get("/api/blogs");

    const titles = response.body.map((b) => b.title);

    expect(titles).toContain("First class tests");
    expect(response.body).toHaveLength(helper.initialBlogs.length + 1);
  });

  test("a valid blog without likes will have zero likes", async () => {
    const newBlog = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    };

    const response = await api.post("/api/blogs").send(newBlog);

    expect(response.body.likes).toBe(0);
  });

  test("an invalid blog generate response bad request", async () => {
    const newBlog = { author: "Edsger W. Dijkstra" };

    await api.post("/api/blogs").send(newBlog).expect(400);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
