const mongoose = require("mongoose");

const VidoeCore = new mongoose.Schema({
  filePath: String,
  content: String,
  cloudinary_url: String,
  content: String,
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

const Video = mongoose.model("VIDEO", VidoeCore);

module.exports = Video;
