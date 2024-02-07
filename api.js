const express = require("express");
const mongoose = require("mongoose");
const app = express();
const UserRoutes = require("./Routes/UserRoutes");

const dbUrl ="mongodb+srv://jeniferselvaraj2601:jeniferselvaraj2601@cluster0.jd8hvsq.mongodb.net/?retryWrites=true&w=majority"
const bodyParser = require("body-parser");
const cors = require("cors");

//mongodb connection
mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
app.use(cors());
app.use(bodyParser.json());
app.use("/", UserRoutes);

app.get("/", (req, res) => {
  res.send("We Developed the Backend!!!");
});

const Port = 4000;
app.listen(Port, () => {
  console.log(`The server is running on the ${Port}`);
});
