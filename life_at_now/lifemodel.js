const mongoose = require("mongoose");

const LifeCore = new mongoose.Schema({
  filePath: String,
  content: String,
  cloudinary_url: String,
  content: { type: String, required: true },
  heading: { type: String, required: true },
  public_id: { type: String, default: 0 },
  Date: { type: Date, default: Date.now() },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

const Life = mongoose.model("LIFE_AT_NOW", LifeCore);

module.exports = Life;
