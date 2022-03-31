const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Models
const Contact = require("../models/contactModel");

const secret = process.env.DB_SECRET;

// Middlewares
const auth = (req, res, next) => {
  let data;
  try {
    data = jwt.verify(req.cookies.jwt, secret);
    req.userId = data.id;
    console.log("User authentified: Request granted!");
  } catch (err) {
    return res.status(401).json({
      message: "Your token is not valid",
    });
  }
  next();
};

// Add contacts
router.post("/", auth, async (req, res) => {
  if (!req.userId) {
    return res.json({
      message: "Please connect to access your contacts.",
    });
  }
  try {
    await Contact.create({
      userId: req.userId,
      ...req.body,
    });
  } catch (err) {
    return res.status(400).json({
      message: "This account already exists",
      error: `${err}`,
    });
  }

  res.status(201).json({
    message: `Contact ${req.body.name} ADDED to your list`,
  });
});

// Get contacts
router.get("/", auth, async (req, res) => {
  let contacts;
  try {
    contacts = await Contact.find({ userId: req.userId });
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
router.put("/:id", auth, async (req, res) => {
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

router.delete("/:id", auth, async (req, res) => {
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

module.exports = router;
