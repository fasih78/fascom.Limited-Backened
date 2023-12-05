const { default: mongoose, model } = require("mongoose");

const careerschema = new mongoose.Schema({
  selectcarrer: { type: String },
  experience: { type: String },
  name: { type: String },
  email: {
    type: String,
    unique: true,
    required: [true, "email address required"],
  },
  //   moblileno: {
  //     type: Number,

  //     // match: '/^(\()?\d{3}(\))?(-|\s)?\d{3}(-|\s)\d{4}$/' },
  //   },
  coverletter: {
    type: String,
  },
  mobile: {
    type: Number,
  },
  //path: { type: String },
});

let Career = mongoose.model("CAREER", careerschema);

module.exports = Career;
