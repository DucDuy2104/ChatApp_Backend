const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();
const http = require("http");
const server = http.createServer(app);
const logger = require("morgan");
const path = require("path");
// app.use(express.json());
// express.static(path.join(__dirname, "public"));

const userRouter = require("./routes/users");
const conversationRouter = require("./routes/conversations");
const messageRouter = require("./routes/messages");
const friendRouter = require("./routes/friends");
const postRouter = require("./routes/post");
const commentRouter = require("./routes/comment");
const uploadRouter = require('./routes/upload');

const mongooseURL = process.env.MONGODB_URI;

app.use(logger("dev"));
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(express.json());
app.use("/friends", friendRouter);
app.use("/users", userRouter);
app.use("/conversations", conversationRouter);
app.use("/messages", messageRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);
app.use("/upload", uploadRouter);

mongoose
  .connect(mongooseURL)
  .then(() => {
    console.log("Connect mongodb success..");
    server.listen(process.env.PORT || 3000, () =>
      console.log(`App is listening on port ${process.env.PORT || 3000}!`)
    );

    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      console.log("new client connection");
    });
  })
  .catch((error) => console.error("Error connecting to database...", error));
