// scripts/createSuperadmin.js

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const MONGO_URI = process.env.MONGO_URI;

async function createSuperadmin() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existing = await User.findOne({ role: "superadmin" });
    if (existing) {
      console.log("Superadmin already exists:", existing.email);
      process.exit(0);
    }

    const password = "superadmin@123";
    const passwordHash = await bcrypt.hash(password, 10);

    const superadmin = new User({
      name: "Super Admin",
      email: "superadmin@gmail.com",
      passwordHash,
      knowpassword: password,
      role: "superadmin",
      verified: true,
    });

    await superadmin.save();

    console.log("Superadmin created with email:", superadmin.email);
    console.log("Use this email and password to login.");

    process.exit(0);
  } catch (error) {
    console.error("Error creating superadmin:", error);
    process.exit(1);
  }
}

createSuperadmin();







// node main/scripts/createSuperadmin.js
