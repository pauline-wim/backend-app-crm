const mongoose = require("mongoose");

const validateEmail = function (email) {
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
};

const ContactSchema = mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "User" },
  name: {
    type: String,
    minlength: 1,
    maxlength: 30,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: "Email address is required",
    validate: [validateEmail, "Please fill a valid email address"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  description: String,
  categorie: Number,
});

const Contact = mongoose.model("Contact", ContactSchema);

module.exports = Contact;
