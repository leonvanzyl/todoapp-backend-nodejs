const express = require("express");
const HttpError = require("../models/http-error");

const router = express.Router();

const groupController = require("../controllers/group-controller");

router.post("/", groupController.createGroup);
router.get("/user/:id", groupController.getGroupsByUserId);
router.delete("/:id", groupController.deleteGroup);

module.exports = router;
