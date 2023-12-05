const mongoose = require("mongoose");

const CompanyCore = new mongoose.Schema({
  filePath: String,
  content: String,
  cloudinary_url: String,
  public_id: { type: String, default: 0 },
  content: { type: String, required: true },
  heading: { type: String, required: true },
  Date: { type: Date, default: Date.now() },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

const Company = mongoose.model("COMPANY_NEWS", CompanyCore);

module.exports = Company;
