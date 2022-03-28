const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

blogsRouter.get("", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", {
    username: 1,
    name: 1,
    id: 1,
  });
  response.status(200).json(blogs);
});

blogsRouter.get("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate("user", {
    username: 1,
    name: 1,
    id: 1,
  });
  blog ? response.status(200).json(blog) : response.status(404).end();
});

blogsRouter.post("", async (request, response) => {
  const { title, author, url, likes } = request.body;

  const token = request.token;
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }
  const user = await User.findById(decodedToken.id);

  let blog = new Blog({ title, author, url, likes, user: user.id });
  blog = await blog.save();

  user.blogs = user.blogs.concat(blog.id);
  await user.save();

  response.status(201).json(blog);
});

blogsRouter.delete("/:id", async (request, response) => {
  const token = request.token;
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }

  const blogToDelete = await Blog.findById(request.params.id);
  if (!blogToDelete) {
    response.status(404).end();
  } else if (blogToDelete.user._id.toString() === decodedToken.id) {
    await Blog.findByIdAndDelete(request.params.id);
    response.status(200).end();
  } else {
    response.status(401).json({ error: "login to delete blog" });
  }
});

blogsRouter.put("/:id", async (request, response) => {
  const blog = request.body;

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
  });

  updatedBlog
    ? response.status(200).json(updatedBlog)
    : response.status(404).end();
});

module.exports = blogsRouter;
