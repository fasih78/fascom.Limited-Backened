const routes = require("express").Router();
const CvModel = require("./uploadcvmodel.js");
const cloudinary = require("cloudinary").v2;
const emailvalidator = require("email-validator");
const nodemailer = require("nodemailer");
const multer = require("multer");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const Auth_user = require("../Authorized_jwt.js");

routes.use(bodyParser.json());

cloudinary.config({
  cloud_name: process.env.AUTH_CLOUD_NAME,
  api_key: process.env.AUTH_API_KEY,
  api_secret: process.env.AUTH_API_SECRET,
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    // Check if the uploaded file is an image and has a supported file extension
    if (
      file.mimetype.startsWith("application/") &&
      (file.originalname.endsWith(".pdf") ||
        file.originalname.endsWith(".docx") ||
        file.originalname.endsWith(".txt"))
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only   files are allowed!"), false);
    }
  },
});

var transporter = nodemailer.createTransport({
  service: "outlook",
  auth: {
    user: process.env.AUTH_USERNAME,
    pass: process.env.AUTH_PASSWORD,
  },
});

const uploads = upload.single("file");

routes.post("/uploadcv", async (req, res) => {
  try {
    uploads(req, res, async (err) => {
      if (err) {
        res.status(500).send({
          message: "Only   pdf || docx files are allowed!",
          sucess: false,
        });
      } else {
        if (req.file == undefined) {
          return res.status(400).send({ message: "Please upload a file!" });
        }

        let selectcareer = req.body.selectcareer;
        let experience = req.body.experience;
        let email = req.body.email;
        let coverletter = req.body.coverletter;
        let mobile = req.body.mobile;
        let name = req.body.name;
        const { originalname, filename, path } = req.file;

        let secure_url;
        try {
          if (emailvalidator.validate(email)) {
            const data = await cloudinary.uploader.upload(req.file.path, {
              resource_type: "raw",
            });

            secure_url = data.secure_url;
            let query = data.secure_url;

            const user = new CvModel({
              cloudinary_url: query,
              filePath: path,
              fileName: filename,
              originalName: originalname,
              name: name,
              selectcareer: selectcareer,
              experience: experience,
              email: email,
              coverletter: coverletter,
              mobile: mobile,
            });
            await user.save();
          } else {
            res.status(400).send({ message: "invalid email address!" });
          }
        } catch (err) {
          console.log({ error: err.message });
        }

        const info = await transporter.sendMail({
          from: "career@fascom.com", // sender address
          to: "career@fascom.com", // list of receivers
          subject: "Hello !✔", // Subject line
          text: `welcome to fascom limited
        name:${name},
        experience:${experience},
        coverletter:${coverletter},
        `,
          html: ` <p>Welcome to fascom limited</p>
        <p>name: ${name}</p>
        <p>career: ${selectcareer}</p>
        <p>experience: ${experience}</p>
        <p>mobile number: ${mobile}</p>
        <p>email Address: ${email}</p>
        <p>coverletter: ${coverletter}</p>
        <p>file link: <a href="${secure_url}">${secure_url}</a></p>
      `,
        });
        const info1 = await transporter.sendMail({
          from: "career@fascom.com", // sender address
          to: email, // list of receivers
          subject: `Thank You for Applying -! ${name}`, // Subject line
          text: `
          Dear ${name},
          
          Thank you for taking the time to apply for the ${selectcareer} position at  Fascom Limited . We are delighted to inform you that your application has been successfully received.

Your interest in joining our team as a ${selectcareer} is greatly appreciated. Our hiring team is currently reviewing applications and may reach out to you for further details or to schedule an interview. 

Your qualifications and experience have captured our attention, and we're eager to learn more about your potential contributions to our organization.

In the meantime, feel free to update your profile and set up job alerts on our platform to stay informed about upcoming opportunities that align with your skills and interests.

We recognize the effort you've put into your application and are excited about the possibility of having you as part of our team. Wishing you the best of luck in your job search!

Thank you once again for considering a career with  Fascom Limited.

Best regards,
Talent Acquisition Team
FASCOM LIMITED
        `,
        });

        res.status(200).send({
          message:
            "Uploaded the file successfully & send email sucessfully! " +
            req.file,
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ erorr: err.message });
  }
});

routes.delete("/cvdeleteone/:id", Auth_user, async (req, res) => {
  try {
    const id = { _id: req.params.id };

    const findcv = await CvModel.findById(id);
    console.log();
    if (findcv) {
      const filePath = findcv.filePath;
      const cloudinaryUrl = findcv.cloudinary_url;
      await CvModel.findByIdAndDelete(id);

      // Regular expression to extract the public ID
      const publicIdRegex = /\/v\d+\/([^/]+)/;
      const matches = cloudinaryUrl.match(publicIdRegex);
      if (matches && matches[1]) {
        const publicId = matches[1];
        cloudinary.uploader.destroy([publicId], {
          type: "upload",
          resource_type: "raw",
        });

        console.log("Public ID:", publicId);
      } else {
        console.log("Public ID not found in the URL.");
      }
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send({ message: "Error deleting file" });
        }
        res.status(200).send({ message: "File deleted successfully" });
      });
    } else {
      res.status(404).send({ message: "File not found!" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error" });
  }
});

routes.delete("/cvdeleteall", async (req, res) => {
  try {
    const cvdeleteall = await CvModel.deleteMany({});
    res.status(201).send({ message: "all data deleted sucessfully!" });
  } catch (err) {
    res.status(500).send({ erroe: err.message });
  }
});

module.exports = routes;
