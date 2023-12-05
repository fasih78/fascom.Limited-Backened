const mongoose = require("mongoose");

const subscribeschema = new mongoose.Schema({
  id: { type: Number },

  email: { type: String, unique: true, required: ["email must be required"] },
});

let Subscribe = mongoose.model("Subscribe", subscribeschema);

module.exports = Subscribe;
