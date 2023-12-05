const routes = require("express").Router();
const multer = require("multer");
const path = require("path");
const Product = require("./productmodel.js");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const fs = require("fs");
require("dotenv").config();
const Auth_user =require('../Authorized_jwt.js')

cloudinary.config({
  cloud_name: process.env.AUTH_CLOUD_NAME,
  api_key: process.env.AUTH_API_KEY,
  api_secret: process.env.AUTH_API_SECRET,
});

routes.use(bodyParser.json());

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

routes.post("/uploadimage/productinsight",Auth_user, async (req, res) => {
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
          const image = new Product({
            cloudinary_url: query,
            public_id: publicId,
            filePath: path,
            content: content,
            heading: Heading,
          });
          await image.save();
          res
            .status(200)
            .send({ message: "Blog Uploaded Sucessfully!!", sucess: true });
        } else {
          console.log("Public ID not found in the URL.");
        }
      }
    });
  } catch (err) {
    res.status(500).send({ erorr: err.message });
  }
});

routes.get("/view/product_insight/getthree", async (req, res) => {
  try {
    const Latestrecord = await Product.find().sort({ createdAt: -1 }).limit(3);

    res.status(201).send({ data: { Latestrecord }, sucess: true });
  } catch (err) {
    res.status(500).send({ erorr: err.message });
  }
});

routes.get("/getsubimage/productInsight", async (req, res) => {
  try {
    const getimages = await Product.find();
    res.status(201).send({ data: { getimages }, sucess: true });
  } catch (err) {
    res.status(500).send({ erorr: err.message });
  }
});

routes.get("/view/productinsight/getone/:id", async (req, res) => {
  try {
    const id = { _id: req.params.id };
    const findone1 = await Product.findById(id);
    res.status(200).send({ sucess: true, data: { findone1 } });
  } catch (error) {
    res.status(500).send({ erorr: err.message });
  }
});

routes.delete("/productinsight/deleteall",Auth_user, async (req, res) => {
  try {
    const deleteone1 = await Product.deleteMany({});
    res.status(201).send({ message: "Deleted Sucessfully!" });
  } catch (err) {
    res.status(500).send({ erorr: err.message });
  }
});

routes.delete("/deleteone/productinsight/:id",Auth_user, async (req, res) => {
  try {
    const id = { _id: req.params.id };

    const findproduct = await Product.findById(id);
    console.log();
    if (findproduct) {
      const filePath = findproduct.filePath;
      const cloudinaryUrl = findproduct.cloudinary_url;
      await Product.findByIdAndDelete(id);
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
      //
    }
    return res.status(200).send({ message: "Blog  Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error" });
  }
});

routes.put(
  "/productinsight/update/:id",
  upload.single("file"),Auth_user,
  async (req, res) => {
    try {
      const id = { _id: req.params.id };
      const path = req.body.file;

      const content = req.body.content;
      const heading = req.body.heading;
      if (path !== undefined) {
        const currentproduct = await Product.findById(id);

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

            const updatedImage = await Product.findByIdAndUpdate(
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
        const currentproduct = await Product.findById(id);

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

            const updateimage = await cloudinary.uploader.upload(
              req.file.path,
              {
                resource_type: "image",
              }
            );

            const newcloudinaryUrl = updateimage.secure_url;
            console.log(newcloudinaryUrl);
            const publicIdRegex1 = /\/v\d+\/([^/]+)_(\w+)(?:\.\w+)?/;
            const newMatches = newcloudinaryUrl?.match(publicIdRegex1);
            if (newMatches && newMatches[1] && newMatches[2]) {
              const newpublicId = `${newMatches[1]}_${newMatches[2]}`;

              const updatedImage = await Product.findByIdAndUpdate(
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
  }
);
routes.get("/countdocument/product", async (req, res) => {
  try {
    const records = await Product.countDocuments();
    res.status(200).send({ records: records, success: true });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = routes;
