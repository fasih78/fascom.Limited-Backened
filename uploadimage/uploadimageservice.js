const routes = require("express").Router();
const multer = require("multer");
const path = require("path");
const Image = require("./uploadimagemodel.js");
const Life = require("../life_at_now/lifemodel.js");
const Company = require("../companynews/companymodel.js");
const ProductModel = require("../product _insight/productmodel.js");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const fs = require("fs");
const { error } = require("console");
const moment = require("moment/moment.js");
const { model } = require("mongoose");
const Auth_user = require("../Authorized_jwt.js");
//const Company = require("../companynews/companymodel.js");
const models = [
  { name: "Image", model: require("../uploadimage/uploadimagemodel") },
  { name: "Life", model: require("../life_at_now/lifemodel") },
  {
    name: "ProductModel",
    model: require("../product _insight/productmodel.js"),
  },
  { name: "Company", model: require("../companynews/companymodel") },
];

routes.use(bodyParser.json());

require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.AUTH_CLOUD_NAME,
  api_key: process.env.AUTH_API_KEY,
  api_secret: process.env.AUTH_API_SECRET,
  cloudinary_url: process.env.AUTH_CLOUD_URL,
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

routes.post("/create/latest", Auth_user, async (req, res) => {
  try {
    uploads(req, res, async (err) => {
      if (err) {
        res.status(500).send({
          message: "Only Supported Image Files Are Allowed!",
          sucess: false,
        });
      } else {
        if (req.file == undefined) {
          return res.status(400).send({ message: "Please Upload A File!" });
        }
        const { path } = req.file;
        console.log(req.file);
        let content = req.body.content;
        let Heading = req.body.heading;
        try {
          const data = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "image",
          });
          const cloudinaryUrl = data.secure_url;
          const publicIdRegex = /\/v\d+\/([^/]+)_(\w+)(?:\.\w+)?/;
          const matches = cloudinaryUrl.match(publicIdRegex);
          if (matches && matches[1] && matches[2]) {
            const publicId = `${matches[1]}_${matches[2]}`;
            let query = data.secure_url;
            const image = new Image({
              cloudinary_url: query,
              public_id: publicId,
              filePath: path,
              content: content,
              heading: Heading,
              Date: moment(new Date()).format("YYYY-MM-DD"),
            });
            await image.save();
            console.log("Public ID:", publicId);
          } else {
            console.log("Public ID not found in the URL.");
          }
        } catch (err) {
          res.status(500).send({ error: err.message });
          console.log(err);
        }
        res
          .status(200)
          .send({ message: "Blog Uploaded Sucessfully!", sucess: true });
      }
    });
  } catch (err) {
    res.status(500).send({ erorr: err.message });
  }
});

routes.get("/view/latest/getthree", async (req, res) => {
  try {
    const Latestrecord = await Image.find().sort({ createdAt: -1 }).limit(3);

    res.status(201).send({ data: { Latestrecord }, sucess: true });
  } catch (err) {
    res.status(500).send({ erorr: err.message });
  }
});

routes.get("/view/latest/getall", async (req, res) => {
  try {
    const getimages = await Image.find();
    res.status(201).send({ data: { getimages }, sucess: true });
  } catch (err) {
    res.status(500).send({ erorr: err.message });
  }
});

routes.get("/view/latest/getone/:id", async (req, res) => {
  try {
    const id = { _id: req.params.id };
    console.log(id);
    const findone1 = await Image.findById(id);
    return res.status(200).send({ sucess: true, data: { findone1 } });
  } catch (error) {
    res.status(500).send({ erorr: err.message });
  }
});

routes.delete("/deleteall/latest", Auth_user, async (req, res) => {
  try {
    const deleteone1 = await Image.deleteMany({});
    res.status(201).send({ message: "All Image Are  Deleted Sucessfully!" });
  } catch (err) {
    res.status(500).send({ erorr: err.message });
  }
});

routes.delete("/deleteone/latest/:id", Auth_user, async (req, res) => {
  try {
    const id = { _id: req.params.id };

    const findcv = await Image.findById(id);

    if (findcv) {
      const filePath = findcv.filePath;
      const cloudinaryUrl = findcv.cloudinary_url;
      await Image.findByIdAndDelete(id);
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
      //     res.status(200).send({ message: "Image  Deleted successfully" });
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

// routes.put("/imageupdate/:id", upload.single("file"),async (req, res) => {
//     try {
//  let secure_url
//       const id = req.params.id;

//       const { originalname, filename, path } = req.file;
//       const content = req.body.content;

//       const currentproduct = await Image.findById(id);

//       console.log(currentproduct);
//       if(currentproduct == undefined){
//       res.status(404).send({message:' Imge not found!'})
//       }
//       const cloudinaryUrl = currentproduct.cloudinary_url;
//       const publicIdRegex = /\/v\d+\/([^/]+)_(\w+)(?:\.\w+)?/;
//       const matches = cloudinaryUrl.match(publicIdRegex);
//       if (matches && matches[1] && matches[2] && currentproduct) {
//         const publicId = `${matches[1]}_${matches[2]}`;

//         cloudinary.uploader.destroy([publicId], {
//           type: "upload",
//           resource_type: "image",
//         });
//         console.log("Public ID:", publicId);
//         const updateimage = await cloudinary.uploader.upload(req.file.path, {
//           resource_type: "image",
//         });
//         const newcloudinaryUrl = updateimage.cloudinary_url
//         const publicIdRegex = /\/v\d+\/([^/]+)_(\w+)(?:\.\w+)?/;
//         const matches = newcloudinaryUrl.match(publicIdRegex);
//         if (matches && matches[1] && matches[2]) {
//           const newpublicId = `${matches[1]}_${matches[2]}`;

//         const newclouudinaryurl =updateimage.secure_url
//         const updatedImage = await Image.findByIdAndUpdate(
//           id,
//           {
//             originalName: originalname,
//             fileName: filename,
//             filePath: path,
//             content: content,
//             public_id:newpublicId,
//             cloudinary_url:newclouudinaryurl,
//           },
//           { new: true }
//           ).exec();

//         } else {
//           console.log("Public ID not found in the URL.");
//         }
//     // Find the image by ID and update its URL and content

//       res.status(201).send({
//         message: "Image was Updated Successfully!",
//         success: true,
//         data: { updateimage },
//       });
//     } else{
// res.status(404).send({message:'image not found!'})
//     }
//   }catch (err) {
//       res.status(500).send({ error: err.message });
//     }
//   }
//   );

routes.put(
  "/update/latest/:id",
  Auth_user,
  upload.single("file"),
  async (req, res) => {
    try {
      const id = { _id: req.params.id };
      const path = req.body.file;

      const content = req.body.content;
      const heading = req.body.heading;
      if (path !== undefined) {
        const currentproduct = await Image.findById(id);

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

            const updatedImage = await Image.findByIdAndUpdate(
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
        const currentproduct = await Image.findById(id);

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

              const updatedImage = await Image.findByIdAndUpdate(
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

routes.get("/countdocument/latest", async (req, res) => {
  try {
    const records = await Image.countDocuments();
    res.status(200).send({ records: records, success: true });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

routes.get("/autoblogyear", async (req, reply) => {
  try {
    const year = moment(Date.now()).format("YYYY");

    console.log(year);
    reply.status(201).send({ year: year });
  } catch (error) {
    reply.status(500).send({ erorr: err.message });
  }
});

routes.post("/blogs/:year", async (req, reply) => {
  try {
    const { year } = req.params;
    console.log(year);
    if (!year || isNaN(year)) {
      return reply.status(400).send({ error: "Invalid year value" });
    }

    const year1 = {
      createdAt: {
        $gte: moment(year).startOf("year").toDate(),
        $lte: moment(year).endOf("year").toDate(),
      },
    };

    const latest = await Image.find(year1);
    const extractedDatalatest = latest.map((item) => ({
      _id: item._id,
      heading: item.heading,
      cloudinary_url: item.cloudinary_url,
      Date: item.Date,
    }));
    const productinsight = await ProductModel.find(year1);
    const extractedDataproduct = productinsight.map((item) => ({
      _id: item._id,
      heading: item.heading,
      cloudinary_url: item.cloudinary_url,
      Date: item.Date,
    }));
    const lifeatnow = await Life.find(year1);
    const extractedDatalife = lifeatnow.map((item) => ({
      _id: item._id,
      heading: item.heading,
      cloudinary_url: item.cloudinary_url,
      Date: item.Date,
    }));
    const company = await Company.find(year1);
    const extractedDatacompany = company.map((item) => ({
      _id: item._id,
      heading: item.heading,
      cloudinary_url: item.cloudinary_url,
      Date: item.Date,
    }));
    return reply.status(200).send({
      Latest: { extractedDatalatest },
      productinsight: { extractedDataproduct },
      lifeatnow: { extractedDatalife },
      company: { extractedDatacompany },
    });
  } catch (error) {
    console.error("Error:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
});

routes.get("/latest/allBlogs", async (req, res) => {
  try {
    const latestImages = await Image.find().sort({ createdAt: -1 }).limit(3);

    const latestProductModels = await ProductModel.find().sort({
      createdAt: -1,
    });

    const latestLifeRecords = await Life.find().sort({ createdAt: -1 });

    const latestCompanyRecords = await Company.find().sort({ createdAt: -1 });

    res.status(200).json({
      data: {
        latestImages,
        latestProductModels,
        latestLifeRecords,
        latestCompanyRecords,
      },
      success: true,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// routes.get("/blogs2023/getone/:id", async (req, res) => {
//   try {
//     const id = { _id: req.params.id };

//     if (!id) {
//       res.status(404).send({ message: "pleasse not found!" });
//     }

//     if (id) {
//       const latest = await Image.findById(id);
//       res.status(200).send({ latest: latest });
//     } else if (id) {
//       const latest = await Life.findById(id);
//       res.status(200).send({ Life: latest });
//     } else if (id) {
//       const latest = await ProductModel.findById(id);
//       res.status(200).send({ product_insight: latest });
//     } else if (id) {
//       const latest = await Company.findById(id);
//       res.status(200).send({ Companynews: latest });
//     } else {
//       res.status(404).send({ message: "no Record found in  modules" });
//     }
//   } catch (err) {
//     res.status(500).send({ error: err.message });
//   }
// });

routes.get("/blogsyear/getone/:id", async (req, res) => {
  const id = req.params.id;

  try {
    if (!models) {
      return res.status(404).send({ message: "Model not found!" });
    }
    let Record;
    for (let i = 0; i < models.length; i++) {
      Record = {};

      Record = await models[i].model.findById(id);

      if (Record) {
        break;
      }
    }

    if (!Record) {
      res.status(404).send({ message: "No record found!" });
    } else {
      res.status(200).send({ Record });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

module.exports = routes;
