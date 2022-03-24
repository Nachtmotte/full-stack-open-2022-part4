var _ = require("lodash");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => blogs.reduce((sum, blog) => sum + blog.likes, 0);

const maxBlogBy = (blogs, key) =>
  blogs.reduce((prev, current) => (prev[key] > current[key] ? prev : current));

const favoriteBlog = (blogs) =>
  blogs.length ? maxBlogBy(blogs, "likes") : null;

const mostBlogs = (blogs) => {
  if (!blogs.length) {
    return null;
  }

  const result = _(blogs)
    .groupBy("author")
    .values()
    .map((group) => ({ author: group[0].author, blogs: group.length }));

  return maxBlogBy(result, "blogs");
};

const mostLikes = (blogs) => {
  if (!blogs.length) {
    return null;
  }

  const result = _(blogs)
  .groupBy("author")
  .values()
  .map((group) => ({ author: group[0].author, likes: totalLikes(group) }));

  return maxBlogBy(result, "likes");
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
};
