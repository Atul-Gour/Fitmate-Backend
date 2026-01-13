import { UserData } from "../Mongoose/Schemas/localUserDataSchema.mjs";
import { getCoordinates } from "../helper/getCoordinates.mjs";
import { User } from "../Mongoose/Schemas/localUserSchema.mjs";
import { hashPassword } from "../helper/forPassword.mjs";
import passport from "passport";

import { uploadProfile } from "../config/cloudinaryConfig.mjs";

import { Router } from "express";
const router = Router();

export function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "You must be logged in" });
}

router.get("/auth/me", isAuthenticated, (req, res) => {
  try {
    res.status(200).json({ userId: req.user.id });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});


router.post("/auth/signup", async (req, res) => {
  const { name, email, username, password: rawPassword } = req.body;

  const password = rawPassword !== undefined && rawPassword !== null
    ? String(rawPassword)
    : "";
  
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  console.log("RAW PASSWORD:", rawPassword);
  console.log("RAW PASSWORD TYPE:", typeof rawPassword);
  console.log("FINAL PASSWORD:", password);
  console.log("FINAL PASSWORD TYPE:", typeof password);


  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already used" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already used" });
      }
    }

    const hashedPass = hashPassword(password);
    const newUser = new User({ name, email, username, password: hashedPass });
    await newUser.save();

    req.login(newUser, (err) => {
      if (err) return res.status(500).json({ message: "Login failed" });
      res.status(201).json({ message: "User registered and logged in" });
    });
  } catch (err) {
    if (err.code === 11000)
      return res
        .status(400)
        .json({ message: `${Object.keys(err.keyValue)[0]} is already used` });
    else if (err.name === "ValidationError")
      return res.status(400).json({
        message: `${Object.values(err.errors)[0].path} should be ${Object.values(err.errors)[0].kind}`,
      });
    else return res.status(400).json({ message: "User registration failed" });
  }
});


router.post("/auth/signup/check", async (req, res) => {
  const { email, username } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already used" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already used" });
      }
    }
    return res.status(200).json({ message: "OK" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/auth/signup/data",
  isAuthenticated,
  uploadProfile.single("profileImage"),
  async (req, res) => {
    try {
      const { height, weight, age, houseNo, area, city, state, sports } = req.body;

      const fullAddress = `${houseNo}, ${area}, ${city}, ${state}, India`;
      const geo = await getCoordinates(fullAddress);

      const userId = req.user.id;

      const userData = new UserData({
        userId,
        height,
        weight,
        age,
        address: {
          fullAddress,
          houseNo,
          area,
          city,
          state,
          coordinates: {
            lat: geo?.lat,
            lon: geo?.lon,
            mapLink: geo?.mapLink,
          },
        },
        sports: JSON.parse(sports || "[]").filter(Boolean),
        profileImage: req.file ? req.file.path : undefined,
      });

      await userData.save();
      res.status(201).json({ message: "Profile data saved successfully!" });
    } catch (err) {
      console.error(err);
      if (err.code === 11000)
        return res.status(400).json({ message: `${Object.keys(err.keyValue)[0]} is already used` });
      else if (err.name === "ValidationError")
        return res
          .status(400)
          .json({ message: `${Object.values(err.errors)[0].path} should be ${Object.values(err.errors)[0].kind}` });
      else return res.status(500).json({ message: "Problem occurred while saving the user data" });
    }
  }
);


router.get("/auth/signout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);

    req.session.destroy((err) => {
      if (err) {
        console.error("Failed to destroy session:", err);
        return res.status(500).json({ message: "Logout failed" });
      }

      res.clearCookie("connect.sid"); 
      return res.status(200).json({ message: "User logged out and session deleted" });
    });
  });
});

router.post("/auth/signin", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return res.status(500).json({ message: "Signin error" });
    if (!user) return res.status(401).json({ message: info.message }); // <-- custom message
    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: "Login failed" });
      return res.status(200).json({ message: "User signed in successfully" });
    });
  })(req, res, next);
});






export default router;
