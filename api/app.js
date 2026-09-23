var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const { connectDB } = require("./db");

const port = 3000;

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var fishesRouter = require("./routes/fishes");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/fishes", fishesRouter);

async function startServer() {
  await connectDB();

  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
}

startServer();

module.exports = app;
