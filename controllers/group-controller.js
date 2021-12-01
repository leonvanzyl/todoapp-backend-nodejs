const mongoose = require("mongoose");
const Group = require("../models/group-model");
const User = require("../models/user-model");
const Item = require("../models/item-model");
const HttpError = require("../models/http-error");
const { ServerSession } = require("mongoose/node_modules/mongodb");

// Get Groups
const getGroupsByUserId = async (req, res, next) => {
  const userId = req.params.id;
  let userWithGroups;

  try {
    userWithGroups = await User.findById(userId).populate("groups");
  } catch (err) {
    const error = new HttpError("Could not read DB", 500);
    return next(error);
  }

  if (!userWithGroups || userWithGroups.groups.length === 0) {
    const error = new HttpError("No groups found", 404);
    return next(error);
  }

  res.json({
    groups: userWithGroups.groups.map((group) =>
      group.toObject({ getters: true })
    ),
  });
};

// Create Group
const createGroup = async (req, res, next) => {
  const { title, userId } = req.body;

  const createdGroup = new Group({
    title,
    userId,
    items: [],
    dateTime: new Date(),
  });

  // Check if the userId exists.
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError("User not found", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("User not found", 500);
    return next(error);
  }

  // 1. Create Group
  // 2. Update Groups List on User

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdGroup.save({ session: sess });
    user.groups.push(createdGroup);

    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Creating Group failed", 500);
    return next(error);
  }

  res.status(201).json({ Group: createdGroup.toObject({ getters: true }) });
};

// Delete Group
const deleteGroup = async (req, res, next) => {
  const groupId = req.params.id;

  // Read Group from DB
  let group;
  try {
    group = await Group.findById(groupId).populate("userId");
  } catch (err) {
    console.log(err);
    const error = new HttpError("DB read failed", 500);
    return next(error);
  }

  if (!group) {
    const error = new HttpError("Group not found", 404);
    return next(error);
  }

  // Fetch linked user
  let user;
  try {
    user = await User.findById(group.userId);
  } catch (err) {
    return next(new HttpError("Unable to fetch linked User", 500));
  }

  if (!user) {
    return next(new HttpError("Linked user not found", 404));
  }

  // // TODO-
  // let items;
  // console.log(group.items);
  // try {
  //   items = await Item.find(group.items);
  //   console.log(items);
  // } catch (err) {
  //   return next(new HttpError("Unable to fetch lined items", 500));
  // }

  // Delete group

  // Remove group from user
  // Remove group from Items
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await group.remove({ session: sess });
    group.userId.groups.pull(group);
    await group.userId.save({ session: sess });
    sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Error deleting group", 500));
  }

  res.json({ message: "Group deleted" });
};

exports.createGroup = createGroup;
exports.getGroupsByUserId = getGroupsByUserId;
exports.deleteGroup = deleteGroup;
