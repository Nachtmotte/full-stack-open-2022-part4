const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.get("", async (request, response, next) => {
  const blogs = await Blog.find({});
  response.status(200).json(blogs);
});

blogsRouter.get("/:id", async (request, response, next) => {
  const blog = await Blog.findById(request.params.id);

  blog ? response.status(200).json(blog) : response.status(404).end();
});

blogsRouter.post("", async (request, response, next) => {
  const blog = await new Blog(request.body).save();

  response.status(201).json(blog);
});

blogsRouter.delete("/:id", async (request, response, next) => {
  const blog = await Blog.findByIdAndDelete(request.params.id);

  blog ? response.status(200).end() : response.status(404).end();
});

blogsRouter.put("/:id", async (request, response, next) => {
  const { title, author, url, likes } = request.body;
  const blog = { title, author, url, likes };

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
  });

  response.status(200).json(updatedBlog);
});

module.exports = blogsRouter;
