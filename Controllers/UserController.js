const User = require("../Models/UserForm");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const secretKey = "arunramasamy46";

async function generateToken(user) {
  const payload = { userId: user._id };
  const options = { expiresIn: "1h" }; // Token expires in 1 hour
  return jwt.sign(payload, secretKey, options);
}

async function registerUser(req, res) {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists with email:", email);
      return res.status(409).send({ message: "User already exists" });
    }

    if (!password) {
      console.log("Password is required");
      return res.status(400).send({ message: "Password is required" });
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
    });

    await newUser.save();

    return res.status(201).send({ message: "User Registered Successfully" });
  } catch (error) {
    console.error("Error Occurred: " + error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      console.log("Unregistered User");
      return res.status(404).send({ message: "User not found" });
    }

    if (password !== existingUser.password) {
      console.log("Incorrect password");
      return res.status(401).send({ message: "Incorrect password" });
    }

    const token = await generateToken(existingUser);
    console.log(token);
    return res.status(200).send({ message: "User Logged Successfully", token });
  } catch (error) {
    console.error("Error Occurred" + " " + error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      console.log("Not a user");
      return res.status(404).send({ message: "User not found" });
    }

    const token = Math.random().toString(36).slice(-8);

    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "arunramasamy46@gmail.com",
        pass: "pruxtxnekznczdpc",
      },
    });

    const mailOptions = {
      from: "arunramasamy46@gmail.com", // Replace with your Gmail email
      to: user.email,
      subject: "Reset Your Comfort Path Password",
      html: `
    <h1>Hello ${user.firstName},</h1>
    <p>We noticed that you requested to reset your password for ARRA.</p>
    <p>Don't worry! Click the link below to securely reset your password:</p>
     <p>Reset Token:${token}</p>
    <a href="https://main--prismatic-hamster-004de0.netlify.app/resetPassword" style="background-color: #ff8c00; color: #fff; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Your Password</a>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>Thank you for shopping with ARRA!</p>
  `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res
          .status(500)
          .json({ error: "Failed to send reset password email" });
      }
      console.log("Email sent: " + info.response);
      return res.status(200).json({ message: "Reset password email sent" });
    });
  } catch (error) {
    console.error("Error Occurred" + " " + error);
    return res.status(501).send({ message: "Internal Server Error" });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({ passwordResetToken: token });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { registerUser, loginUser, forgotPassword, resetPassword };
