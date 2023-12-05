const express = require("express");
const Career = require("./careerschema.js");
const emailvalidator = require("email-validator");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");

const career = async (req, res) => {
  try {
    let { selectcareer, experience, name, email, mobile, coverletter } =
      req.body;

    let em = req.email;
    let mb = req.mobile;
    let query = await Career.findOne({ email: em }).exec();
    let querr = await Career.findOne({ mobile: mb }).exec();

    const user = new Career({
      selectcareer,
      experience,
      name,
      email,
      mobile,
      coverletter,
    });

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "fa22bscs0133@maju.edu.pk",
        pass: "K!r@n123",
      },
    });

    if (selectcareer && experience && name && email && mobile && coverletter) {
      if (query) {
        res.status(200).sennd({ message: "invalid email!" });
      } else {
        if (querr) {
          res.status(200).sennd({ message: "invalid mobile no" });
        } else {
          if (emailvalidator.validate(email)) {
            const info = await transporter.sendMail({
              from: "fa22bscs0133@maju.edu.pk", // sender address
              to: email, // list of receivers
              subject: "Hello !✔", // Subject line
              text: `welcome to fascom limited
              name:${name},
              experience:${experience},
              coverletter:${coverletter},
              `,
            });

            console.log("Message sent: %s", info.messageId);
            await user.save();
            res.status(200).send({ message: "sucesss!" });
          } else {
            res.status(200).send({ message: "invalid email!" });
          }
        }
      }
    } else {
      res.status(200).send({ message: "all fields required!" });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const careerdelete = async (req) => {
  let response;
  const query = {};
  const dele = await Career.deleteMany(query).exec();
  response = "delete sucessfully";
  return response;
};

module.exports = { career, careerdelete };
