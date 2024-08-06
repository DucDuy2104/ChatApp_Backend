const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

// app.use(express.json());
// express.static(path.join(__dirname, "public"));

const userRouter = require('./routes/users')

const mongooseURL = process.env.MONGODB_URI;
mongoose
  .connect(mongooseURL)
  .then(() => console.log("Connect success.."))
  .catch((error) => console.error("Error connecting to database...", error));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(express.json());
app.use('/users', userRouter)

app.listen(process.env.PORT || 3000, () =>
  console.log(`App is listening on port ${process.env.PORT || 3000}!`)
);
