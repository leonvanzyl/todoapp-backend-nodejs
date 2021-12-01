const express = require("express");
const jwt = require("jsonwebtoken");
const userControllers = require("../controllers/user-controller");

const router = express.Router();

// Post Routes
router.post("/signup", userControllers.signup);
router.post("/login", userControllers.login);

// Get Routes
router.get("/", userControllers.getUsers);

module.exports = router;
