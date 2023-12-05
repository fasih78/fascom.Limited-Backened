const mongoose = require("mongoose");

const ImageCore = new mongoose.Schema({
  filePath: String,
  content: String,
  cloudinary_url: String,
  content: { type: String, required: true },
  heading: { type: String, required: true },
  public_id: { type: String, default: 0 },
  Date: { type: Date },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

const Image = mongoose.model("IMAGE", ImageCore);

module.exports = Image;
