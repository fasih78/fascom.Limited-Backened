const express = require("express");
const { default: mongoose, model } = require("mongoose");

const contactschema = new mongoose.Schema({
  id: { type: Number },
  service: { type: String, required: true },
  subject: { type: String, required: true },
  name: { type: String, required: true },
  email: {
    type: String,
  },
  message: { type: String },
});

let Contact = mongoose.model("CONTACT", contactschema);
module.exports = Contact;
