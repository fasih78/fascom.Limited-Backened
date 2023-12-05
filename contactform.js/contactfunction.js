const express = require("express");
const Contact = require("./contactformschema");
const emailvalidator = require("email-validator");

const contactform = async (req, res) => {
  try {
    const { service, subject, name, email, message } = req.body;
    const LastUser = await Contact.findOne().sort({ _id: -1 }).exec();
    const id = LastUser ? LastUser.id + 1 : 1;

    // const emailvalidater = emailvalidator.validate(email);
    // console.log(emailvalidater);
    // const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    // if (emailPattern.test(email)) {
    const user = new Contact({ id, service, subject, name, email, message });
    await user.save();
    res.status(200).send({ message: " Thanks to Contact with us!" });
    // } else {
    //   res.status(400).send({ message: "Must be Required Valid Email Address!" });
    // }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const alldelete = async (req) => {
  let response;
  const query = {};
  const dele = await Contact.deleteMany(query).exec();

  response = "delete all sucessfully";

  return response;
};

module.exports = { contactform, alldelete };
