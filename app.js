const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config(); // Env Variables
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5000;

const itemsRoutes = require("./routes/items-routes");
const usersRoutes = require("./routes/users-routes");
const groupsRoutes = require("./routes/groups-routes");

const app = express();

app.use(bodyParser.json());

app.use("/user", usersRoutes);
app.use("/item", itemsRoutes);
app.use("/group", groupsRoutes);

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({
    message: error.message || "Something went wrong.",
  });
});

const uri = `${process.env.DB_HOST}${process.env.DB_USER}:${process.env.DB_PASS}${process.env.DB_URI}`;

mongoose
  .connect(uri)
  .then(() => app.listen(PORT, () => console.log("Server is running")))
  .catch((err) => console.log(err));
