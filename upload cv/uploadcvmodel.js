const mongoose = require("mongoose");

const CvCore = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  experience: { type: String, required: true },
  selectcareer: { type: String, required: true },
  coverletter: { type: String, required: true },
  mobile: { type: Number, required: true },
  cloudinary_url: { type: String },
  originalName: String,
  fileName: String,
  filePath: String,
});

const CvModel = mongoose.model("CV FILES", CvCore);
module.exports = CvModel;
