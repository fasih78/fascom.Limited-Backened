const util = require("util");
const multer = require("multer");
const maxSize = 2 * 1024 * 1024;
const path = require("path");

let storage = multer.diskStorage({
  destination: "uploads",
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
    console.log(file.originalname);
  },
});

let uploadFile = multer({
  cloudinary: storage,
  limits: { fileSize:  1024 * 1024  },
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;
