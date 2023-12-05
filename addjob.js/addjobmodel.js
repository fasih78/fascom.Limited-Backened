const mongoose = require("mongoose");

const AddJobCore = new mongoose.Schema({
  id: { type: Number, default: 0 },
  selectcareer: { type: String, required: true },
  experience: { type: String, required: true },
  Date: { type: Date },
  details: { type: String, required: true },
  city: { type: String, required: true },
  work: { type: String, required: true },
});

const AddJobModel = mongoose.model("ADDJOB", AddJobCore);
module.exports = AddJobModel;
