const Subscribe = require("./subscribeschema.js");
const express = require("express");
const emailvalidator = require("email-validator");

const subscribe = async (req, res) => {
  try {
    let { email } = req.body;

    let Lastuser = await Subscribe.findOne().sort({ _id: -1 });
    const id = Lastuser ? Lastuser.id + 1 : 1;

    // let emailvalidate = emailvalidator.validate(email);
    // const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    // if (emailPattern.test(email)) {
      const user = new Subscribe({ email });
      await user.save();
      res.status(200).send({
        message:
          "Thank you for subscribing to our newsletter! You'll now receive the latest news and updates directly in your inbox",
      });
    // } else {
    //   res.status(200).send({
    //     message:
    //       "Please enter your Valid email address to subscribe to our newsletter",
    //   });
    // }
  } catch (error) {
    res.status(500).send({ error: "email must be required unique!" });
  }
};

const SubscribeGetAll = async (res) => {
  try {
    const getall = await Subscribe.find();
    res.status(200).send({ sucess: true, data: { getall } });
  } catch (err) {
    res.status(500).send({ erorr: err.message });
  }
};
const SubscribeGetOne = async (req, res) => {
  try {
    const id = { _id: req.params.id };
    const getone = await Subscribe.findOne(id);
    res.status(200).send({ sucess: true, data: { getone } });
  } catch (err) {
    res.status(500).send({ erorr: err.message });
  }
};

module.exports = { subscribe, SubscribeGetAll, SubscribeGetOne };
