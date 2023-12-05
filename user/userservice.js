const UserModel = require("./usermodel.js");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const validator = require("validator");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");
const Auth_user = require("../Authorized_jwt.js");
const authenticateToken = require("../Authorized_jwt.js");
const crypto = require("crypto");

var transporter = nodemailer.createTransport({
  service: "outlook",
  auth: {
    user: process.env.AUTH_USERNAME,
    pass: process.env.AUTH_PASSWORD,
  },
});
const UserSignUp = async (req, reply) => {
  try {
    const { name, email, password } = req.body;

    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);

    const userExists = await UserModel.findOne({ email: email });
    const validation = validator.isEmail(email);

    if (userExists) {
      return reply.status(404).send({ message: "User Already Exists!" });
    } else if (!validation) {
      return reply.status(400).send({ message: "Invalid Email!" });
    }

    const LastUser = await UserModel.findOne().sort({ _id: -1 }).exec();
    const id = LastUser ? LastUser.id + 1 : 1;

    const token = jwt.sign({ email: email }, process.env.JWT_SECRET_KEY, {
      expiresIn: "365d",
    });
    try {
      const newUser = await UserModel.create({
        id: id,
        name: name,
        email: email,
        password: hash,
        salt: salt,
      });
      await newUser.save();
      return reply.status(201).send({
        success: true,
        message: "SignUp Successfully!",
        data: newUser,
        token: token,
      });
    } catch (error) {
      reply.status(500).send({ error: "An error occurred" });
    }
  } catch (error) {
    return reply.status(500).send({ error: error.message });
  }
};

const UserLogin = async (req, reply) => {
  try {
    const { email, password } = req.body;
    const findemail = await UserModel.findOne({ email: email });
    console.log(findemail);
    if (findemail) {
      const hash = findemail.password;
      const passwordcompared = await bcrypt.compare(password, hash);
      console.log(passwordcompared);
      if (passwordcompared) {
        const findpassword = await UserModel.findOne({
          password: passwordcompared,
        }).exec();
        const token = jwt.sign({ email: email }, process.env.JWT_SECRET_KEY, {
          expiresIn: "1d",
        });
        const date = new Date();
        const info = await transporter.sendMail({
          pool: true,
          from: "career@fascom.com", // sender address
          to: `${email}`, // list of receivers
          subject: "Dear Admin !✔", // Subject line
          text: `welcome to fascom limited
            You are logged on to Fascom Limited on ${date}
          Best Wishes!,
            
           Fascom Limited Auto Responder `,
        });

        return reply.status(200).send({
          success: true,
          message: "Login Successfully!",
          token: token,
        });
      } else {
        return reply.send("Wrong Password!");
      }
    } else {
      return reply.send("Invalid Email Address!");
    }
  } catch (err) {
    return reply.status(500).send({ error: err.message });
  }
};

// const revokedToken  = async(req,res)=>{

// try {
//     const token = req.header('Authorization');
//     revokedTokens.add(token);
//     res.status(200).send({message:'logout SUCESSFULLY!'})

// } catch (err) {
//     return reply.status(500).send({ error: err.message });

// }

// }

const UserCreateone = async (request, reply) => {
  try {
    let id = { _id: request.params.id };
    console.log(id);
    const finddd = await UserModel.findById(id);
    console.log(finddd);
    return finddd;
  } catch (error) {
    return reply.code(500).send({ error: error.message });
  }
};
function generateRandomToken(length) {
  return crypto.randomBytes(length).toString("hex");
}
let Tokens = generateRandomToken(2);

const forget_password = async (req, res) => {
  try {
    const { email } = req.body;

    const userExists = await UserModel.findOne({ email: email });

    if (!userExists) {
      return res.status(404).send({ message: "User not Exists!" });
    }
    const randomToken = Tokens;
    console.log(randomToken);

    const info = await transporter.sendMail({
      pool: true,
      from: "career@fascom.com", // sender address
      to: `${email}`, // list of receivers
      subject: "Dear Admin !✔", // Subject line

      html: `
    <p>We received a request to reset the password for your account associated with this email address.</p>
   <p>email: ${email}<p>
    <p> verification token   ${randomToken} <p> 
    <p>If you didn't request this password reset, you can safely ignore this email. Your account's security is important to us.</p>
    <p>Thank you for using our service.</p>
    <p>Sincerely,</p>
    <p>The Fascom Team</p>       `,
    });

    return res.status(200).send({ email: email, generateToken: randomToken });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const verify_token = async (req, res) => {
  try {
    const { verifytoken } = req.body;
    let token = Tokens;

    if (token === verifytoken) {
      return res.status(200).send({ message: "Verification Complete!" });
    } else {
      res.status(404).send({ message: "Invalid token!" });
    }
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
};
const new_passwordupdate = async (req, res) => {
  try {
    const { newpassword, confirmpassword } = req.body;
    if (newpassword === confirmpassword) {
      if (newpassword.length < 8) {
        return res
          .status(400)
          .send({ message: "Password must at least 8 character!" });
      } else {
        const specialCharacterRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;
        if (!specialCharacterRegex.test(newpassword)) {
          return res
            .status(400)
            .send({ message: "Password must have one Special character!" });
        } else {
          const salt = bcrypt.genSaltSync(saltRounds);
          const hash2 = bcrypt.hashSync(newpassword, salt);
          const updatepassword = await UserModel.updateMany({
            password: hash2,
            salt: salt,
          });
          const info = await transporter.sendMail({
            pool: true,
            from: "career@fascom.com", // sender address
            to: "contact@fascom.com", // list of receivers
            subject: "Dear Admin !✔", // Subject line

            html: `
            <p>Dear Admin!,</p>
            <p>Your password has been successfully changed for your account associated with this email address.</p>
            <p>If you made this change, you can safely ignore this email.</p>
            <p>If you didn't request this password change, please <a href="https://www.fascom.com/contact.html ">contact us</a> immediately.</p>
            <p>Thank you for using our service.</p>
            <p>Sincerely,</p>
            <p>The Fascom Team</p>     `,
          });

          return res
            .status(200)
            .send({ message: "Password has been changed Sucessfully!" });
        }
      }
    } else {
      res.status(404).send({ message: "Password could not match!" });
    }
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const user_ResetPassword = async (req, reply) => {
  try {
    const { email, password, newpassword } = req.body;

    const userExists = await UserModel.findOne({ email: email });

    if (!userExists) {
      return reply.status(404).send({ message: "User not Exists!" });
    }

    const hash = userExists.password;
    const passwordcompared = await bcrypt.compare(password, hash);

    if (passwordcompared === false) {
      return reply.status(400).send("Incorrect password!");
    }

    const validation = validator.isEmail(email);

    if (!validation) {
      return reply.status(400).send({ message: "Invalid Email!" });
    }

    const salt = bcrypt.genSaltSync(saltRounds);
    const hash2 = bcrypt.hashSync(newpassword, salt);
    const updatepassword = await UserModel.updateMany(
      {
        email: email,
      },
      {
        password: hash2,
        salt: salt,
      }
    );

    return reply.status(201).send("Your Password Reset Successfully!");
  } catch (error) {
    return reply.status(500).send(error);
  }
};

module.exports = {
  UserSignUp,
  UserLogin,
  UserCreateone,
  user_ResetPassword,
  forget_password,
  verify_token,
  new_passwordupdate,
};
