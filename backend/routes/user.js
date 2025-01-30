const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../db").User;
const Account = require("../db").Account;

const z = require("zod");
const { authMiddleware } = require("../middleware");

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

  await Account.create({
    userId: userId,
    balance: 1 + Math.random() * 10000,
  });

  const token = jwt.sign({ userId }, process.env.JWT_SECRET);

  res.json({ message: "User created successfully", token: token });
});

const signinBody = z.object({
  userName: z.string().email(),
  password: z.string(),
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
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    return res.json({ token: token });
  }

  res.status(411).json({
    message: "Error while logging in",
  });
});

const updateUserInfoBody = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  password: z.string().optional(),
});

router.put("/", authMiddleware, async (req, res) => {
  const { success } = updateUserInfoBody.safeParse(req.body);
  if (!success) {
    return res
      .status(411)
      .json({ message: "Error while updating information" });
  }

  const updatedDoc = await User.updateOne({ _id: req.userId }, req.body);

  if (!updatedDoc) {
    return res
      .status(411)
      .json({ message: "Error while updating information" });
  }

  res.json({ message: "User updated successfully" });
});

router.get("/bulk", authMiddleware, async (req, res) => {
  const query = req.query.filter || "";

  const users = await User.find({
    $or: [{ firstName: { $regex: query } }, { lastName: { $regex: query } }],
  });

  res.json({
    users: users.map((user) => {
      return {
        id: user._id,
        username: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    }),
  });
});

module.exports = router;
