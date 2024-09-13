const express = require("express");
const cors = require("cors");
// app create
const app = express();
// middlewhere
app.use(express.json());
app.use(cors());

// Register API
app.post("/register", (req, res) => {
  res.status(200).json({ message: "Registered" });
});

// Login API
app.post("/login", (req, res) => {
  res.status(200).json({ message: "LoggedIn" });
});

app.listen(5000 || process.env.PORT, () => {
  console.log("Server Started");
});
