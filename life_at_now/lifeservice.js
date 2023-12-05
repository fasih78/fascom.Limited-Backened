const routes = require("express").Router();
const multer = require("multer");
const path = require("path");
const Life = require("./lifemodel.js");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const fs = require("fs");
require("dotenv").config();
routes.use(bodyParser.json());
const Auth_user =require('../Authorized_jwt.js')

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
  limits: {
    fileSize: 1024 * 1024, // 1 MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if the uploaded file is an image and has a supported file extension
    if (
      file.mimetype.startsWith("image/") &&
      (file.originalname.endsWith(".jpeg") ||
        file.originalname.endsWith(".png") ||
        file.originalname.endsWith(".jpg"))
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only supported image files are allowed!"), false);
    }
  },
});

const uploads = upload.single("file");

routes.post("/uploadimage/lifeatNow",Auth_user, async (req, res) => {
  try {
    uploads(req, res, async (err) => {
      if (err) {
        res.status(500).send({
          message: "Only supported image files are allowed!",
          sucess: false,
        });
      } else {
        if (req.file == undefined) {
          return res.status(400).send({ message: "Please upload a file!" });
        }
        const { path } = req.file;
        console.log(req.file);
        let content = req.body.content;
        let Heading = req.body.heading;
        const data = await cloudinary.uploader.upload(req.file.path);
        const cloudinaryUrl = data.secure_url;
        const publicIdRegex = /\/v\d+\/([^/]+)_(\w+)(?:\.\w+)?/;
        const matches = cloudinaryUrl.match(publicIdRegex);

        if (matches && matches[1] && matches[2]) {
          const publicId = `${matches[1]}_${matches[2]}`;
          let query = data.secure_url;
          const image = new Life({
            cloudinary_url: query,
            public_id: publicId,
            filePath: path,
            content: content,
            heading: Heading,
          });
          await image.save();
          res.status(200).send({ message: "image uploaded!", sucess: true });
        } else {
          console.log("Public ID not found in the URL.");
        }
      }
    });
  } catch (err) {
    res.status(500).send({ erorr: err.message });
  }
});

routes.get("/getimage/latest/lifeatnow", async (req, res) => {
  try {
    const Latestrecord = await Life.find().sort({ createdAt: -1 }).limit(3);

    res.status(201).send({ data: { Latestrecord }, sucess: true });
  } catch (err) {
    res.status(500).send({ erorr: err.message });
  }
});

routes.get("/getsubimage/lifeAtNow", async (req, res) => {
  try {
    const getimages = await Life.find();
    res.status(201).send({ data: { getimages }, sucess: true });
  } catch (err) {
    res.status(500).send({ erorr: err.message });
  }
});

routes.get("/view/lifeatnow/getone/:id", async (req, res) => {
  try {
    const id = { _id: req.params.id };
    const findone1 = await Life.findById(id);
    res.status(200).send({ sucess: true, data: { findone1 } });
  } catch (error) {
    res.status(500).send({ erorr: err.message });
  }
});

routes.delete("/lifeatnow/deleteall",Auth_user, async (req, res) => {
  try {
    const deleteone1 = await Life.deleteMany({});
    res.status(201).send({ message: "Deleted Sucessfully!" });
  } catch (err) {
    res.status(500).send({ erorr: err.message });
  }
});

routes.delete("/deleteone/lifeatnow/:id",Auth_user, async (req, res) => {
  try {
    const id = { _id: req.params.id };

    const findlife = await Life.findById(id);

    if (findlife) {
      const filePath = findlife.filePath;
      const cloudinaryUrl = findlife.cloudinary_url;
      await Life.findByIdAndDelete(id);
      const publicIdRegex = /\/v\d+\/([^/]+)_(\w+)(?:\.\w+)?/;
      const matches = cloudinaryUrl.match(publicIdRegex);
      if (matches && matches[1] && matches[2]) {
        const publicId = `${matches[1]}_${matches[2]}`;

        cloudinary.uploader.destroy([publicId], {
          type: "upload",
          resource_type: "image",
        });
        console.log("Public ID:", publicId);
      } else {
        console.log("Public ID not found in the URL.");
      }
      //   fs.unlink(filePath, (err) => {
      //     if (err) {
      //       console.error(err);
      //       return res.status(500).send({ message: "Error deleting file" });
      //     }
      //     res.status(200).send({ message: "File deleted successfully" });
      //   });
      // } else {
      //   res.status(404).send({ message: "File not found!" });
      // }
    }
    return res.status(200).send({ message: "Blog  Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error" });
  }
});

routes.put("/lifeatNow/update/:id",Auth_user, upload.single("file"), async (req, res) => {
  try {
    const id = { _id: req.params.id };
    const path = req.body.file;

    const content = req.body.content;
    const heading = req.body.heading;
    if (path !== undefined) {
      const currentproduct = await Life.findById(id);

      if (!currentproduct) {
        return res.status(404).send({ message: "Image not found!" });
      }

      const cloudinaryUrl = currentproduct.cloudinary_url;

      if (cloudinaryUrl) {
        const publicIdRegex = /\/v\d+\/([^/]+)_(\w+)(?:\.\w+)?/;
        const matches = cloudinaryUrl.match(publicIdRegex);

        if (matches && matches[1] && matches[2]) {
          const publicId = `${matches[1]}_${matches[2]}`;

          await cloudinary.uploader.destroy(publicId, {
            type: "upload",
            resource_type: "image",
          });

          // const updateimage = await cloudinary.uploader.upload(req.file.path, {
          //   resource_type: "image",
          // });

          // const newcloudinaryUrl = updateimage.secure_url;
          // console.log(newcloudinaryUrl);
          // const publicIdRegex1 = /\/v\d+\/([^/]+)_(\w+)(?:\.\w+)?/;
          // const newMatches = newcloudinaryUrl?.match(publicIdRegex1);
          // if (newMatches && newMatches[1] && newMatches[2]) {
          //   const newpublicId = `${newMatches[1]}_${newMatches[2]}`;

          const updatedImage = await Life.findByIdAndUpdate(
            id,
            {
              // filePath: path,
              content: content,
              heading: heading,
              // public_id: public_id,
              // cloudinary_url: newcloudinaryUrl,
            },
            { new: true }
          ).exec();

          res.status(201).send({
            message: "Image was Updated Successfully!",
            success: true,
            data: { updatedImage },
          });
          // } else {
          //   console.log(" New Public ID not found in the URL.");
          // }
        } else {
          console.log("Public ID not found in the URL.");
          return res.status(500).send({ error: "Error updating image" });
        }
      } else {
        return res.status(404).send({ message: "Image not found!" });
      }
    } else {
      const currentproduct = await Life.findById(id);

      if (!currentproduct) {
        return res.status(404).send({ message: "Image not found!" });
      }

      const cloudinaryUrl = currentproduct.cloudinary_url;

      if (cloudinaryUrl) {
        const publicIdRegex = /\/v\d+\/([^/]+)_(\w+)(?:\.\w+)?/;
        const matches = cloudinaryUrl.match(publicIdRegex);

        if (matches && matches[1] && matches[2]) {
          const publicId = `${matches[1]}_${matches[2]}`;

          await cloudinary.uploader.destroy(publicId, {
            type: "upload",
            resource_type: "image",
          });

          const updateimage = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "image",
          });

          const newcloudinaryUrl = updateimage.secure_url;
          console.log(newcloudinaryUrl);
          const publicIdRegex1 = /\/v\d+\/([^/]+)_(\w+)(?:\.\w+)?/;
          const newMatches = newcloudinaryUrl?.match(publicIdRegex1);
          if (newMatches && newMatches[1] && newMatches[2]) {
            const newpublicId = `${newMatches[1]}_${newMatches[2]}`;

            const updatedImage = await Life.findByIdAndUpdate(
              id,
              {
                filePath: path,
                content: content,
                heading: heading,
                public_id: newpublicId,
                cloudinary_url: newcloudinaryUrl,
              },
              { new: true }
            ).exec();

            res.status(201).send({
              message: "Image was Updated Successfully!",
              success: true,
              data: { updatedImage },
            });
          } else {
            console.log(" New Public ID not found in the URL.");
          }
        } else {
          console.log("Public ID not found in the URL.");
          return res.status(500).send({ error: "Error updating image" });
        }
      } else {
        return res.status(404).send({ message: "Image not found!" });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});
routes.get("/countdocument/life", async (req, res) => {
  try {
    const records = await Life.countDocuments();
    res.status(200).send({ records: records, success: true });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = routes;
