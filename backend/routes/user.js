const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const User = require("../db").User;

const z = require("zod");

const signupBody = z.object({
  userName: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string(),
});

router.post("/signup", async (req, res) => {
  const { success } = signupBody.safeParse(req.body);

  if (!success) {
    return res
      .status(411)
      .json({ message: "Email already taken / Incorrect inputs" });
  }

  const existingUser = await User.findOne({ userName: req.body.userName });
  if (existingUser) {
    return res
      .status(411)
      .json({ message: "Email already taken / Incorrect inputs" });
  }

  const user = await User.create({
    userName: req.body.userName,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: req.body.password,
  });

  const userId = user._id;
  const token = jwt.sign({ userId }, JWT_SECRET);

  return res.json({ message: "User created successfully", token: token });
});

const signinBody = z.object({
  userName: z.string().email(),
  password: z.string.string(),
});

router.post("/signin", async (req, res) => {
  const { success } = signinBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({ message: "Incorrect inputs" });
  }

  const user = await User.findOne({
    userName: req.body.userName,
    password: req.body.password,
  });

  if (user) {
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    return res.json({ token: token });
  }

  res.status(411).json({
    message: "Error while logging in",
  });
});

module.exports = router;
