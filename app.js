const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mainRouter = require("./routes/index");

const app = express();
const { PORT = 3001 } = process.env;

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(console.error);

app.use((req, res, next) => {
  req.user = {
    _id: "Chin_18-1743396732918", // paste the _id of the test user created in the previous step
  };
  next();
});

app.use(cors());
app.use(express.json());
app.use("/", mainRouter);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
