const mongoose = require("mongoose");

const ProductCore = new mongoose.Schema({
  filePath: String,
  content: String,
  cloudinary_url: String,
  content: { type: String, required: true },
  heading: { type: String, required: true },
  Date: { type: Date, default: Date.now() },
  public_id: { type: String, default: 0 },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

const Product = mongoose.model("PRODUCT_INSIGHT", ProductCore);

module.exports = Product;
