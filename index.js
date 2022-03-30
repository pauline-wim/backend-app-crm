const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const app = express();
dotenv.config({
  path: "./config.env",
});

const secret = process.env.DB_SECRET;

// Models
const User = require("./models/userModel");
const Contact = require("./models/contactModel");

// Connexion to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
  })
  .then(() => console.log("Connected to mongoDB"));

// Middlewares
app.use(express.json());
app.use(cookieParser());

const auth = (req, res, next) => {
  let data;
  try {
    data = jwt.verify(req.cookies.jwt, secret);
  } catch (err) {
    return res.status(401).json({
      message: "Your token is not valid",
    });
  }
  req.data = data;
  console.log("User authentified: Request granted!");
  next();
};

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
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: "Invalid email or password",
    });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({
      message: "Invalid email or password",
    });
  }
  const token = jwt.sign({ id: user._id }, secret);
  res.cookie("jwt", token, { httpOnly: true, secure: false });
  res.json({
    message: "Successfully connected",
  });
});

// Add contacts
app.post("/contacts", auth, async (req, res) => {
  if (!req.data) {
    res.json({
      message: "Please connect to access your contacts.",
    });
  }
  try {
    await Contact.create(req.body);
  } catch (err) {
    return res.status(400).json({
      message: "This account already exists",
    });
  }

  res.status(201).json({
    message: `Contact ${req.body.name} ADDED to your list`,
  });
});

// Get contacts
app.get("/contacts", auth, async (_req, res) => {
  let contacts;
  try {
    contacts = await Contact.find();
  } catch (err) {
    return res.status(400).json({
      message: `ERROR: ${err}`,
    });
  }
  res.json({
    nb: contacts.length,
    data: contacts,
  });
});

// Modify a contact from the list
app.put("/contacts/:id", auth, async (req, res) => {
  let contact;
  try {
    contact = await Contact.findByIdAndUpdate(req.params.id, req.body);
  } catch (err) {
    return res.status(400).json({
      message: `ERROR: ${err}`,
    });
  }
  res.json({
    message: `Contact ${req.params.id} has been UPDATED`,
    "updated contact": req.body.name,
  });
});

app.delete("/contacts/:id", auth, async (req, res) => {
  let contact;
  try {
    contact = await Contact.findByIdAndRemove(req.params.id);
  } catch (err) {
    return res.status(400).json({
      message: `ERROR: ${err}`,
    });
  }
  res.json({
    message: `Contact ${req.params.id} has been DELETED`,
  });
});

// ERROR
app.get("*", (_req, res) => {
  res.status(404).send("404: Page not found");
});

// Listen
app.listen(8000, () => {
  console.log("Listening on port 8000"); // localhost:8000
});
