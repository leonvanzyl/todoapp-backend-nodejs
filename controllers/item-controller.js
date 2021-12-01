const mongoose = require("mongoose");
const Item = require("../models/item-model");
const User = require("../models/user-model");
const Group = require("../models/group-model");
const HttpError = require("../models/http-error");

// Get All Items
const getItemList = async (req, res, next) => {
  const items = await Item.find();
  res.json({ items: items.map((item) => item.toObject({ getters: true })) });
};

// Get Items by Item ID (Item Details)
const getItemById = async (req, res, next) => {
  const itemId = req.params.id;
  let item;
  try {
    item = await Item.findById(itemId);
  } catch (err) {
    console.log(err);
    return next();
  }

  if (!item) {
    return res.json({ message: "Place not found" });
  }
  res.json({ item: item.toObject({ getters: true }) });
};

// Get Items by User ID
const getItemsByUserId = async (req, res, next) => {
  const userId = req.params.id;
  // let items;
  let userWithItems;
  try {
    // items = await Item.find({ userId });
    userWithItems = await User.findById(userId).populate("items");
  } catch (err) {
    console.log(err);
    return next();
  }

  if (!userWithItems || userWithItems.items.length === 0) {
    return next(new HttpError("No items found for user", 404));
  }

  res.json({
    items: userWithItems.items.map((item) => item.toObject({ getters: true })),
  });
};

// Create new Item
const createItem = async (req, res, next) => {
  const { userId, title, groupId } = req.body;

  const createdItem = new Item({
    title,
    userId,
    groupId,
    dateTime: new Date(),
  });

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError("Creating item failed", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user.", 500);
    return next(error);
  }

  let group;
  if (groupId) {
    try {
      group = await Group.findById(groupId);
    } catch (err) {
      return next(new HttpError("Fetching group failed", 500));
    }
  }

  try {
    // 1. Create Item &
    // 2. Update User
    // We'll do this by starting a "session" and chaining transactions

    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdItem.save({ session: sess });
    user.items.push(createdItem); // MongoDB will glab the Item ID and add it to User Items
    await user.save({ session: sess });
    if (group) {
      // Group was supplied
      group.items.push(createdItem);
      await group.save({ session: sess });
    }
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Creating place failed", 500);
    return next(error);
  }

  res.status(201).json({ Item: createdItem.toObject({ getters: true }) });
};

// Update Item
const updateItem = async (req, res, next) => {
  const { title, groupId } = req.body;
  const itemId = req.params.id;
  console.log(itemId);

  let item;
  try {
    item = await Item.findById(itemId);
    console.log(item);
  } catch (err) {
    console.log(err);
    next();
  }

  item.title = title;
  item.groupId = groupId;

  try {
    await item.save();
  } catch (err) {
    console.log(err);
    return next();
  }

  res.status(200).json({ item: item.toObject({ getters: true }) });
};

const deleteItem = async (req, res, next) => {
  const itemId = req.params.id;

  let item;

  try {
    item = await Item.findById(itemId).populate("userId");
  } catch (err) {
    console.log(err);
    return next();
  }

  if (!item) {
    const error = new HttpError("Could not find item", 404);
    return next(error);
  }

  let user;
  try {
    user = await User.findById(item.userId);
  } catch (err) {
    const error = new HttpError("Could not find user", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("User not found", 500);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await item.remove({ session: sess });
    item.userId.items.pull(item);
    await item.userId.save({ session: sess });

    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Error deleting item", 500);
    return next(error);
  }

  res.status(200).json({ message: "item deleted" });
};

exports.getItemList = getItemList;
exports.getItemById = getItemById;
exports.getItemsByUserId = getItemsByUserId;
exports.createItem = createItem;
exports.updateItem = updateItem;
exports.deleteItem = deleteItem;
