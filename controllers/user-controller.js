const mongoose = require("mongoose");
const User = require("../models/user-model");
const HttpError = require("../models/http-error");

// User Signup
const signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    const error = new HttpError("Signing up failed", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("User already exists.  Please log in.", 422);
    return next(error);
  }

  const createUser = new User({
    name,
    email,
    password,
    items: [],
    groups: [],
    dateTime: new Date(),
  });

  try {
    await createUser.save();
  } catch (err) {
    console.log(err);
    const error = new HttpError("User creation failed", 500);
    return next(error);
  }

  res.status(201).json({ user: createUser.toObject({ getters: true }) });
};

// User Login
const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    const error = new HttpError("Login failed", 500);
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError("Invalid credentials.", 401);
    return next(error);
  }

  res.json({ message: "Logged in" });
};

// Get Users
const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    error = new HttpError("Unable to find users", 500);
    return next(error);
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

exports.signup = signup;
exports.login = login;
exports.getUsers = getUsers;
