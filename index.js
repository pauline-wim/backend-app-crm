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

// Routers
const contactsRouter = require("./controllers/contactsRouter");

// Connexion to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
  })
  .then(() => console.log("Connected to mongoDB"));

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use("/contacts", contactsRouter);

const auth = (req, res, next) => {
  let data;
  try {
    data = jwt.verify(req.cookies.jwt, secret);
    req.userId = data.id;
    req.data = data;
    console.log("User authentified: Request granted!");
  } catch (err) {
    return res.status(401).json({
      message: "Your token is not valid",
    });
  }
  next();
};

// ROUTES
// Create account
app.post("/register", async (req, res) => {
  const regex = /^(?=.*\d).{6,}$/;
  if (!regex.test(req.body.password)) {
    return res.status(400).json({
      message:
        "Error: Your password must contain at least 6 characters and one digit",
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

// Logout from account
app.get("/logout", auth, async (_req, res) => {
  try {
    res.clearCookie("jwt");
    // res.redirect("/");
    res.json({
      message: "Cookie deleted",
      status: "Disconnected",
    });
  } catch (err) {
    return res.status(400).json({
      message: `Something went wrong ${err}`,
    });
  }
});

// Delete user
app.delete("/users/:id", async (req, res) => {
  let user;
  try {
    user = await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User DELETED", "user deleted": `${user.email}` });
  } catch (err) {
    return res.status(400).json({
      message: `Something went wrong ${err}`,
    });
  }
});

// ERROR
app.get("*", (_req, res) => {
  res.status(404).send("404: Page not found");
});

// Listen
app.listen(8000, () => {
  console.log("Listening on port 8000"); // localhost:8000
});
