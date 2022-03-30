const express = require("express");
const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const app = express();
dotenv.config({
  path: "./config.env",
});

// Models

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
app.get("/", (_req, res) => {
  res.send("Hello sunshine!");
});

// Create account
app.post("/register", (_req, res) => {
  res.send("Register");
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
app.get("*", (req, res) => {
  res.status(404).send("Page not found - 404");
});

// Listen
app.listen(8000, () => {
  console.log("Listening on port 8000"); // localhost:8000
});
