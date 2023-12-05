const express = require("express");
const { response, Router } = require("express");
const routes = require("express").Router();
const Auth_user = require("./Authorized_jwt");
const { contactform } = require("./contactform.js/contactfunction.js");
const { career } = require("./careerform.js/careerformfunction");
const { alldelete } = require("./contactform.js/contactfunction.js");
const {
  subscribe,
  SubscribeGetAll,
  SubscribeGetOne,
} = require("./subscribe/subscribefunction.js");
const { careerdelete } = require("./careerform.js/careerformfunction.js");
const {
  CreateAddJob,
  AddJobDeleteAll,
  AddJobDeleteOne,
  AddJobUpdate,
  AddJobFindAll,
  AddJobGetone,
} = require("./addjob.js/addjobservice.js");
const {
  UserSignUp,
  UserLogin,
  UserCreateone,
  user_ResetPassword,
  forget_password,
  verify_token,
  new_passwordupdate,
} = require("./user/userservice.js");
const uploadFile = require("./upload.js");
const cloudinary = require("cloudinary").v2;
//const File = require("./imageschema.js");
const emailvalidator = require("email-validator");
const nodemailer = require("nodemailer");
const multer = require("multer");
const uploadAndSendEmail = require("./uploadimage/uploadimageservice.js");
const { appendFile } = require("fs");
const authenticateToken = require("./revokedtoken_jwt");
// Configuration
cloudinary.config({
  cloud_name: "dqbe5yp68",
  api_key: "357831157624486",
  api_secret: "qrnSqoy22RhPIZ9HPbGjj5gKqjo",
});
routes.post("/contact", async (req, res) => {
  await contactform(req, res);
});

routes.post("/career", async (req, res) => {
  let result = await career(req, res);
});

routes.post("/subscribe", async (req, res) => {
  await subscribe(req, res);
});
routes.get("/test", async (req, res) => {
  return res.status(200).send({ message: "working" });
});
routes.get("/subscribegetall", async (req, res) => {
  await SubscribeGetAll(res);
});
routes.get("/subscribegetone/:id", async (req, res) => {
  await SubscribeGetOne(req, res);
});

routes.delete("/contactdelete", async (req, res) => {
  let deleteall = await alldelete();
  res.send(deleteall);
  console.log(deleteall);
});
routes.delete("/careerdelete", async (req, res) => {
  let deleteall = await careerdelete();
  res.send(deleteall);
  console.log(deleteall);
});
routes.post("/addjobcreate", Auth_user,async (req, res) => {
  await CreateAddJob(req, res);
});
routes.delete("/addjobdeleteall", async (req, res) => {
  await AddJobDeleteAll(res);
});

routes.delete("/addjobdeleteone/:id",Auth_user, async (req, res) => {
  await AddJobDeleteOne(req, res);
});

routes.put("/addjobupdate/:id",Auth_user, async (req, res) => {
  await AddJobUpdate(req, res);
});

routes.get("/addjobfind", async (req, res) => {
  await AddJobFindAll(res);
});

routes.get("/addjobgetone/:id", async (req, res) => {
  await AddJobGetone(req, res);
});

routes.post("/signup", async (req, res) => {
  await UserSignUp(req, res);
});

routes.post("/login", async (req, res) => {
  await UserLogin(req, res);
});
routes.post("/Resetpassword", async (req, res) => {
  await user_ResetPassword(req, res);
});
routes.post("/newpassword", async (req, res) => {
  await new_passwordupdate(req, res);
});

routes.post("/logout", authenticateToken, async (req, res) => {
  const revokedTokens = new Set();
  const token = req.header("Authorization");

  revokedTokens.add(token);

  return res.status(200).send({ message: "Logout Sucessfully!" });
});
routes.post("/forgetpassword", async (req, res) => {
  await forget_password(req, res);
});
routes.post("/verify", async (req, res) => {
  await verify_token(req, res);
});
// routes.post("/upload", async (req, res) => {
//   try {
//     await uploadFile(req, res);

//     let { profilePictureURL } = req;
//     let selectcareer = req.body.selectcareer;
//     let experience = req.body.experience;
//     let email = req.body.email;
//     let coverletter = req.body.coverletter;
//     let mobile = req.body.mobile;
//     let name = req.body.name;

//     //let user = await File({ secure_url });
//     var transporter = nodemailer.createTransport({
//       service: "outlook",
//       auth: {
//         user: "career@fascom.com",
//         pass: "Yog83087",
//       },
//     });
//     if (req.file == undefined) {
//       return res.status(400).send({ message: "Please upload a file!" });
//     }

//     //console.log("req.filereq.file", req.file.path);
//     const data = await cloudinary.uploader.upload(req.file.path);
//     let secure_url;
//     if (emailvalidator.validate(email)) {
//       // resImage.then(async (data) => {
//       secure_url = data.secure_url;
//       let query = data.secure_url;
//       // let user = new File({
//       //   profilePictureURL: query,
//       //   name: name,
//       //   selectcareer: selectcareer,
//       //   experience: experience,
//       //   email: email,
//       //   coverletter: coverletter,
//       //   mobile: mobile,
//       // });
//       // await user.save();

//       // });
//       console.log("secure_url", secure_url);
//       const info = await transporter.sendMail({
//         from: "career@fascom.com", // sender address
//         to: email, // list of receivers
//         subject: "Hello !✔", // Subject line
//         text: `welcome to fascom limited
//         name:${name},
//         experience:${experience},
//         coverletter:${coverletter},
//         `,
//         html: ` <p>Welcome to fascom limited</p>
//         <p>name: ${name}</p>
//         <p>career: ${selectcareer}</p>
//         <p>experience: ${experience}</p>
//         <p>mobile number: ${mobile}</p>
//         <p>email Address: ${email}</p>
//         <p>coverletter: ${coverletter}</p>
//         <p>file link: <a href="${secure_url}">${secure_url}</a></p>
//       `,
//       });
//       res.status(200).send({
//         message:
//           "Uploaded the file successfully & send email sucessfully! " +
//           req.file,
//       });
//     }

//     // .catch((err) => {
//     //   // console.log(err);
//     // });
//     //let user = await File( data.secure_url);
//     //await user.save();
//     else {
//       res.status(400).send({ message: "invalid email!" });
//     }
//   } catch (err) {
//     // console.log(err);
//     console.log(err);
//     if (err.code == "LIMIT_FILE_SIZE") {
//       return res.status(500).send({
//         message: "File size cannot be larger than 2MB!",
//       });
//     }

//     res.status(500).send({
//       message: `Could not upload the file: ${req.file}. ${err}`,
//     });
//   }
// });

// routes.delete("/cvuploaddeleteall", async (req, res) => {
//   try {
//     const deleyeall = await File.deleteMany();
//     res.status(200).send({ message: "all data delete sucessfully!" });
//   } catch (error) {
//     res.status(500).send({ erorr: err.message });
//   }
// });

const upload1 = async (req, res) => {
  try {
    await uploadFile(req, res);

    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

    res.status(200).send({
      message: "Uploaded the file successfully: " + req.file,
    });
  } catch (err) {
    console.log(err);

    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 2MB!",
      });
    }

    res.status(500).send({
      message: `Could not upload the file: ${req.file}. ${err}`,
    });
  }
};
routes.get("/getlist", async (req, res) => {
  const getListFiles = (req, res) => {
    // const directoryPath = __basedir + "uploads";
    const directoryPath = "uploads";
    fs.readdir(directoryPath, function (err, files) {
      if (err) {
        res.status(500).send({
          message: "Unable to scan files!",
        });
      }

      let fileInfos = [];

      files.forEach((file) => {
        fileInfos.push({
          name: file,
          url: baseUrl + file,
        });
      });

      res.status(200).send(fileInfos);
    });
  };
});
const download = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};

const remove = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  fs.unlink(directoryPath + fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not delete the file. " + err,
      });
    }

    res.status(200).send({
      message: "File is deleted.",
    });
  });
};

const removeSync = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  try {
    fs.unlinkSync(directoryPath + fileName);

    res.status(200).send({
      message: "File is deleted.",
    });
  } catch (err) {
    res.status(500).send({
      message: "Could not delete the file. " + err,
    });
  }
};

module.exports = routes;
