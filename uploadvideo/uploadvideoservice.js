const routes = require("express").Router();
const Video = require("./uploadvideomodel.js");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
routes.use(bodyParser.json());
require("dotenv").config();

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
    fileSize: 1024 * 1024 * 1024, // 1 GB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if the uploaded file is an image and has a supported file extension
    if (
      file.mimetype.startsWith("video/") &&
      (file.originalname.endsWith(".mp4") ||
        file.originalname.endsWith(".AVI") ||
        file.originalname.endsWith(".MPEG"))
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only supported video files are allowed!"), false);
    }
  },
});
const uploads = upload.single("file");

routes.post("/uploadvideo", async (req, res) => {
  try {
    uploads(req, res, async (err) => {
      if (err) {
        res.status(500).send({
          message: "Only supported VIDEO files are allowed!",
          sucess: false,
        });
      } else {
        if (req.file == undefined) {
          return res.status(400).send({ message: "Please upload a file!" });
        }
        const { path } = req.file;
        console.log(req.file);
        let content = req.body.content;
        const data = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "video",
          // folder: "videos",
        });
        let query = data.secure_url;
        const image = new Video({
          cloudinary_url: query,

          filePath: path,
          content: content,
        });
        await image.save();
        res.status(200).send({ message: "Video uploaded!", sucess: true });
      }
    });
  } catch (err) {
    res.status(500).send({ erorr: err.message });
  }
});

routes.delete("/videodeleteone/:id", async (req, res) => {
  try {
    const id = { _id: req.params.id };

    const findvideo = await Video.findById(id);

    if (findvideo) {
      const filepath = findvideo.filePath;
      const cloudinaryUrl = findvideo.cloudinary_url;
      await Video.findByIdAndDelete(id);
      const publicIdRegex = /\/v\d+\/([^/]+)_(\w+)(?:\.\w+)?/;
      const matches = cloudinaryUrl.match(publicIdRegex);
      if (matches && matches[1] && matches[2]) {
        const publicId = `${matches[1]}_${matches[2]}`;

        cloudinary.uploader.destroy(
          publicId,
          {
            type: "upload",
            resource_type: "video",
          },
          (error, result) => {
            if (error) {
              console.error(error);
              return res.status(500).json({ message: "Error deleting video" });
            }
            console.log("Cloudinary response:", result);
            //res.status(200).json({ message: "Video deleted successfully" });
          }
        );
      } else {
        console.log("Public ID not found in the URL.");
        // res.status(400).json({ message: "Invalid Cloudinary URL" });
      }

      fs.unlink(filepath, (err) => {
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
routes.delete("/videodeleteall", async (req, res) => {
  try {
    const deleteone1 = await Video.deleteMany({});
    res.status(201).send({ message: "Deleted Sucessfully!" });
  } catch (err) {
    res.status(500).send({ erorr: err.message });
  }
});

routes.put("/videoupdateone/:id", upload.single("file"), async (req, res) => {
  try {
    const id = req.params.id;
    const { path } = req.file;
    const content = req.body.content;
    const heading = req.body.heading;

    const currentproduct = await Video.findById(id);

    if (!currentproduct) {
      return res.status(404).send({ message: "Image not found!" });
    }

    const cloudinaryUrl = currentproduct.cloudinary_url;

    if (cloudinaryUrl) {
      const publicIdRegex = /\/v\d+\/([^/]+)_(\w+)(?:\.\w+)?/;
      const matches = cloudinaryUrl.match(publicIdRegex);

      if (matches && matches[1] && matches[2]) {
        const publicId = `${matches[1]}_${matches[2]}`;
        console.log(publicId, "__________________old public id");
        await cloudinary.uploader.destroy(publicId, {
          type: "upload",
          resource_type: "image",
        });

        const updateimage = await cloudinary.uploader.upload(path, {
          resource_type: "image",
        });

        const newcloudinaryUrl = updateimage.secure_url;
        console.log(newcloudinaryUrl);
        const publicIdRegex1 = /\/v\d+\/([^/]+)_(\w+)(?:\.\w+)?/;
        const newMatches = newcloudinaryUrl?.match(publicIdRegex1);
        if (newMatches && newMatches[1] && newMatches[2]) {
          const newpublicId = `${newMatches[1]}_${newMatches[2]}`;
          console.log(newpublicId, " + _____________________new public_id ");
          const updatedImage = await Video.findByIdAndUpdate(
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
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

module.exports = routes;
