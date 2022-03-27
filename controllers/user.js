const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.post("", async (request, response) => {
  const { username, name, password } = request.body;

  if (password && password.length < 3) {
    return response
      .status(400)
      .send({
        error:
          "User validation failed: password: Path `password` is shorter than the minimum allowed length (3).",
      });
  }

  const saltRounds = 10;
  const passwordHash = password
    ? await bcrypt.hash(password, saltRounds)
    : undefined;

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

usersRouter.get("", async (request, response) => {
  const users = await User.find({});
  response.status(200).json(users);
});

module.exports = usersRouter;
