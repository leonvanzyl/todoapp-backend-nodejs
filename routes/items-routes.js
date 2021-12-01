const express = require("express");
const HttpError = require("../models/http-error");

const router = express.Router();

const listController = require("../controllers/item-controller");

router.get("/", listController.getItemList);
router.get("/:id", listController.getItemById);
router.patch("/:id", listController.updateItem);
router.delete("/:id", listController.deleteItem);

router.get("/user/:id", listController.getItemsByUserId);

router.post("/", listController.createItem);

module.exports = router;
