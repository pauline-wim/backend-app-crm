const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const app = express();
dotenv.config({
  path: "./config.env",
});

// Models
const User = require("./models/userModel");

// Connexion to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
  })
  .then(() => console.log("Connected to mongoDB"));

// Middlewares
app.use(express.json());
// app.use(cookieParser());

// ROUTES
// Home
app.get("/", async (_req, res) => {
  res.send("Hello sunshine!");
});

// Create account
app.post("/register", async (req, res) => {
  if (req.body.password.length < 6) {
    return res.status(400).json({
      message: "Invalid data",
    });
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  try {
    await User.create({
      email: req.body.email,
      password: hashedPassword,
    });
  } catch (err) {
    return res.status(400).json({
      message: "This account already exists",
    });
  }

  res.status(201).json({
    message: `User account for ${req.body.email} was CREATED`,
  });
});

// Connect to personal account
app.post("/login", (_req, res) => {
  res.send("Login");
});

// Add contacts
app.post("/contacts", (_req, res) => {
  res.send("Add contact");
});

// Get contacts
app.get("/contacts", (_req, res) => {
  res.send("Get contact list");
});

// ERROR
app.get("*", (_req, res) => {
  res.status(404).send("404: Page not found");
});

// Listen
app.listen(8000, () => {
  console.log("Listening on port 8000"); // localhost:8000
});
