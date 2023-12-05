const express = require("express");
const morgan = require("morgan");
const app = express();
const port = 2000;
const connectDB = require("./dbconnect.js");
//const server = require ('./server.js')
const contactform = require("./AppController.js");
const careerform = require("./AppController.js");
const contactdelete = require("./AppController.js");
const careerdelete = require("./AppController.js");

const getfile = require("./AppController");
const subscribe = require("./AppController.js");
const uploadimagelatest = require("./uploadimage/uploadimageservice.js");
const uploadcompanynews = require("./companynews/companyservice.js");
const addjobcreate = require("./AppController.js");
const uploadcv = require("./upload cv/uploadcvservice.js");
const uploadvideo = require("./uploadvideo/uploadvideoservice.js");
const uploadproductinsight = require("./product _insight/productservice.js");
const uploadlifeatnow = require("./life_at_now/lifeservice.js");
const user = require("./AppController.js");
const logout  =require ('./AppController.js')
const cors = require("cors");
const bodyParser = require('body-parser');


require("dotenv").config();
app.use(bodyParser.json());

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.use("/", contactform);
app.use("/", subscribe);
app.use("/", careerform);
app.use("/", contactdelete);
app.use("/", careerdelete);
app.use("/", getfile);
app.use("/", uploadimagelatest);
app.use("/", addjobcreate);
app.use("/", uploadcv);
app.use("/", uploadvideo);
app.use("/", uploadcompanynews);
app.use("/", uploadproductinsight);
app.use("/", uploadlifeatnow);
app.use("/", user);
app.use("/",logout)
connectDB();

const server = app.listen(process.env.NODE_PORT, () => {
  console.log("Server is running on port: " + process.env.NODE_PORT);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // You can add additional error handling or graceful shutdown logic here
});

process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  server.close(() => {
    console.log("Server has closed.");
    process.exit(0);
  });
});
